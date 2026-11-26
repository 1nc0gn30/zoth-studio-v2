import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCron,
  humanizeCron,
  getNextRuns,
  calculateHeatmap,
  toggleHourInExpression,
  transpileCron,
  buildExportBundle,
  auditDst,
  auditFleet,
} from '../src/utils/cronRhythmEngine.js';

test('rejects negative and zero steps without infinite loop', () => {
  for (const bad of ['*/-5 * * * *', '*/-1 * * * *', '*/0 * * * *', '1-10/-2 * * * *']) {
    const ast = parseCron(bad);
    assert.equal(ast.isValid, false, `Expected invalid for ${bad}`);
    assert.match(ast.error, /step/i);
  }
});

test('strict bounds validation rejects out-of-range fields', () => {
  const ast = parseCron('99 99 99 99 99');
  assert.equal(ast.isValid, false);
  assert.match(ast.error, /out of bounds/i);
});

test('supports @macros (@daily, @hourly, @reboot) and named days/months + Sunday 7->0', () => {
  const daily = parseCron('@daily');
  assert.equal(daily.isValid, true);
  assert.deepEqual(daily.fields.minute, [0]);
  assert.deepEqual(daily.fields.hour, [0]);

  const reboot = parseCron('@reboot');
  assert.equal(reboot.isValid, true);
  assert.equal(reboot.isReboot, true);
  assert.equal(getNextRuns(reboot, { count: 5 }).length, 0);
  assert.match(transpileCron(reboot, 'systemd').syntax, /OnBootSec=0/);

  const named = parseCron('0 9 * JAN-MAR MON-FRI');
  assert.equal(named.isValid, true);
  assert.deepEqual(named.fields.month, [1, 2, 3]);
  assert.deepEqual(named.fields.dow, [1, 2, 3, 4, 5]);
  assert.doesNotMatch(humanizeCron(named), /NaN/);

  const sun7 = parseCron('0 0 * * 7');
  assert.equal(sun7.isValid, true);
  assert.deepEqual(sun7.fields.dow, [0]);
  const runs = getNextRuns(sun7, { count: 3, startDate: new Date('2026-11-26T00:00:00Z'), timezone: 'UTC' });
  assert.equal(runs.length, 3);
  assert.equal(runs[0].getUTCDay(), 0);
});

test('POSIX DOM/DOW OR semantics for 0 0 13 * 5', () => {
  const runs = getNextRuns('0 0 13 * 5', {
    count: 5,
    startDate: new Date('2026-11-26T00:00:00Z'),
    timezone: 'UTC',
  });
  const isoDates = runs.map((d) => d.toISOString().slice(0, 10));
  // 2026-11-27 is Friday, 2026-12-04 is Friday, 2026-12-11 is Friday, 2026-12-13 is 13th (Sunday!)
  assert.deepEqual(isoDates.slice(0, 4), ['2026-11-27', '2026-12-04', '2026-12-11', '2026-12-13']);
});

test('leap-year date-jump computes 2028, 2032, 2036 for 0 0 29 2 *', () => {
  const runs = getNextRuns('0 0 29 2 *', {
    count: 3,
    startDate: new Date('2026-11-26T00:00:00Z'),
    timezone: 'UTC',
  });
  assert.deepEqual(
    runs.map((d) => d.toISOString().slice(0, 10)),
    ['2028-02-29', '2032-02-29', '2036-02-29']
  );
});

test('transpiler emits valid Systemd OnCalendar, EventBridge, Quartz & POSIX OR->AND warning', () => {
  const sysStep = transpileCron('*/15 * * * *', 'systemd');
  assert.match(sysStep.syntax, /OnCalendar=\*-\*-\* \*:00\/15:00/);

  const sysDow = transpileCron('30 4 * * 1-5', 'systemd');
  assert.match(sysDow.syntax, /OnCalendar=Mon\.\.Fri \*-\*-\* 04:30:00/);

  const awsDow = transpileCron('30 4 * * 1-5', 'eventbridge');
  assert.equal(awsDow.syntax, 'cron(30 4 ? * MON-FRI *)');

  const quartzDow = transpileCron('30 4 * * 1-5', 'quartz');
  assert.equal(quartzDow.syntax, '0 30 4 ? * MON-FRI *');

  const sysOr = transpileCron('0 0 13 * 5', 'systemd');
  assert.ok(sysOr.warnings.length > 0 && /OR.*AND/i.test(sysOr.warnings[0]));
});

test('DST audit, Fleet optimizer, interactive heatmap toggle & bundle export', () => {
  const dst = auditDst('30 2 * * *', 'America/New_York', 2026);
  assert.equal(dst.risk_level, 'HIGH');
  assert.ok(dst.anomalies.some((a) => a.type === 'SKIPPED_RUN' && a.date === '2026-03-08'));

  const fleet = auditFleet({ a: '0 0 * * *', b: '0 0 * * *', c: '0 0 * * *' });
  assert.equal(fleet.peak_concurrency, 3);
  assert.notEqual(fleet.rebalanced_jobs.a, fleet.rebalanced_jobs.b);

  const toggled = toggleHourInExpression('0 9 * * *', 14);
  assert.equal(toggled, '0 9,14 * * *');

  const hm = calculateHeatmap('*/15 * * * *');
  assert.equal(hm.total_runs_per_week, 672);

  const bundle = buildExportBundle('30 4 * * 1-5', { name: 'etl-job', tz: 'UTC' });
  assert.equal(bundle.isValid, true);
  assert.match(bundle.timer_unit, /OnCalendar=Mon\.\.Fri \*-\*-\* 04:30:00/);
  assert.match(bundle.service_unit, /\[Service\]/);
  assert.match(bundle.crontab_entry, /30 4 \* \* 1-5/);
});

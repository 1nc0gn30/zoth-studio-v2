/**
 * CronRhythm Studio v2.6.0 — Pure ES Module POSIX / Quartz Cron Engine
 * Zero external dependencies. Verified by scripts/test-cron-rhythm-engine.mjs.
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
 */

export const VERSION = '2.6.0';

export const MACROS = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

const MONTH_NAMES = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};
const MONTH_LABELS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DOW_NAMES = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};
const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DOW_SHORT_UPPER = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DOW_SYSTEMD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CURATED_PRESETS = [
  { id: 'heartbeat-5m', category: 'Health & Monitoring', label: 'Every 5 Minutes', cron: '*/5 * * * *', desc: 'Continuous polling and service health probes' },
  { id: 'heartbeat-15m', category: 'Health & Monitoring', label: 'Every 15 Minutes', cron: '*/15 * * * *', desc: 'High-frequency telemetry and queue drain' },
  { id: 'hourly', category: 'System Maintenance', label: 'Hourly (@hourly)', cron: '@hourly', desc: 'Standard hourly sync and metric rollup' },
  { id: 'daily-midnight', category: 'Database & Storage', label: 'Daily Midnight (@daily)', cron: '@daily', desc: 'Nightly database vacuum and backup sealing' },
  { id: 'weekday-morning', category: 'Engineering & CI', label: 'Weekday 04:30 M-F', cron: '30 4 * * 1-5', desc: 'Pre-market weekday ETL pipeline' },
  { id: 'business-hours', category: 'Engineering & CI', label: 'Business Hours (9-17 MON-FRI)', cron: '0 9-17 * * MON-FRI', desc: 'Dispatches checks during workday hours' },
  { id: 'sunday-purge', category: 'System Maintenance', label: 'Sunday 03:00 (0 or 7)', cron: '0 3 * * 7', desc: 'Deep weekly maintenance on Sunday' },
  { id: 'leap-day', category: 'Edge Cases', label: 'Leap Day (Feb 29)', cron: '0 0 29 2 *', desc: 'Executes every 4 years on February 29' },
  { id: 'dom-dow-or', category: 'Edge Cases', label: 'POSIX OR (13th or Fri)', cron: '0 0 13 * 5', desc: 'Fires on 13th of month OR every Friday' },
  { id: 'dst-spring', category: 'DST & Timezone', label: 'DST Spring Gap (02:30)', cron: '30 2 * * *', desc: 'Audit spring-forward skipped runs in US/EU zones' },
];

function parseAtom(raw, minVal, maxVal, nameMap, isDow) {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return { error: 'Empty token value' };
  if (nameMap && Object.prototype.hasOwnProperty.call(nameMap, s)) {
    return { value: nameMap[s] };
  }
  if (!/^-?\d+$/.test(s)) {
    return { error: `Invalid token '${raw}'` };
  }
  const num = Number.parseInt(s, 10);
  const upperBound = isDow ? 7 : maxVal;
  if (num < minVal || num > upperBound) {
    return { error: `Value ${num} out of bounds [${minVal}, ${upperBound}]` };
  }
  return { value: num };
}

export function parseField(fieldStr, minVal, maxVal, fieldName = 'field', nameMap = null, isDow = false) {
  const raw = String(fieldStr || '').trim();
  if (!raw) return { isValid: false, error: `Empty ${fieldName} field` };
  if (raw === '*' || raw === '?') {
    const vals = [];
    for (let i = minVal; i <= maxVal; i++) vals.push(i);
    return { isValid: true, values: vals, isWildcard: raw === '*', isQuestion: raw === '?' };
  }

  const segments = raw.split(',');
  const out = new Set();

  for (const segRaw of segments) {
    const seg = segRaw.trim();
    if (!seg) return { isValid: false, error: `Empty segment in ${fieldName}` };

    const slashParts = seg.split('/');
    if (slashParts.length > 2) {
      return { isValid: false, error: `Invalid step syntax '${seg}' in ${fieldName}` };
    }

    let step = 1;
    if (slashParts.length === 2) {
      const stepStr = slashParts[1].trim();
      if (!/^\d+$/.test(stepStr)) {
        return { isValid: false, error: `Invalid step value '${stepStr}' in ${fieldName} (must be a positive integer)` };
      }
      step = Number.parseInt(stepStr, 10);
      if (!Number.isFinite(step) || step <= 0) {
        return { isValid: false, error: `Invalid step value '${stepStr}' in ${fieldName} (must be >= 1)` };
      }
      if (step > 1000) {
        return { isValid: false, error: `Step value '${step}' too large for ${fieldName}` };
      }
    }

    const rangePart = slashParts[0].trim();
    if (rangePart === '*' || rangePart === '?') {
      for (let i = minVal; i <= maxVal; i += step) out.add(i);
      continue;
    }

    if (rangePart.includes('-')) {
      const dashParts = rangePart.split('-');
      if (dashParts.length !== 2 || !dashParts[0].trim() || !dashParts[1].trim()) {
        return { isValid: false, error: `Invalid range '${rangePart}' in ${fieldName}` };
      }
      const a = parseAtom(dashParts[0], minVal, maxVal, nameMap, isDow);
      if (a.error) return { isValid: false, error: `${a.error} for ${fieldName}` };
      const b = parseAtom(dashParts[1], minVal, maxVal, nameMap, isDow);
      if (b.error) return { isValid: false, error: `${b.error} for ${fieldName}` };

      let start = a.value;
      let end = b.value;
      if (isDow) {
        if (start === 7) start = 0;
        if (end === 0 && start > 0) end = 7;
        if (start > end) return { isValid: false, error: `Range start ${start} > end ${end} in ${fieldName}` };
        for (let i = start; i <= end; i += step) out.add(i % 7);
      } else {
        if (start > end) return { isValid: false, error: `Range start ${start} > end ${end} in ${fieldName}` };
        for (let i = start; i <= end; i += step) out.add(i);
      }
    } else {
      const atom = parseAtom(rangePart, minVal, maxVal, nameMap, isDow);
      if (atom.error) return { isValid: false, error: `${atom.error} for ${fieldName}` };
      if (slashParts.length === 2) {
        const upper = isDow ? 6 : maxVal;
        const startVal = isDow && atom.value === 7 ? 0 : atom.value;
        for (let i = startVal; i <= upper; i += step) out.add(isDow ? i % 7 : i);
      } else {
        out.add(isDow && atom.value === 7 ? 0 : atom.value);
      }
    }
  }

  const sorted = Array.from(out).sort((a, b) => a - b);
  if (sorted.length === 0) return { isValid: false, error: `No valid values parsed for ${fieldName}` };
  return { isValid: true, values: sorted, isWildcard: false, isQuestion: false };
}

export function parseCron(expr) {
  const raw = String(expr || '').trim();
  if (!raw) return { isValid: false, expression: raw, error: 'Cron expression cannot be empty' };
  if (raw.length > 512) return { isValid: false, expression: raw.slice(0, 64), error: 'Cron expression exceeds maximum length' };

  const lower = raw.toLowerCase();
  if (lower === '@reboot') {
    return {
      isValid: true,
      isReboot: true,
      expression: '@reboot',
      expandedExpression: '@reboot',
      fieldCount: 1,
      rawTokens: ['@reboot'],
      fields: { second: [0], minute: [], hour: [], dom: [], month: [], dow: [] },
      domWildcard: true,
      dowWildcard: true,
      error: null,
    };
  }

  const expanded = Object.prototype.hasOwnProperty.call(MACROS, lower) ? MACROS[lower] : raw;
  const tokens = expanded.split(/\s+/);
  if (tokens.length < 5 || tokens.length > 7) {
    return { isValid: false, expression: raw, error: `Expected 5, 6, or 7 fields (or @macro), got ${tokens.length}` };
  }

  let secTok = '0';
  let minTok, hrTok, domTok, monTok, dowTok;
  let yrTok = null;
  let hasSeconds = false;

  if (tokens.length === 5) {
    [minTok, hrTok, domTok, monTok, dowTok] = tokens;
  } else if (tokens.length === 6) {
    hasSeconds = true;
    [secTok, minTok, hrTok, domTok, monTok, dowTok] = tokens;
  } else {
    hasSeconds = true;
    [secTok, minTok, hrTok, domTok, monTok, dowTok, yrTok] = tokens;
  }

  const secRes = hasSeconds ? parseField(secTok, 0, 59, 'second') : { isValid: true, values: [0], isWildcard: false, isQuestion: false };
  if (!secRes.isValid) return { isValid: false, expression: raw, error: secRes.error };

  const minRes = parseField(minTok, 0, 59, 'minute');
  if (!minRes.isValid) return { isValid: false, expression: raw, error: minRes.error };

  const hrRes = parseField(hrTok, 0, 23, 'hour');
  if (!hrRes.isValid) return { isValid: false, expression: raw, error: hrRes.error };

  const domRes = parseField(domTok, 1, 31, 'day_of_month');
  if (!domRes.isValid) return { isValid: false, expression: raw, error: domRes.error };

  const monRes = parseField(monTok, 1, 12, 'month', MONTH_NAMES);
  if (!monRes.isValid) return { isValid: false, expression: raw, error: monRes.error };

  const dowRes = parseField(dowTok, 0, 6, 'day_of_week', DOW_NAMES, true);
  if (!dowRes.isValid) return { isValid: false, expression: raw, error: dowRes.error };

  let years = null;
  if (yrTok && yrTok !== '*') {
    const yrRes = parseField(yrTok, 1970, 2099, 'year');
    if (!yrRes.isValid) return { isValid: false, expression: raw, error: yrRes.error };
    years = yrRes.values;
  }

  return {
    isValid: true,
    isReboot: false,
    hasSeconds,
    expression: raw,
    expandedExpression: expanded,
    fieldCount: tokens.length,
    rawTokens: [minTok, hrTok, domTok, monTok, dowTok],
    fields: {
      second: secRes.values,
      minute: minRes.values,
      hour: hrRes.values,
      dom: domRes.values,
      month: monRes.values,
      dow: dowRes.values,
      year: years,
    },
    domWildcard: domRes.isWildcard || domRes.isQuestion,
    dowWildcard: dowRes.isWildcard || dowRes.isQuestion,
    error: null,
  };
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isDayMatch(year, month, day, ast) {
  const maxD = daysInMonth(year, month);
  if (day < 1 || day > maxD) return false;
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const domMatch = ast.fields.dom.includes(day);
  const dowMatch = ast.fields.dow.includes(dow);
  if (ast.domWildcard && ast.dowWildcard) return true;
  if (ast.domWildcard) return dowMatch;
  if (ast.dowWildcard) return domMatch;
  return domMatch || dowMatch;
}

function formatCompactValues(values, minVal, maxVal) {
  if (!values || values.length === 0) return '*';
  if (values.length >= maxVal - minVal + 1) return '*';
  if (values.length === 1) return String(values[0]);
  const step = values[1] - values[0];
  if (step > 1) {
    let isStep = true;
    for (let i = 1; i < values.length; i++) {
      if (values[i] - values[i - 1] !== step) { isStep = false; break; }
    }
    if (isStep && values[values.length - 1] + step > maxVal) {
      if (values[0] === minVal || values[0] === 0) return `*/${step}`;
      return `${values[0]}-${maxVal}/${step}`;
    }
  }
  let isContiguous = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) { isContiguous = false; break; }
  }
  if (isContiguous) return `${values[0]}-${values[values.length - 1]}`;
  return values.join(',');
}

function formatSystemdTimeField(values, minVal, maxVal) {
  if (!values || values.length === 0 || values.length >= maxVal - minVal + 1) return '*';
  if (values.length === 1) return String(values[0]).padStart(2, '0');
  const step = values[1] - values[0];
  if (step > 1) {
    let isStep = true;
    for (let i = 1; i < values.length; i++) {
      if (values[i] - values[i - 1] !== step) { isStep = false; break; }
    }
    if (isStep && values[0] === 0 && values[values.length - 1] + step > maxVal) {
      return `00/${step}`;
    }
  }
  return values.map((v) => String(v).padStart(2, '0')).join(',');
}

export function humanizeCron(exprOrAst) {
  const ast = typeof exprOrAst === 'string' ? parseCron(exprOrAst) : exprOrAst;
  if (!ast || !ast.isValid) {
    return `Invalid cron expression: ${ast ? ast.error : 'Empty input'}`;
  }
  if (ast.isReboot) return 'Runs once at system startup (@reboot).';

  const { minute, hour, dom, month, dow } = ast.fields;
  const minCompact = formatCompactValues(minute, 0, 59);
  const hrCompact = formatCompactValues(hour, 0, 23);
  const parts = [];

  if (minute.length === 60 && hour.length === 24) {
    parts.push('Every minute');
  } else if (minCompact.startsWith('*/') && hour.length === 24) {
    parts.push(`Every ${minCompact.slice(2)} minutes`);
  } else if (minute.length === 1 && minute[0] === 0 && hrCompact.startsWith('*/')) {
    parts.push(`Every ${hrCompact.slice(2)} hours on the hour`);
  } else if (minute.length === 1 && minute[0] === 0 && hour.length === 24) {
    parts.push('Every hour on the hour');
  } else if (minute.length === 1 && hour.length === 1) {
    const h = hour[0];
    const m = String(minute[0]).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    parts.push(`At ${String(h).padStart(2, '0')}:${m} (${h12}:${m} ${period})`);
  } else {
    const minText = minCompact === '*' ? 'every minute' : minCompact.startsWith('*/') ? `every ${minCompact.slice(2)} minutes` : `at minute ${minCompact}`;
    const hrText = hrCompact === '*' ? 'past every hour' : hrCompact.startsWith('*/') ? `every ${hrCompact.slice(2)} hours` : `during hour ${hrCompact}`;
    parts.push(`${minText.charAt(0).toUpperCase() + minText.slice(1)} ${hrText}`);
  }

  const domRestricted = !ast.domWildcard;
  const dowRestricted = !ast.dowWildcard;
  const formatDowNames = (vals) => {
    if (vals.join(',') === '1,2,3,4,5') return 'Monday through Friday';
    if (vals.join(',') === '0,6') return 'weekends (Saturday and Sunday)';
    return vals.map((d) => DOW_FULL[d]).join(', ');
  };

  if (domRestricted && dowRestricted) {
    parts.push(`on day-of-month ${formatCompactValues(dom, 1, 31)} OR on ${formatDowNames(dow)} (POSIX OR)`);
  } else if (domRestricted) {
    parts.push(`on day ${formatCompactValues(dom, 1, 31)} of the month`);
  } else if (dowRestricted) {
    parts.push(`on ${formatDowNames(dow)}`);
  } else {
    parts.push('every day');
  }

  if (month.length < 12) {
    parts.push(`in ${month.map((m) => MONTH_LABELS[m]).join(', ')}`);
  }

  return `${parts.join(', ')}.`;
}

export function getNextRuns(exprOrAst, options = {}) {
  const opts = typeof options === 'number' ? { count: options } : options;
  const count = Math.max(1, Math.min(Number(opts.count) || 8, 50));
  const mode = opts.timezone || 'UTC';
  const ast = typeof exprOrAst === 'string' ? parseCron(exprOrAst) : exprOrAst;
  if (!ast || !ast.isValid || ast.isReboot) return [];

  const start = opts.startDate ? new Date(opts.startDate.getTime()) : new Date();
  const useUtc = mode === 'UTC';

  const base = useUtc
    ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes() + 1, 0, 0))
    : new Date(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes() + 1, 0, 0);

  let y = useUtc ? base.getUTCFullYear() : base.getFullYear();
  let mo = (useUtc ? base.getUTCMonth() : base.getMonth()) + 1;
  let d = useUtc ? base.getUTCDate() : base.getDate();
  let h = useUtc ? base.getUTCHours() : base.getHours();
  let mi = useUtc ? base.getUTCMinutes() : base.getMinutes();

  const years = ast.fields.year;
  const months = ast.fields.month;
  const hours = ast.fields.hour;
  const minutes = ast.fields.minute;
  const endYear = years ? Math.min(years[years.length - 1], y + 20) : y + 16;

  const runs = [];
  let guard = 0;

  while (runs.length < count && y <= endYear && guard < 20000) {
    guard++;

    if (years && !years.includes(y)) {
      const nextY = years.find((val) => val > y);
      if (nextY === undefined || nextY > endYear) break;
      y = nextY; mo = months[0]; d = 1; h = hours[0]; mi = minutes[0];
      continue;
    }

    if (!months.includes(mo)) {
      const nextMo = months.find((val) => val > mo);
      if (nextMo === undefined) { y++; mo = months[0]; } else { mo = nextMo; }
      d = 1; h = hours[0]; mi = minutes[0];
      continue;
    }

    const maxD = daysInMonth(y, mo);
    if (d > maxD) {
      mo++; d = 1; h = hours[0]; mi = minutes[0];
      if (mo > 12) { y++; mo = 1; }
      continue;
    }

    if (!isDayMatch(y, mo, d, ast)) {
      d++; h = hours[0]; mi = minutes[0];
      continue;
    }

    if (!hours.includes(h)) {
      const nextH = hours.find((val) => val > h);
      if (nextH === undefined) { d++; h = hours[0]; } else { h = nextH; }
      mi = minutes[0];
      continue;
    }

    if (!minutes.includes(mi)) {
      const nextMi = minutes.find((val) => val > mi);
      if (nextMi === undefined) {
        h++; mi = minutes[0];
        if (h > 23) { d++; h = hours[0]; }
      } else {
        mi = nextMi;
      }
      continue;
    }

    const dt = useUtc
      ? new Date(Date.UTC(y, mo - 1, d, h, mi, 0, 0))
      : new Date(y, mo - 1, d, h, mi, 0, 0);

    const validWall = useUtc || (
      dt.getFullYear() === y &&
      dt.getMonth() + 1 === mo &&
      dt.getDate() === d &&
      dt.getHours() === h &&
      dt.getMinutes() === mi
    );
    if (validWall) runs.push(dt);

    mi++;
    if (mi > 59) {
      mi = 0; h++;
      if (h > 23) {
        h = 0; d++;
        if (d > maxD) {
          d = 1; mo++;
          if (mo > 12) { mo = 1; y++; }
        }
      }
    }
  }

  return runs;
}

export function calculateHeatmap(exprOrAst) {
  const ast = typeof exprOrAst === 'string' ? parseCron(exprOrAst) : exprOrAst;
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  if (!ast || !ast.isValid || ast.isReboot) {
    return {
      matrix: dayOrder.map(() => Array.from({ length: 24 }, () => ({ execution_count: 0, active: false }))),
      total_runs_per_week: 0,
      peak_hour: 0,
      active_hours: [],
    };
  }

  const minsPerActiveHour = ast.fields.minute.length;
  const hourSet = new Set(ast.fields.hour);
  const dowSet = new Set(ast.fields.dow);
  const domRestricted = !ast.domWildcard;
  const dowRestricted = !ast.dowWildcard;
  const monthScale = ast.fields.month.length / 12;
  const domProb = ast.fields.dom.length / 30.4375;

  const matrix = [];
  let totalRuns = 0;
  const hourCounts = new Array(24).fill(0);

  dayOrder.forEach((dayNum) => {
    const row = [];
    let dayFactor = 0;
    if (!domRestricted && !dowRestricted) dayFactor = 1.0 * monthScale;
    else if (!domRestricted && dowRestricted) dayFactor = (dowSet.has(dayNum) ? 1.0 : 0.0) * monthScale;
    else if (domRestricted && !dowRestricted) dayFactor = domProb * monthScale;
    else dayFactor = (dowSet.has(dayNum) ? 1.0 : domProb) * monthScale;

    for (let h = 0; h < 24; h++) {
      let count = 0;
      if (hourSet.has(h) && dayFactor > 0) {
        const rawCount = minsPerActiveHour * dayFactor;
        count = rawCount < 1 && rawCount > 0 ? Number(rawCount.toFixed(2)) : Math.round(rawCount);
      }
      row.push({ execution_count: count, active: hourSet.has(h) && dayFactor > 0 });
      totalRuns += count;
      hourCounts[h] += count;
    }
    matrix.push(row);
  });

  let peakHour = 0;
  let maxCount = -1;
  hourCounts.forEach((c, h) => {
    if (c > maxCount) { maxCount = c; peakHour = h; }
  });

  return {
    matrix,
    total_runs_per_week: Math.round(totalRuns * 100) / 100,
    peak_hour: peakHour,
    active_hours: ast.fields.hour.slice(),
  };
}

export function toggleHourInExpression(expr, targetHour) {
  const ast = parseCron(expr);
  if (!ast.isValid || ast.isReboot) return expr;
  const set = new Set(ast.fields.hour);
  if (set.has(targetHour)) {
    if (set.size > 1) set.delete(targetHour);
  } else {
    set.add(targetHour);
  }
  const nextHours = formatCompactValues(Array.from(set).sort((a, b) => a - b), 0, 23);
  const [minTok, , domTok, monTok, dowTok] = ast.rawTokens;
  return `${minTok} ${nextHours} ${domTok} ${monTok} ${dowTok}`;
}

function formatAwsQuartzDow(dows) {
  if (dows.join(',') === '1,2,3,4,5') return 'MON-FRI';
  return dows.map((d) => DOW_SHORT_UPPER[d]).join(',');
}

export function transpileCron(exprOrAst, target = 'systemd') {
  const ast = typeof exprOrAst === 'string' ? parseCron(exprOrAst) : exprOrAst;
  if (!ast || !ast.isValid) {
    return {
      syntax: `# Invalid cron expression\n# ${ast ? ast.error : 'Empty input'}`,
      desc: 'Fix cron syntax to emit scheduler configuration.',
      warnings: [ast ? ast.error : 'Invalid syntax'],
    };
  }

  const warnings = [];
  const unixExpr = ast.isReboot
    ? '@reboot'
    : [
        formatCompactValues(ast.fields.minute, 0, 59),
        formatCompactValues(ast.fields.hour, 0, 23),
        ast.domWildcard ? '*' : formatCompactValues(ast.fields.dom, 1, 31),
        formatCompactValues(ast.fields.month, 1, 12),
        ast.dowWildcard ? '*' : formatCompactValues(ast.fields.dow, 0, 6),
      ].join(' ');

  const domRestricted = !ast.domWildcard;
  const dowRestricted = !ast.dowWildcard;

  if (target === 'unix' || target === 'crontab') {
    return {
      syntax: `# CronRhythm Studio v${VERSION} — ${humanizeCron(ast)}\n${unixExpr} /usr/local/bin/zoth-agent-tick >> /var/log/zoth/rhythm.log 2>&1`,
      desc: 'Standard 5-field Vixie/POSIX crontab entry.',
      warnings,
    };
  }

  if (target === 'kubernetes') {
    if (ast.isReboot) warnings.push('Kubernetes CronJob does not support @reboot.');
    return {
      syntax: `apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: cron-rhythm-worker\nspec:\n  schedule: "${unixExpr}"\n  concurrencyPolicy: Forbid\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          containers:\n            - name: worker\n              image: alpine:3.20\n              command: ["/bin/sh", "-c", "echo job-run"]\n          restartPolicy: OnFailure`,
      desc: 'Kubernetes batch/v1 CronJob YAML with concurrencyPolicy: Forbid.',
      warnings,
    };
  }

  if (target === 'github') {
    if (ast.isReboot) warnings.push('GitHub Actions does not support @reboot.');
    warnings.push('GitHub Actions runs scheduled workflows in UTC (minimum 5-minute interval).');
    return {
      syntax: `name: Scheduled Pipeline\non:\n  schedule:\n    - cron: '${unixExpr}'\n  workflow_dispatch:\njobs:\n  run:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo "Scheduled trigger"`,
      desc: 'GitHub Actions scheduled workflow trigger (UTC).',
      warnings,
    };
  }

  if (target === 'eventbridge') {
    if (ast.isReboot) {
      warnings.push('AWS EventBridge does not support @reboot.');
      return { syntax: 'cron(0 0 1 1 ? 2099)', desc: 'EventBridge unsupported reboot fallback.', warnings };
    }
    const minTok = formatCompactValues(ast.fields.minute, 0, 59);
    const hrTok = formatCompactValues(ast.fields.hour, 0, 23);
    const monTok = formatCompactValues(ast.fields.month, 1, 12);
    let domTok = '*';
    let dowTok = '?';
    if (domRestricted && !dowRestricted) {
      domTok = formatCompactValues(ast.fields.dom, 1, 31);
    } else if (dowRestricted && !domRestricted) {
      domTok = '?';
      dowTok = formatAwsQuartzDow(ast.fields.dow);
    } else if (domRestricted && dowRestricted) {
      domTok = formatCompactValues(ast.fields.dom, 1, 31);
      warnings.push('AWS EventBridge requires "?" in either Day-of-Month or Day-of-Week; Day-of-Week was set to "?".');
    }
    return {
      syntax: `cron(${minTok} ${hrTok} ${domTok} ${monTok} ${dowTok} *)`,
      desc: 'AWS EventBridge 6-field UTC schedule rule.',
      warnings,
    };
  }

  if (target === 'quartz') {
    if (ast.isReboot) {
      warnings.push('Quartz Scheduler does not support @reboot directly.');
      return { syntax: '0 0 0 1 1 ? *', desc: 'Quartz static fallback.', warnings };
    }
    const secTok = formatCompactValues(ast.fields.second || [0], 0, 59);
    const minTok = formatCompactValues(ast.fields.minute, 0, 59);
    const hrTok = formatCompactValues(ast.fields.hour, 0, 23);
    const monTok = formatCompactValues(ast.fields.month, 1, 12);
    let domTok = '*';
    let dowTok = '?';
    if (domRestricted && !dowRestricted) {
      domTok = formatCompactValues(ast.fields.dom, 1, 31);
    } else if (dowRestricted && !domRestricted) {
      domTok = '?';
      dowTok = formatAwsQuartzDow(ast.fields.dow);
    } else if (domRestricted && dowRestricted) {
      domTok = formatCompactValues(ast.fields.dom, 1, 31);
      warnings.push('Quartz does not allow both Day-of-Month and Day-of-Week; Day-of-Week set to "?".');
    }
    return {
      syntax: `${secTok} ${minTok} ${hrTok} ${domTok} ${monTok} ${dowTok} *`,
      desc: 'Quartz 7-field expression (sec min hour dom month dow year).',
      warnings,
    };
  }

  // Default: systemd
  if (ast.isReboot) {
    return {
      syntax: `[Unit]\nDescription=CronRhythm Studio Boot Timer\nWants=network-online.target\n\n[Timer]\nOnBootSec=0\nPersistent=true\n\n[Install]\nWantedBy=timers.target`,
      onCalendar: 'OnBootSec=0',
      desc: 'Systemd OnBootSec boot trigger unit.',
      warnings,
    };
  }

  let dowPrefix = '';
  if (dowRestricted) {
    if (ast.fields.dow.join(',') === '1,2,3,4,5') dowPrefix = 'Mon..Fri ';
    else if (ast.fields.dow.join(',') === '0,6') dowPrefix = 'Sat,Sun ';
    else dowPrefix = `${ast.fields.dow.map((d) => DOW_SYSTEMD[d]).join(',')} `;
  }
  const monPart = ast.fields.month.length === 12 ? '*' : ast.fields.month.map((m) => String(m).padStart(2, '0')).join(',');
  const domPart = !domRestricted ? '*' : ast.fields.dom.map((d) => String(d).padStart(2, '0')).join(',');
  const hrPart = formatSystemdTimeField(ast.fields.hour, 0, 23);
  const minPart = formatSystemdTimeField(ast.fields.minute, 0, 59);
  const secPart = formatSystemdTimeField(ast.fields.second || [0], 0, 59);

  if (domRestricted && dowRestricted) {
    warnings.push(
      'Semantic warning: POSIX cron combines Day-of-Month and Day-of-Week with OR, whereas systemd OnCalendar combines them with AND. Use two OnCalendar= lines if POSIX OR semantics are required.'
    );
  }

  const onCalendar = `OnCalendar=${dowPrefix}*-${monPart}-${domPart} ${hrPart}:${minPart}:${secPart}`;
  return {
    syntax: `[Unit]\nDescription=CronRhythm Studio Scheduled Timer\nWants=network-online.target\n\n[Timer]\n${onCalendar}\nPersistent=true\n\n[Install]\nWantedBy=timers.target`,
    onCalendar,
    desc: 'Systemd OnCalendar timer unit with persistent boot recovery.',
    warnings,
  };
}

export function buildExportBundle(expr, opts = {}) {
  const slug = String(opts.name || 'cron-rhythm-job').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'cron-rhythm-job';
  const cmd = String(opts.command || '/usr/local/bin/zoth-agent-tick').replace(/[\r\n]+/g, ' ').trim();
  const tz = String(opts.tz || 'UTC').replace(/[^a-zA-Z0-9_/+-]/g, '');
  const ast = parseCron(expr);
  if (!ast.isValid) return { isValid: false, error: ast.error };
  const sys = transpileCron(ast, 'systemd');
  const unix = transpileCron(ast, 'unix');
  const timerUnit = `${sys.syntax.replace('Persistent=true', `Persistent=true\nUnit=${slug}.service`)}\n`;
  const serviceUnit = `[Unit]\nDescription=CronRhythm Studio Service (${slug})\nAfter=network-online.target\n\n[Service]\nType=oneshot\nEnvironment=TZ=${tz}\nExecStart=${cmd}\n`;
  const crontabEntry = `# CronRhythm Studio v${VERSION} — ${humanizeCron(ast)}\nCRON_TZ=${tz}\n${unix.syntax.split('\n').pop()}\n`;
  return {
    isValid: true,
    name: slug,
    expression: expr,
    timer_unit: timerUnit,
    service_unit: serviceUnit,
    crontab_entry: crontabEntry,
    warnings: sys.warnings,
    combinedText: `# === ${slug}.timer ===\n${timerUnit}\n# === ${slug}.service ===\n${serviceUnit}\n# === ${slug}.crontab ===\n${crontabEntry}`,
  };
}

function getTzParts(date, tzName) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tzName,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZoneName: 'shortOffset',
  });
  const parts = {};
  for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    offset: parts.timeZoneName || 'UTC',
  };
}

export function auditDst(expr, tzName = 'America/New_York', referenceYear = new Date().getUTCFullYear()) {
  const ast = parseCron(expr);
  const year = Number(referenceYear) || new Date().getUTCFullYear();
  if (!ast.isValid || ast.isReboot) {
    return { expression: expr, timezone: tzName, year, risk_level: 'INVALID', anomalies: [], safe_expression: expr };
  }
  const anomalies = [];
  let prevOff = null;
  for (let dayOfYear = 0; dayOfYear < 366; dayOfYear++) {
    const probe = new Date(Date.UTC(year, 0, 1 + dayOfYear, 12, 0, 0));
    if (probe.getUTCFullYear() !== year) break;
    let curOff;
    try {
      curOff = getTzParts(probe, tzName).offset;
    } catch {
      return { expression: expr, timezone: tzName, year, risk_level: 'UNKNOWN_TZ', anomalies: [], safe_expression: expr };
    }
    if (prevOff !== null && curOff !== prevOff) {
      const startMs = probe.getTime() - 24 * 3600 * 1000;
      let lastParts = getTzParts(new Date(startMs), tzName);
      for (let h = 1; h <= 24; h++) {
        const curParts = getTzParts(new Date(startMs + h * 3600 * 1000), tzName);
        if (curParts.offset !== lastParts.offset) {
          const expectedHour = (lastParts.hour + 1) % 24;
          if (curParts.hour > expectedHour || (expectedHour === 23 && curParts.hour === 1)) {
            if (ast.fields.hour.includes(expectedHour) && ast.fields.month.includes(curParts.month)) {
              anomalies.push({
                type: 'SKIPPED_RUN',
                date: `${curParts.year}-${String(curParts.month).padStart(2, '0')}-${String(curParts.day).padStart(2, '0')}`,
                hour: expectedHour,
                detail: `Wall-clock ${String(expectedHour).padStart(2, '0')}:xx does not exist in ${tzName} (${lastParts.offset} -> ${curParts.offset}).`,
              });
            }
          } else if (ast.fields.hour.includes(curParts.hour) && ast.fields.month.includes(curParts.month)) {
            anomalies.push({
              type: 'DUPLICATE_RISK',
              date: `${curParts.year}-${String(curParts.month).padStart(2, '0')}-${String(curParts.day).padStart(2, '0')}`,
              hour: curParts.hour,
              detail: `Wall-clock ${String(curParts.hour).padStart(2, '0')}:xx repeats twice in ${tzName} (${lastParts.offset} -> ${curParts.offset}).`,
            });
          }
          break;
        }
        lastParts = curParts;
      }
    }
    prevOff = curOff;
  }

  const safeHours = ast.fields.hour.map((h) => (anomalies.some((a) => a.hour === h) ? (h + 1) % 24 : h));
  const safeExpr = anomalies.length > 0
    ? `${ast.rawTokens[0]} ${formatCompactValues(Array.from(new Set(safeHours)).sort((a, b) => a - b), 0, 23)} ${ast.rawTokens[2]} ${ast.rawTokens[3]} ${ast.rawTokens[4]}`
    : expr;

  return {
    expression: expr,
    timezone: tzName,
    year,
    risk_level: anomalies.length === 0 ? 'SAFE' : anomalies.some((a) => a.type === 'SKIPPED_RUN') ? 'HIGH' : 'MEDIUM',
    anomalies,
    safe_expression: safeExpr,
  };
}

export function auditFleet(jobsMap) {
  const entries = Object.entries(jobsMap || {});
  const buckets = new Map();
  const start = new Date();
  start.setUTCSeconds(0, 0);
  const horizonEnd = new Date(start.getTime() + 24 * 3600 * 1000);

  for (const [name, expr] of entries) {
    const runs = getNextRuns(expr, { count: 48, startDate: start, timezone: 'UTC' })
      .filter((d) => d.getTime() <= horizonEnd.getTime());
    for (const dt of runs) {
      const key = dt.toISOString().slice(0, 16);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(name);
    }
  }

  const collisions = [];
  for (const [ts, jobs] of buckets.entries()) {
    if (jobs.length > 1) collisions.push({ timestamp: ts, concurrency: jobs.length, jobs });
  }
  collisions.sort((a, b) => b.concurrency - a.concurrency);

  const rebalanced = {};
  entries.forEach(([name, expr], idx) => {
    const ast = parseCron(expr);
    if (ast.isValid && !ast.isReboot && ast.fields.minute.length === 1) {
      const shiftedMin = (ast.fields.minute[0] + idx * 7) % 60;
      rebalanced[name] = `${shiftedMin} ${ast.rawTokens[1]} ${ast.rawTokens[2]} ${ast.rawTokens[3]} ${ast.rawTokens[4]}`;
    } else {
      rebalanced[name] = expr;
    }
  });

  return {
    job_count: entries.length,
    peak_concurrency: collisions.length > 0 ? collisions[0].concurrency : (entries.length > 0 ? 1 : 0),
    collision_count: collisions.length,
    top_collisions: collisions.slice(0, 6),
    rebalanced_jobs: rebalanced,
  };
}

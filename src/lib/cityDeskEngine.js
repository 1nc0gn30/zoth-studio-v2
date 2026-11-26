/**
 * City Desk Canonical Engine (v2.6.0)
 * Pure testable module shared by CityDeskGodModeTool and Node unit tests.
 * Exact parity with ~/NullAITech/city-desk/data.js (20 trades x 50 US cities = 1,000 pages).
 */

export const CITY_DESK_VERSION = '2.6.0';
export const CITY_DESK_LOCAL_API = 'http://127.0.0.1:8087';

export const CANONICAL_TRADES = [
  { slug: 'painters', name: 'Painters', price: 800, line: 'Interior, exterior, and a written price before the first can opens.', scopes: ['Interior Rooms', 'Exterior Siding', 'Kitchen Cabinets'] },
  { slug: 'plumbers', name: 'Plumbers', price: 900, line: 'Leaks, drains, fixtures, and water heaters, with emergency work kept separate.', scopes: ['Leak & Drain Service', 'Fixture Replacement', 'Water Heater Swap'] },
  { slug: 'hvac', name: 'HVAC shops', price: 1100, line: 'A tune-up path and a no-cool or no-heat path, written as two different visits.', scopes: ['Seasonal Tune-Up', 'No-Cool / No-Heat Repair', 'Full System Replacement'] },
  { slug: 'roofers', name: 'Roofers', price: 1000, line: 'Inspections, repairs, and full replacements, started from a ground photo.', scopes: ['Roof Inspection', 'Leak & Flashing Repair', 'Full Tear-Off & Re-Roof'] },
  { slug: 'electricians', name: 'Electricians', price: 1000, line: 'Small repairs and panel work sorted into two paths before the truck rolls.', scopes: ['Outlets & Circuits', 'EV Charger / Dedicated Line', '200A Panel Upgrade'] },
  { slug: 'garage-doors', name: 'Garage door shops', price: 700, line: 'A stuck door, a spring, or an opener, with the symptom in the first line.', scopes: ['Opener & Sensor Repair', 'Torsion Spring Swap', 'Full Door Replacement'] },
  { slug: 'landscapers', name: 'Landscapers', price: 800, line: 'Weekly maintenance and one-time cleanups as two different bookings.', scopes: ['Weekly Maintenance', 'Seasonal Perimeter Cleanup', 'Hardscape & Sod Install'] },
  { slug: 'cleaners', name: 'House cleaners', price: 700, line: 'A recurring clean and a first deep clean, with supplies and pets answered.', scopes: ['Recurring Home Clean', 'First Deep Clean', 'Move-In / Move-Out Turn'] },
  { slug: 'detailers', name: 'Mobile detailers', price: 700, line: 'A mobile visit at the driveway, with packages named in words and prices said before the day.', scopes: ['Interior Reset', 'Full Exterior & Wax', 'Complete Showroom Detail'] },
  { slug: 'junk-removal', name: 'Junk removal', price: 700, line: 'A load priced from photos, plus a short list of what will not be hauled.', scopes: ['Single-Item / Curb Pickup', 'Half-Truck Garage Cleanout', 'Full Estate / Construction Load'] },
  { slug: 'pest-control', name: 'Pest control', price: 800, line: 'Ants, cockroaches, and rodents, with a one-time visit and a recurring plan.', scopes: ['One-Time Perimeter Treatment', 'Rodent Exclusion Inspection', 'Quarterly Barrier Plan'] },
  { slug: 'movers', name: 'Movers', price: 900, line: 'Local moves priced from rooms, stairs, and a date.', scopes: ['Studio / 1-Bedroom Move', '2–3 Bedroom Home Move', 'Full Pack + Local Move'] },
  { slug: 'groomers', name: 'Pet groomers', price: 700, line: 'Dogs, a first visit, and what to bring. Cats only if the owner adds them.', scopes: ['Bath & Brush', 'Full Breed Haircut', 'Puppy First Visit + Nails'] },
  { slug: 'dentists', name: 'Dental offices', price: 1500, line: 'A new-patient first visit, with insurance named by the office beside the phone.', scopes: ['New Patient Exam & X-Rays', 'Routine Hygiene & Cleaning', 'Same-Day Toothache Consult'] },
  { slug: 'med-spas', name: 'Med spas', price: 1400, line: 'A consult page. A clinician decides what is appropriate. Results vary.', scopes: ['Clinician Skin Consult', 'Targeted Facial Protocol', 'Multi-Session Treatment Plan'] },
  { slug: 'gyms', name: 'Gyms', price: 900, line: 'Who the gym is for, what the first week includes, and a start price said by the owner.', scopes: ['7-Day Intro Pass', 'Monthly Open Gym', 'Coached Small-Group Track'] },
  { slug: 'restaurants', name: 'Restaurants', price: 1200, line: 'Hours, one house dish, and how to get a table tonight.', scopes: ['Table Reservation Tonight', 'Direct Takeout Order', 'Private Group Dining'] },
  { slug: 'food-trucks', name: 'Food trucks', price: 800, line: 'This week’s stops, three items, and what happens in bad weather.', scopes: ['Weekly Public Stops', 'Office Lunch Pop-Up', 'Private Event Catering'] },
  { slug: 'auto-repair', name: 'Auto repair shops', price: 1000, line: 'An estimate you can read before the car is repaired, and a list of work the shop does not guess at.', scopes: ['Diagnostic & Brake Check', 'Scheduled Maintenance', 'Major Mechanical Repair'] },
  { slug: 'property-managers', name: 'Property managers', price: 1300, line: 'A door for owners and a different door for tenants, with the fee in plain words.', scopes: ['Single-Family Owner Intake', 'Multi-Unit Portfolio', 'Tenant Placement Only'] },
];

export const CANONICAL_CITIES = [
  { slug: 'boise-id', name: 'Boise', state: 'ID' },
  { slug: 'spokane-wa', name: 'Spokane', state: 'WA' },
  { slug: 'tacoma-wa', name: 'Tacoma', state: 'WA' },
  { slug: 'eugene-or', name: 'Eugene', state: 'OR' },
  { slug: 'salem-or', name: 'Salem', state: 'OR' },
  { slug: 'bend-or', name: 'Bend', state: 'OR' },
  { slug: 'reno-nv', name: 'Reno', state: 'NV' },
  { slug: 'tucson-az', name: 'Tucson', state: 'AZ' },
  { slug: 'albuquerque-nm', name: 'Albuquerque', state: 'NM' },
  { slug: 'el-paso-tx', name: 'El Paso', state: 'TX' },
  { slug: 'lubbock-tx', name: 'Lubbock', state: 'TX' },
  { slug: 'amarillo-tx', name: 'Amarillo', state: 'TX' },
  { slug: 'corpus-christi-tx', name: 'Corpus Christi', state: 'TX' },
  { slug: 'shreveport-la', name: 'Shreveport', state: 'LA' },
  { slug: 'lafayette-la', name: 'Lafayette', state: 'LA' },
  { slug: 'mobile-al', name: 'Mobile', state: 'AL' },
  { slug: 'huntsville-al', name: 'Huntsville', state: 'AL' },
  { slug: 'montgomery-al', name: 'Montgomery', state: 'AL' },
  { slug: 'jackson-ms', name: 'Jackson', state: 'MS' },
  { slug: 'little-rock-ar', name: 'Little Rock', state: 'AR' },
  { slug: 'fayetteville-ar', name: 'Fayetteville', state: 'AR' },
  { slug: 'tulsa-ok', name: 'Tulsa', state: 'OK' },
  { slug: 'wichita-ks', name: 'Wichita', state: 'KS' },
  { slug: 'des-moines-ia', name: 'Des Moines', state: 'IA' },
  { slug: 'cedar-rapids-ia', name: 'Cedar Rapids', state: 'IA' },
  { slug: 'omaha-ne', name: 'Omaha', state: 'NE' },
  { slug: 'sioux-falls-sd', name: 'Sioux Falls', state: 'SD' },
  { slug: 'fargo-nd', name: 'Fargo', state: 'ND' },
  { slug: 'billings-mt', name: 'Billings', state: 'MT' },
  { slug: 'madison-wi', name: 'Madison', state: 'WI' },
  { slug: 'green-bay-wi', name: 'Green Bay', state: 'WI' },
  { slug: 'grand-rapids-mi', name: 'Grand Rapids', state: 'MI' },
  { slug: 'ann-arbor-mi', name: 'Ann Arbor', state: 'MI' },
  { slug: 'fort-wayne-in', name: 'Fort Wayne', state: 'IN' },
  { slug: 'raleigh-nc', name: 'Raleigh', state: 'NC' },
  { slug: 'norfolk-va', name: 'Norfolk', state: 'VA' },
  { slug: 'toledo-oh', name: 'Toledo', state: 'OH' },
  { slug: 'dayton-oh', name: 'Dayton', state: 'OH' },
  { slug: 'akron-oh', name: 'Akron', state: 'OH' },
  { slug: 'lexington-ky', name: 'Lexington', state: 'KY' },
  { slug: 'knoxville-tn', name: 'Knoxville', state: 'TN' },
  { slug: 'chattanooga-tn', name: 'Chattanooga', state: 'TN' },
  { slug: 'greenville-sc', name: 'Greenville', state: 'SC' },
  { slug: 'savannah-ga', name: 'Savannah', state: 'GA' },
  { slug: 'augusta-ga', name: 'Augusta', state: 'GA' },
  { slug: 'chesapeake-va', name: 'Chesapeake', state: 'VA' },
  { slug: 'springfield-mo', name: 'Springfield', state: 'MO' },
  { slug: 'fort-collins-co', name: 'Fort Collins', state: 'CO' },
  { slug: 'provo-ut', name: 'Provo', state: 'UT' },
  { slug: 'gainesville-fl', name: 'Gainesville', state: 'FL' },
];

export const DISPATCH_MULTIPLIERS = [
  { id: 'standard', label: 'Standard Scheduled Visit', mult: 1.0 },
  { id: 'priority', label: 'Priority Same-Week Dispatch', mult: 1.35 },
  { id: 'full', label: 'Multi-Area / Full System Scope', mult: 1.75 },
];

export function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export function safeJsonLdString(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');
}

export function sanitizeTel(phone) {
  return String(phone || '').replace(/[^0-9+]/g, '');
}

export function calculateWrittenQuote(tradeSlug, scopeIndex = 0, urgencyMult = 1.0) {
  const trade = CANONICAL_TRADES.find((t) => t.slug === tradeSlug) || CANONICAL_TRADES[0];
  const basePairs = [
    [185, 420],
    [340, 780],
    [650, 1450],
  ];
  const idx = Math.max(0, Math.min(basePairs.length - 1, Number(scopeIndex) || 0));
  const [rawLow, rawHigh] = basePairs[idx];
  const tradeScale = Math.max(0.75, Math.min(1.6, trade.price / 900));
  const mult = Number(urgencyMult) > 0 ? Number(urgencyMult) : 1.0;
  const low = Math.round((rawLow * tradeScale * mult) / 5) * 5;
  const high = Math.round((rawHigh * tradeScale * mult) / 5) * 5;
  return {
    tradeSlug: trade.slug,
    tradeName: trade.name,
    scopeName: trade.scopes[idx] || trade.scopes[0],
    low,
    high,
    formatted: `$${low.toLocaleString('en-US')} – $${high.toLocaleString('en-US')}`,
    referencePageValuation: trade.price,
  };
}

export function buildPreviewPath(citySlug, tradeSlug, { biz = '', phone = '', email = '' } = {}) {
  const qs = new URLSearchParams();
  if (biz.trim()) qs.set('biz', biz.trim());
  if (phone.trim()) qs.set('phone', phone.trim());
  if (email.trim()) qs.set('email', email.trim());
  const query = qs.toString();
  return `/cities/${encodeURIComponent(citySlug)}/${encodeURIComponent(tradeSlug)}/${query ? `?${query}` : ''}`;
}

export function synthesizeStandaloneHtml({
  tradeSlug = 'painters',
  citySlug = 'boise-id',
  biz = 'Your Business Name',
  phone = '',
  email = '',
} = {}) {
  const trade = CANONICAL_TRADES.find((t) => t.slug === tradeSlug) || CANONICAL_TRADES[0];
  const city = CANONICAL_CITIES.find((c) => c.slug === citySlug) || CANONICAL_CITIES[0];
  const place = `${city.name}, ${city.state}`;
  const cleanBiz = String(biz || 'Your Business Name').trim();
  const cleanPhone = String(phone || '').trim();
  const cleanEmail = String(email || '').trim();
  const telHref = sanitizeTel(cleanPhone);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: cleanBiz,
        description: `${trade.name} in ${place}. ${trade.line}`,
        areaServed: {
          '@type': 'City',
          name: city.name,
          address: { '@type': 'PostalAddress', addressRegion: city.state, addressCountry: 'US' },
        },
        ...(cleanPhone ? { telephone: cleanPhone } : {}),
        ...(cleanEmail ? { email: cleanEmail } : {}),
      },
      {
        '@type': 'Service',
        name: `${trade.name} in ${place}`,
        serviceType: trade.name,
        description: trade.line,
        offers: { '@type': 'Offer', price: String(trade.price), priceCurrency: 'USD' },
      },
    ],
  };

  const callButton = telHref
    ? `<a class="call-btn" href="tel:${escapeHtml(telHref)}">Call ${escapeHtml(cleanPhone)}</a>`
    : '<a class="call-btn" href="#contact">Request Written Estimate</a>';

  const phoneDisplay = telHref
    ? `<a href="tel:${escapeHtml(telHref)}" style="color:#F5D77F;text-decoration:none;font-weight:700;">${escapeHtml(cleanPhone)}</a>`
    : '<span>Your business phone</span>';

  const emailDisplay = cleanEmail
    ? `<a href="mailto:${escapeHtml(cleanEmail)}" style="color:#F5D77F;text-decoration:none;">${escapeHtml(cleanEmail)}</a>`
    : '<span>Your business email</span>';

  const cardsHtml = trade.scopes
    .map(
      (scope, i) =>
        `<article class="card"><h3>0${i + 1} · ${escapeHtml(scope)}</h3><p>Written scope, transparent materials, and firm scheduling for ${escapeHtml(place)}.</p></article>`
    )
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(cleanBiz)} — ${escapeHtml(trade.name)} in ${escapeHtml(place)}</title>
<meta name="description" content="${escapeHtml(`${cleanBiz} — ${trade.name} in ${place}. ${trade.line}`)}">
<link rel="canonical" href="https://city-desk.netlify.app/cities/${escapeHtml(city.slug)}/${escapeHtml(trade.slug)}/">
<style>
  :root { --bg: #FAF8F3; --ink: #101828; --muted: #475467; --accent: #9A3412; --card: #FFFFFF; --line: rgba(16,24,40,0.12); }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif; margin: 0; background: var(--bg); color: var(--ink); line-height: 1.6; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 28px 20px 64px; }
  header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--line); margin-bottom: 36px; }
  .brand { font-weight: 800; font-size: 20px; }
  .call-btn { display: inline-block; background: var(--accent); color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 700; font-size: 14px; }
  .kicker { color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; margin-bottom: 10px; }
  h1 { font-size: clamp(32px, 5vw, 50px); line-height: 1.08; margin: 0 0 16px; }
  .lede { font-size: 18.5px; color: var(--muted); max-width: 680px; margin: 0 0 26px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 18px; margin: 34px 0; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 22px; }
  .card h3 { margin: 0 0 8px; font-size: 18px; }
  .card p { margin: 0; color: var(--muted); font-size: 15px; }
  .contact-box { background: #101828; color: #F5F5F7; border-radius: 14px; padding: 30px; margin-top: 36px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; align-items: center; }
  .contact-box h2 { margin: 0 0 8px; font-size: 26px; }
  .contact-lines p { margin: 8px 0; font-size: 15.5px; }
  .contact-lines span { display: inline-block; width: 88px; color: #CBD5E1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
</style>
<script type="application/ld+json">
${safeJsonLdString(schema)}
</script>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">${escapeHtml(cleanBiz)}</div>
      ${callButton}
    </header>
    <main>
      <div class="kicker">${escapeHtml(trade.name)} · ${escapeHtml(place)}</div>
      <h1>${escapeHtml(trade.name)} in ${escapeHtml(place)} — Written Price Upfront</h1>
      <p class="lede">${escapeHtml(trade.line)}</p>
      ${callButton}
      <section class="grid">
        ${cardsHtml}
      </section>
      <section class="contact-box" id="contact">
        <div>
          <h2>Direct Owner Contact</h2>
          <p style="color:#CBD5E1;margin:0;">Written scope and upfront price before work begins.</p>
        </div>
        <div class="contact-lines">
          <p><span>Business</span> <strong>${escapeHtml(cleanBiz)}</strong></p>
          <p><span>Phone</span> ${phoneDisplay}</p>
          <p><span>Email</span> ${emailDisplay}</p>
        </div>
      </section>
    </main>
  </div>
</body>
</html>
`;
}

export function buildOffersManifest() {
  const offers = [];
  for (const city of CANONICAL_CITIES) {
    for (const trade of CANONICAL_TRADES) {
      offers.push({
        city: city.name,
        state: city.state,
        city_slug: city.slug,
        service: trade.slug,
        service_name: trade.name,
        price: trade.price,
        path: `/cities/${city.slug}/${trade.slug}/`,
      });
    }
  }
  return offers;
}

export function exportOffersCsv(offers = buildOffersManifest()) {
  const header = 'city,state,city_slug,service,service_name,price_usd,path';
  const rows = offers.map((o) => {
    const cols = [o.city, o.state, o.city_slug, o.service, o.service_name, String(o.price), o.path];
    return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',');
  });
  return [header, ...rows].join('\n') + '\n';
}

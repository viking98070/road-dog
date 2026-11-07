// #18: link previews for shared trips. vercel.json sends link-preview bots
// (iMessage, X, Facebook/Instagram, Slack, WhatsApp, Discord…) asking for
// /trip/<code> here instead of the app, so the preview card names the trip:
//   "Seattle Kraken + Elderbrook · Chicago & Indianapolis"
//   "Mar 28 – 30 · Kraken @ Blackhawks · Elderbrook. Found on Road Dog 🌭"
// People opening the link never hit this; they get the normal page.

const SITE = 'https://roaddogapp.com'
const IMAGE = SITE + '/og-image.png'

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const plainFestival = s => (s || '').replace(/\s*\((weekend|wknd)[^)]*\)\s*$/i, '')
const lastWord = s => (s || '').trim().split(/\s+/).slice(-1)[0] || ''

// "Seattle Kraken" for a game the trip is built around, the artist for a show.
function headliner(e) {
  if (e.type === 'sport' && e.league_key !== 'marquee') return e.away_team
  return plainFestival(e.artist_name || e.parent_event)
}

function shortLine(e) {
  if (e.league_key === 'marquee') return e.artist_name
  if (e.type === 'sport') return `${lastWord(e.away_team)} ${e.neutral_site ? 'vs' : '@'} ${lastWord(e.home_team)}`
  return plainFestival(e.artist_name || e.parent_event)
}

function fmtDay(d) {
  return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
function fmtRange(s, e) {
  if (!e || s === e) return fmtDay(s)
  const [sm] = fmtDay(s).split(' ')
  const [em, ed] = fmtDay(e).split(' ')
  return sm === em ? `${fmtDay(s)} – ${ed}` : `${fmtDay(s)} – ${fmtDay(e)}`
}

function uniq(list) {
  const seen = new Set()
  return list.filter(x => x && !seen.has(x) && seen.add(x))
}

function describe(trip) {
  const events = trip.events || []
  const names = uniq(events.map(headliner))
  const cities = uniq((trip.cities && trip.cities.length ? trip.cities : [trip.city]).map(c => (c || '').replace(/,\s*[A-Z]{2}$/, '')))
  const where = cities.length <= 2 ? cities.join(' & ') : `${cities.slice(0, -1).join(', ')} & ${cities[cities.length - 1]}`
  const who = names.length <= 3 ? names.join(' + ') : `${names.slice(0, 3).join(' + ')} + ${names.length - 3} more`
  const title = who ? `${who} · ${where}` : `Road trip · ${where}`
  const lines = uniq(events.map(shortLine)).slice(0, 4)
  const description = `${fmtRange(trip.start_date, trip.end_date)}${lines.length ? ' · ' + lines.join(' · ') : ''}. Found on Road Dog 🌭`
  return { title, description }
}

function page({ title, description, url }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Road Dog" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${IMAGE}" />
</head><body><a href="${esc(url)}">${esc(title)}</a></body></html>`
}

module.exports = async function handler(req, res) {
  const code = String((req.query && req.query.code) || '').replace(/[^a-z0-9]/gi, '').slice(0, 32)
  const url = `${SITE}/trip/${code}`
  let meta = { title: 'Road Dog — Your game. Their city.', description: 'Road trips where your teams and favorite artists line up.', url }
  try {
    const base = process.env.REACT_APP_SUPABASE_URL
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY
    if (code && base && key) {
      const r = await fetch(`${base}/rest/v1/rpc/get_shared_trip`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_code: code, p_count_view: false }),
      })
      const trip = r.ok ? await r.json() : null
      if (trip && trip.start_date) meta = { ...describe(trip), url }
    }
  } catch (_) { /* fall back to the generic Road Dog preview */ }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600')
  res.status(200).send(page(meta))
}

module.exports.describe = describe

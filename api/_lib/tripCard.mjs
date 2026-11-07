// Draws a shared trip as an image (#18 follow-up): the link-preview card and
// Instagram post / Story images. Pure layout — no network. Used by
// api/trip-image.mjs. Elements are plain { type, props } objects (no JSX here).

export const FORMATS = {
  // maxRows counts the "+ N more" line too.
  og:    { w: 1200, h: 630,  pad: 56, top: 48,  bottom: 44,  city: 64,  dates: 30, row: 30, pill: 20, maxRows: 3, miles: false, cta: false },
  post:  { w: 1080, h: 1350, pad: 76, top: 72,  bottom: 72,  city: 92,  dates: 40, row: 38, pill: 24, maxRows: 4, miles: true,  cta: true },
  story: { w: 1080, h: 1920, pad: 84, top: 230, bottom: 300, city: 104, dates: 44, row: 42, pill: 26, maxRows: 5, miles: true,  cta: true },
}

const ORANGE = '#F97316'
const TEXT = '#F5F5F5'
const TEXT2 = '#B5B5B5'
const TEXT3 = '#8A8A8A'
const FESTIVAL_BG = 'linear-gradient(90deg, #7B2D8B 0%, #F97316 100%)'
const LEAGUE = {
  nfl: ['NFL', '#013369'], mlb: ['MLB', '#002D72'], nba: ['NBA', '#C9082A'], nhl: ['NHL', '#0033A0'],
  wnba: ['WNBA', '#C9082A'], mls: ['MLS', '#002F6C'], nwsl: ['NWSL', '#7B2D8B'], cfb: ['CFB', '#BF5700'],
  mcbb: ['MCBB', '#0033A0'], wcbb: ['WCBB', '#0033A0'],
}

const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, children } })
const text = (s, style) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children: String(s ?? '') } })

const isFestival = e => e.league_key === 'festival' || !!e.parent_event
const isSpring = e => e.type === 'sport' && e.league_key === 'mlb' && e.season_type === 1
const plain = s => (s || '').replace(/\s*\((weekend|wknd)[^)]*\)\s*$/i, '')

function pillOf(e) {
  if (e.league_key === 'marquee') return ['MARQUEE', '#B8860B']
  if (isSpring(e)) return ['SPRING', '#3F7D20']
  if (isFestival(e)) return ['FESTIVAL', FESTIVAL_BG]
  if (e.type === 'music') return ['MUSIC', '#7B2D8B']
  if (e.type === 'comedy') return ['COMEDY', '#F4911E']
  return LEAGUE[e.league_key] || [(e.league_key || 'EVENT').toUpperCase(), '#444']
}

function titleOf(e) {
  if (e.league_key === 'marquee') return e.artist_name || 'Marquee event'
  if (e.type === 'sport') return `${e.away_team || 'TBD'} ${e.neutral_site ? 'vs' : '@'} ${e.home_team || 'TBD'}`
  return plain(e.artist_name || e.parent_event) || 'Event'
}

// Same series/residency grouping as the trip page: one row per matchup or act.
function groupEvents(events) {
  const keyOf = e => e.type === 'sport' ? `${e.away_team}|${e.home_team}|${e.venue}` : `${e.artist_name}|${e.venue}`
  const map = new Map()
  for (const e of [...events].sort((a, b) => a.event_date.localeCompare(b.event_date))) {
    const k = keyOf(e)
    if (!map.has(k)) map.set(k, { first: e, last: e, count: 0 })
    const g = map.get(k)
    g.count++
    g.last = e
  }
  return [...map.values()]
}

const day = (d, wd) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { ...(wd ? { weekday: 'short' } : {}), month: 'short', day: 'numeric', timeZone: 'UTC' })
const range = (s, e) => (!e || s === e) ? day(s) : `${day(s)} – ${day(e)}`

function rowDate(g) {
  if (g.count > 1) return range(g.first.event_date, g.last.event_date)
  if (g.first.end_date && g.first.end_date !== g.first.event_date) return range(g.first.event_date, g.first.end_date)
  return day(g.first.event_date, true)
}

// "SAP Center at San Jose" already says San Jose — don't repeat the city.
function venueLine(e) {
  const v = e.venue || '', c = e.city || ''
  return c && !v.toLowerCase().includes(c.toLowerCase()) ? [v, c].filter(Boolean).join(' · ') : v
}

function legMiles(a, b) {
  if ([a?.latitude, a?.longitude, b?.latitude, b?.longitude].some(v => v == null)) return null
  const R = 3959, r = d => d * Math.PI / 180
  const x = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2
  const m = 2 * R * Math.asin(Math.sqrt(x))
  return m < 25 ? null : Math.max(10, Math.round(m * 1.15 / 10) * 10)
}

function cityLine(trip) {
  const raw = (trip.cities && trip.cities.length ? trip.cities : [trip.city]).filter(Boolean)
  const seen = new Set()
  const cities = raw.filter(c => !seen.has(c) && seen.add(c))
  if (cities.length <= 1) return cities[0] || ''
  return `${cities.slice(0, -1).join(', ')} & ${cities[cities.length - 1]}`
}

export function tripCard(trip, formatName = 'og') {
  const base = FORMATS[formatName] || FORMATS.og
  const groups = groupEvents(trip.events || [])
  const tall = formatName !== 'og'
  // Few events in a tall image: bigger rows so it doesn't look empty.
  const k = tall && groups.length <= 3 ? 1.22 : 1
  const f = { ...base, row: Math.round(base.row * k), pill: Math.round(base.pill * k) }
  // Leave room for the "+ N more" line when everything doesn't fit.
  const shown = groups.length > f.maxRows ? groups.slice(0, f.maxRows - 1) : groups
  const more = groups.length - shown.length
  // Miles chips only when there's room for them (short trips).
  const showMiles = f.miles && shown.length <= 3 && more === 0

  const city = cityLine(trip).toUpperCase()
  const width = f.w - f.pad * 2
  // Shrink long city lines so they stay on two lines at most.
  const perLine = width / (f.city * 0.5)
  const citySize = city.length > perLine * 2 ? Math.round(f.city * 0.72) : city.length > perLine ? Math.round(f.city * 0.86) : f.city

  const wordmark = h('div', { fontFamily: 'Oswald', fontWeight: 700, fontSize: Math.round(f.dates * 0.95), letterSpacing: 3, color: TEXT }, [
    text('ROAD', {}), text('DOG', { color: ORANGE }),
  ])

  const rows = []
  shown.forEach((g, i) => {
    if (showMiles && i > 0) {
      const m = legMiles(shown[i - 1].first, g.first)
      if (m) {
        rows.push(h('div', { alignItems: 'center', gap: 18, color: TEXT2, fontSize: Math.round(f.row * 0.62), fontWeight: 700, margin: `${Math.round(f.row * 0.1)}px 0` }, [
          h('div', { flex: 1, height: 2, background: '#333' }, []),
          text(`~${m} mi to ${g.first.city || ''}`, { padding: `${Math.round(f.row * 0.16)}px ${Math.round(f.row * 0.5)}px`, borderRadius: 999, border: '2px solid #3a3a3a', background: '#262626', color: TEXT }),
          h('div', { flex: 1, height: 2, background: '#333' }, []),
        ]))
      }
    }
    const [label, bg] = pillOf(g.first)
    const isGradient = String(bg).startsWith('linear')
    rows.push(h('div', {
      alignItems: 'center', gap: Math.round(f.row * 0.6), background: '#1C1C1C', border: '2px solid #2A2A2A',
      borderRadius: Math.round(f.row * 0.45), padding: `${Math.round(f.row * (tall ? 0.75 : 0.55))}px ${Math.round(f.row * 0.7)}px`,
    }, [
      text(label, {
        ...(isGradient ? { backgroundImage: bg } : { background: bg }),
        color: '#fff', fontWeight: 700, fontSize: f.pill, letterSpacing: 1, borderRadius: 8,
        padding: `${Math.round(f.pill * 0.3)}px ${Math.round(f.pill * 0.6)}px`, minWidth: Math.round(f.pill * 5.2), justifyContent: 'center',
      }),
      h('div', { flexDirection: 'column', flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0, overflow: 'hidden' }, [
        text(titleOf(g.first) + (g.count > 1 ? `  ×${g.count}` : ''), tall
          ? { color: TEXT, fontWeight: 700, fontSize: f.row, lineHeight: 1.15 }
          : { color: TEXT, fontWeight: 700, fontSize: f.row, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }),
        text(venueLine(g.first), tall
          ? { color: TEXT3, fontSize: Math.round(f.row * 0.62), marginTop: 4, lineHeight: 1.2 }
          : { color: TEXT3, fontSize: Math.round(f.row * 0.62), marginTop: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }),
      ]),
      text(rowDate(g), { color: ORANGE, fontWeight: 700, fontSize: Math.round(f.row * 0.72), whiteSpace: 'nowrap', flexShrink: 0 }),
    ]))
  })
  if (more > 0) rows.push(text(`+ ${more} more ${more === 1 ? 'event' : 'events'}`, { color: TEXT2, fontSize: Math.round(f.row * 0.7), fontWeight: 700, paddingLeft: 8 }))

  const hotDog = trip.score >= 4
    ? text('HOT DOG', { color: '#FB923C', border: '2px solid rgba(249,115,22,0.6)', background: 'rgba(249,115,22,0.14)', borderRadius: 999, fontWeight: 700, fontSize: Math.round(f.dates * 0.7), letterSpacing: 2, padding: `${Math.round(f.dates * 0.18)}px ${Math.round(f.dates * 0.55)}px` })
    : null

  const footer = f.cta
    ? h('div', { width: '100%', flexDirection: 'column', alignItems: 'center', gap: 14 }, [
        text('Find trips for your teams', { color: TEXT, fontFamily: 'Oswald', fontWeight: 600, fontSize: Math.round(f.dates * 1.05) }),
        text('roaddogapp.com', { color: '#0F0F0F', background: ORANGE, borderRadius: 14, fontWeight: 700, fontSize: Math.round(f.dates * 0.9), padding: `${Math.round(f.dates * 0.3)}px ${Math.round(f.dates * 0.9)}px` }),
      ])
    : h('div', { width: '100%', justifyContent: 'flex-end' }, [text('roaddogapp.com', { color: TEXT2, fontWeight: 700, fontSize: 24 })])

  // Explicit inner box: the canvas is exactly f.w × f.h, content sits inside.
  return h('div', {
    width: f.w, height: f.h, fontFamily: 'Barlow', color: TEXT,
    backgroundColor: '#0F0F0F', backgroundImage: 'linear-gradient(160deg, #2a0d00 0%, #0F0F0F 55%)',
  }, [h('div', {
    position: 'absolute', left: f.pad, top: f.top, width: f.w - f.pad * 2, height: f.h - f.top - f.bottom,
    flexDirection: 'column',
  }, [
    h('div', { justifyContent: 'space-between', alignItems: 'center' }, [wordmark, ...(hotDog && formatName === 'og' ? [hotDog] : [])]),
    ...(tall ? [h('div', { flexGrow: 1 }, [])] : []),
    text(city, { fontFamily: 'Oswald', fontWeight: 700, fontSize: citySize, lineHeight: 1.05, marginTop: Math.round(f.dates * (tall ? 0 : 0.8)) }),
    h('div', { alignItems: 'center', gap: 18, marginTop: Math.round(f.dates * 0.35) }, [
      text(range(trip.start_date, trip.end_date), { color: ORANGE, fontWeight: 700, fontSize: f.dates }),
      ...(hotDog && formatName !== 'og' ? [hotDog] : []),
    ]),
    h('div', { width: '100%', flexDirection: 'column', gap: Math.round(f.row * (tall ? 0.7 : 0.36)), marginTop: Math.round(f.dates * (formatName === 'og' ? 0.8 : 1.4)) }, rows),
    h('div', { flexGrow: 1 }, []),
    footer,
  ])])
}

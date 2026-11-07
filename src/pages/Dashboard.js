import React, { useEffect, useState } from 'react'
import SaveTrips from '../components/SaveTrips'
import AppNav from '../components/AppNav'
import { supabase } from '../lib/supabase'
import ComboDetail from './ComboDetail'
import styles from './Dashboard.module.css'
import { isSpring, SPRING_COLOR, SPRING_LABEL } from '../lib/spring'

const TABS = [
  { key: 'sports_plus_shows', label: 'Sports + Shows' },
  { key: 'sports_only', label: 'Sports Only' },
  { key: 'shows_only', label: 'Shows Only' },
]

// Metro clusters — suburbs that should collapse into the primary city
const METRO_CLUSTERS = {
  'New York, NY': ['Bronx, NY', 'Brooklyn, NY', 'Queens, NY', 'Staten Island, NY', 'Newark, NJ', 'East Rutherford, NJ', 'Elmont, NY', 'Uniondale, NY', 'Hempstead, NY'],
  'Los Angeles, CA': ['Anaheim, CA', 'Carson, CA', 'Inglewood, CA', 'Burbank, CA', 'Long Beach, CA', 'El Segundo, CA', 'Cerritos, CA', 'Ontario, CA'],
  'San Francisco, CA': ['Oakland, CA', 'San Jose, CA', 'Berkeley, CA', 'Santa Clara, CA', 'Fremont, CA', 'San Ramon, CA'],
  'Dallas, TX': ['Arlington, TX', 'Addison, TX', 'Irving, TX', 'Frisco, TX', 'Allen, TX'],
  'Washington, DC': ['Alexandria, VA', 'Arlington, VA', 'Landover, MD', 'Bristow, VA', 'Baltimore, MD'],
  'Philadelphia, PA': ['Camden, NJ', 'Bensalem, PA', 'Voorhees, NJ', 'Wilmington, DE'],
  'Chicago, IL': ['Bridgeview, IL', 'Rosemont, IL', 'Hoffman Estates, IL', 'Tinley Park, IL', 'Waukegan, IL'],
  'Boston, MA': ['Foxborough, MA', 'Worcester, MA', 'Providence, RI', 'Wantagh, NY'],
  'Miami, FL': ['Fort Lauderdale, FL', 'Sunrise, FL', 'Miami Gardens, FL', 'Coral Gables, FL', 'West Palm Beach, FL'],
  'Atlanta, GA': ['Alpharetta, GA', 'Duluth, GA', 'Kennesaw, GA', 'Marietta, GA', 'Gainesville, GA'],
  'Seattle, WA': ['Tacoma, WA', 'Bellevue, WA', 'Auburn, WA', 'Airway Heights, WA', 'George, WA'],
  'Denver, CO': ['Aurora, CO', 'Commerce City, CO', 'Brighton, CO', 'Morrison, CO'],
  'Phoenix, AZ': ['Glendale, AZ', 'Tempe, AZ', 'Scottsdale, AZ', 'Mesa, AZ', 'Chandler, AZ', 'Peoria, AZ'],
  'Minneapolis, MN': ['Saint Paul, MN', 'Bloomington, MN', 'Eden Prairie, MN'],
  'Tampa, FL': ['St. Petersburg, FL', 'Clearwater, FL', 'Brandon, FL'],
  'Kansas City, MO': ['Independence, MO', 'Overland Park, KS', 'Bonner Springs, KS'],
  'Nashville, TN': ['Murfreesboro, TN', 'Franklin, TN'],
  'New Orleans, LA': ['Metairie, LA', 'Bossier City, LA'],
  'Portland, OR': ['Beaverton, OR', 'Hillsboro, OR', 'Ridgefield, WA'],
  'Pittsburgh, PA': ['Burgettstown, PA', 'Cranberry Township, PA'],
  'Cleveland, OH': ['Berea, OH', 'Akron, OH'],
  'Charlotte, NC': ['Concord, NC', 'Kannapolis, NC'],
  'Sacramento, CA': ['Elk Grove, CA', 'Rancho Cordova, CA'],
  'Las Vegas, NV': ['Henderson, NV', 'Paradise, NV'],
  'Indianapolis, IN': ['Noblesville, IN', 'Fishers, IN'],
  'Cincinnati, OH': ['Covington, KY', 'Newport, KY'],
  'Louisville, KY': ['Clarksville, IN'],
}

// Build reverse lookup: suburb -> primary city
const SUBURB_TO_PRIMARY = {}
for (const [primary, suburbs] of Object.entries(METRO_CLUSTERS)) {
  for (const suburb of suburbs) {
    SUBURB_TO_PRIMARY[suburb] = primary
  }
}

function collapseCities(cities) {
  if (!cities || cities.length === 0) return cities
  const collapsed = []
  for (const city of cities) {
    const primary = SUBURB_TO_PRIMARY[city]
    if (primary) {
      // Map to primary city
      if (!collapsed.includes(primary)) collapsed.push(primary)
    } else {
      if (!collapsed.includes(city)) collapsed.push(city)
    }
  }
  return collapsed
}

// How trips are ordered. "soonest" (default) groups by month in date order —
// the way people plan. "best" puts the highest-scoring trips first.
const SORTS = [
  { key: 'soonest', label: 'Soonest' },
  { key: 'best', label: 'Best' },
]
const SORT_STORAGE_KEY = 'roaddog.tripSort'

function loadSortPref() {
  try {
    const v = window.localStorage.getItem(SORT_STORAGE_KEY)
    return SORTS.some(s => s.key === v) ? v : 'soonest'
  } catch (_) {
    return 'soonest'
  }
}

function saveSortPref(v) {
  try { window.localStorage.setItem(SORT_STORAGE_KEY, v) } catch (_) { /* private mode etc. */ }
}

function sortCombos(list, mode) {
  const byDate = (a, b) => (a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : 0)
  return [...list].sort((a, b) =>
    mode === 'best'
      ? (b.score - a.score) || byDate(a, b)
      : byDate(a, b) || (b.score - a.score)
  )
}

// "November" for this year's months, "January 2027" once the year changes.
function monthLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('en-US', sameYear ? { month: 'long' } : { month: 'long', year: 'numeric' })
}

// Split an already date-sorted list into [{ label, combos }] by start month.
function groupByMonth(list) {
  const groups = []
  for (const combo of list) {
    const label = monthLabel(combo.start_date)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.combos.push(combo)
    else groups.push({ label, combos: [combo] })
  }
  return groups
}

// Today's date in the viewer's own time zone, as YYYY-MM-DD (the same format
// as trip_combos.end_date). Used to hide trips that have already ended, so a
// stalled rebuild can never put past trips back on the board.
function localToday() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function Dashboard({ session }) {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('sports_plus_shows')
  const [sortMode, setSortMode] = useState(loadSortPref)
  // Arriving straight from onboarding (?welcome=1): show a one-time "we found
  // N trips" banner. The flag is read once, then removed from the URL so a
  // refresh or a shared link never shows it again.
  const [isWelcome, setIsWelcome] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('welcome') === '1' } catch (_) { return false }
  })
  // Guest = picked teams but hasn't added an email yet. pendingEmail = they
  // entered one but haven't tapped the confirmation link.
  const isGuest = !!session?.user?.is_anonymous
  const [pendingEmail, setPendingEmail] = useState(session?.user?.new_email || '')
  const [justSaved] = useState(() => {
    try { return new URLSearchParams(window.location.search).get('saved') === '1' } catch (_) { return false }
  })
  const [savedDismissed, setSavedDismissed] = useState(false)
  useEffect(() => {
    if (justSaved) {
      try { window.history.replaceState(null, '', window.location.pathname) } catch (_) { /* ignore */ }
    }
  }, [justSaved])

  useEffect(() => {
    if (isWelcome) {
      try { window.history.replaceState(null, '', window.location.pathname) } catch (_) { /* ignore */ }
    }
  }, [isWelcome])

  function changeSort(mode) {
    setSortMode(mode)
    saveSortPref(mode)
  }
  
  useEffect(() => {
    loadCombos()
  }, [])

  async function loadCombos() {
    // Only trips that end today or later. A trip still in progress stays visible.
    const { data: comboData, error } = await supabase
      .from('trip_combos')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('end_date', localToday())
      .order('score', { ascending: false })
      .order('start_date', { ascending: true })

    if (error || !comboData) { setLoading(false); return }

    const allIds = [...new Set(comboData.flatMap(c => c.event_ids || []))]
    const { data: eventData } = await supabase
      .from('events')
      .select('id, away_team, home_team, league_key, artist_name, type, event_date, parent_event, lineup, neutral_site, season_type')
      .in('id', allIds)

    const eventMap = {}
    for (const e of (eventData || [])) eventMap[e.id] = e

    const combosWithEvents = comboData.map(c => ({
      ...c,
      events: (c.event_ids || []).map(id => eventMap[id]).filter(Boolean)
    }))

    setCombos(combosWithEvents)

    // Opened from the results screen (/trips?trip=<id>): go straight to that trip.
    try {
      const want = new URLSearchParams(window.location.search).get('trip')
      if (want) {
        const hit = combosWithEvents.find(c => String(c.id) === want)
        if (hit) setSelected(hit)
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (_) { /* ignore */ }

    // Open on a tab that actually has trips. A fan who follows only artists
    // has nothing under the default Sports + Shows tab, and landing on an
    // empty tab looks like the app found nothing.
    const hasTrips = key => combosWithEvents.some(c => c.combo_type === key)
    setActiveTab(current => hasTrips(current) ? current : (TABS.find(t => hasTrips(t.key))?.key || current))

    setLoading(false)
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // "Dec 4" for a one-day trip, "Nov 14 – Nov 15" otherwise.
  function formatDateRange(start, end) {
    if (!end || start === end) return formatDate(start)
    return `${formatDate(start)} – ${formatDate(end)}`
  }

  // Short day label for an event row: "Sat 14". Adds the month ("Fri Jan 1")
  // when the event falls in a different month than the trip starts, so a
  // trip that crosses a month boundary never reads ambiguously.
  function dayLabel(dateStr, tripStart) {
    const d = new Date(dateStr + 'T12:00:00')
    const t = new Date(tripStart + 'T12:00:00')
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
    const sameMonth = d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
    const rest = sameMonth
      ? d.toLocaleDateString('en-US', { day: 'numeric' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${weekday} ${rest}`
  }

  // A combo counts as "new" for a few days after it was emailed in a digest.
  // alerted_at is stamped by send-combo-alerts; baseline combos have old stamps
  // (or null) so they never light up here.
  function isNew(combo) {
    if (!combo.alerted_at) return false
    const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000
    return Date.now() - new Date(combo.alerted_at).getTime() < NEW_WINDOW_MS
  }

  function displayCity(combo) {
    const raw = combo.cities && combo.cities.length > 0 ? combo.cities : [combo.city]
    const cities = collapseCities(raw)
    if (!cities[0]) return ''
    if (cities.length === 1) return cities[0]
    if (cities.length === 2) return `${cities[0]} & ${cities[1]}`
    return `${cities[0]}, ${cities[1]} +${cities.length - 2} more`
  }

  function tierBadge(score) {
    // Only the top trips earn a badge — everything else shows nothing.
    if (score < 4) return null
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
        background: 'rgba(249,115,22,0.14)', color: '#FB923C', fontWeight: 700,
        fontSize: 12.5, padding: '4px 11px', borderRadius: 999,
        border: '1px solid rgba(249,115,22,0.55)', boxShadow: '0 0 14px rgba(249,115,22,0.30)',
      }}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>🌭</span>
        Hot Dog
      </span>
    )
  }

  function categoryColor(event) {
    if (event.league_key === 'marquee') return '#B8860B'
    if (isSpring(event)) return SPRING_COLOR
    if (event.type === 'music') return '#7B2D8B'
    if (event.type === 'comedy') return '#F4911E'
    const colors = {
      nfl: '#013369', mlb: '#002D72', nba: '#C9082A',
      nhl: '#0033A0', wnba: '#C9082A', mls: '#002F6C',
      nwsl: '#7B2D8B', cfb: '#BF5700', mcbb: '#0033A0', wcbb: '#0033A0',
    }
    return colors[event.league_key] || '#444'
  }

  function categoryLabel(event) {
    if (event.league_key === 'marquee') return 'MARQUEE'
    if (isSpring(event)) return SPRING_LABEL
    if (event.parent_event) return 'FESTIVAL'
    if (event.type === 'music') return 'MUSIC'
    if (event.type === 'comedy') return 'COMEDY'
    if (!event.league_key) return 'EVENT'
    const labels = {
      nfl:'NFL', mlb:'MLB', nba:'NBA', nhl:'NHL', wnba:'WNBA', mls:'MLS',
      nwsl:'NWSL', cfb:'CFB', mcbb:'MCBB', wcbb:'WCBB',
    }
    return labels[event.league_key] || event.league_key.toUpperCase()
  }

  function eventDescription(event) {
    if (event.league_key === 'marquee') return event.artist_name || 'Marquee Event'
    if (event.type === 'sport') {
      const away = event.away_team || 'TBD'
      const home = event.home_team || 'TBD'
      const sep = event.neutral_site ? 'vs' : '@'
      return `${away} ${sep} ${home}`
    }
    if (event.parent_event) return event.parent_event
    return event.artist_name || 'Untitled event'
  }

  if (selected) {
    return <ComboDetail combo={selected} onBack={() => setSelected(null)} />
  }

  const filteredCombos = sortCombos(combos.filter(c => c.combo_type === activeTab), sortMode)
  // Month headers only make sense when the list is in date order.
  const sections = sortMode === 'soonest'
    ? groupByMonth(filteredCombos)
    : [{ label: null, combos: filteredCombos }]
  const tabCounts = {}
  for (const tab of TABS) {
    tabCounts[tab.key] = combos.filter(c => c.combo_type === tab.key).length
  }

  return (
    <div className={styles.page}>
      <AppNav />
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Trips</h1>
          <p>Away games and shows that line up in the same city.</p>
          {combos.some(c => (c.score ?? 0) >= 4) && (
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
              <span style={{ color: '#FB923C', fontWeight: 700 }}>🌭 Hot Dog</span> = one of your best trips: your events packed close together in one city.
            </p>
          )}
        </div>

        {isGuest && !loading && (
          <div style={{ marginBottom: 20 }}>
            {pendingEmail ? (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
                padding: '14px 16px', fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.45,
              }}>
                <strong style={{ color: 'var(--text)' }}>✉️ Almost saved.</strong> Tap the link we sent to{' '}
                <strong style={{ color: 'var(--text)' }}>{pendingEmail}</strong> to keep your trips and turn on alerts.{' '}
                <button
                  onClick={() => setPendingEmail('')}
                  style={{ background: 'none', border: 'none', color: 'var(--orange)', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13.5 }}
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <SaveTrips source="banner" compact onSaved={setPendingEmail} />
            )}
          </div>
        )}

        {justSaved && !isGuest && !savedDismissed && !loading && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.45)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 20,
          }}>
            <div>
              <div style={{ fontFamily: 'var(--head)', fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text)' }}>
                Your trips are saved 🌭
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                We'll email you when new ones line up. Sign in any time with a link sent to your email.
              </div>
            </div>
            <button onClick={() => setSavedDismissed(true)} aria-label="Dismiss" style={{
              background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 2, flexShrink: 0,
            }}>×</button>
          </div>
        )}

        {isWelcome && !loading && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.45)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 20,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--head)', fontSize: 18, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text)',
              }}>
                {combos.length > 0
                  ? `You're all set — we found ${combos.length} ${combos.length === 1 ? 'trip' : 'trips'} for you 🌭`
                  : `You're all set 🌭`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                {combos.length > 0
                  ? "We'll email you when new ones line up. Tap any trip for tickets, flights and hotels."
                  : "Nothing lines up yet — we'll email you as soon as your teams and artists land in the same city."}
              </div>
            </div>
            <button
              onClick={() => setIsWelcome(false)}
              aria-label="Dismiss"
              style={{
                background: 'transparent', border: 'none', color: 'var(--text3)',
                fontSize: 20, lineHeight: 1, cursor: 'pointer', padding: 2, flexShrink: 0,
              }}
            >×</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--orange)' : 'var(--text2)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--orange)' : '2px solid transparent',
                  marginBottom: -1,
                  fontFamily: 'var(--head)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: isActive ? 'var(--orange)' : 'var(--text3)',
                  fontWeight: 600,
                }}>
                  {tabCounts[tab.key] || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sort toggle */}
        {!loading && filteredCombos.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
            gap: 8, marginBottom: 16,
          }}>
            <span style={{
              fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: 0.5, fontFamily: 'var(--head)',
            }}>
              Sort
            </span>
            <div style={{
              display: 'inline-flex', padding: 3, gap: 2,
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999,
            }}>
              {SORTS.map(s => {
                const on = sortMode === s.key
                return (
                  <button
                    key={s.key}
                    onClick={() => changeSort(s.key)}
                    aria-pressed={on}
                    style={{
                      border: 'none', cursor: 'pointer', borderRadius: 999,
                      padding: '5px 12px', fontSize: 12, fontWeight: 600,
                      fontFamily: 'var(--head)', textTransform: 'uppercase', letterSpacing: 0.5,
                      background: on ? 'var(--orange)' : 'transparent',
                      color: on ? '#0F0F0F' : 'var(--text2)',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.empty}>
            <div className={styles.spinner} />
            <p>Loading your trips…</p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✈️</div>
            <h2>No trips in this category yet</h2>
            <p>Try a different tab, or check back as schedules update.</p>
          </div>
        ) : sections.map(section => (
          <section key={section.label || 'all'} style={{ marginBottom: section.label ? 28 : 0 }}>
            {section.label && (
              <h2 style={{
                fontFamily: 'var(--head)', fontSize: 15, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 1,
                color: 'var(--text2)', margin: '0 0 12px',
                display: 'flex', alignItems: 'baseline', gap: 8,
              }}>
                {section.label}
                <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, letterSpacing: 0.5 }}>
                  {section.combos.length} {section.combos.length === 1 ? 'trip' : 'trips'}
                </span>
              </h2>
            )}
          <div className={styles.grid}>
            {section.combos.map(combo => (
              <div
                key={combo.id}
                className={styles.card}
                onClick={() => setSelected(combo)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardCity} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>{displayCity(combo)}</span>
                    {isNew(combo) && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
                        background: '#F97316', color: '#0F0F0F', fontWeight: 700,
                        fontSize: 10.5, lineHeight: 1, padding: '3px 8px',
                        borderRadius: 999, letterSpacing: 0.6, textTransform: 'uppercase',
                        fontFamily: 'var(--head)',
                      }}>
                        New
                      </span>
                    )}
                  </div>
                  <div className={styles.cardBadge}>{tierBadge(combo.score)}</div>
                </div>
                <div className={styles.cardDates}>
                  {formatDateRange(combo.start_date, combo.end_date)}
                </div>
                <div className={styles.cardTeams}>
                  {combo.events && (() => {
                    // Date order first, so rows read like an itinerary and
                    // each group's first date is its earliest night.
                    const ordered = [...combo.events].sort((a, b) =>
                      (a.event_date || '').localeCompare(b.event_date || ''))
                    const grouped = []
                    for (const event of ordered) {
                      const key = `${categoryLabel(event)}|${eventDescription(event)}`
                      const existing = grouped.find(g => g.key === key)
                      if (existing) {
                        existing.count++
                      } else {
                        grouped.push({ key, event, count: 1 })
                      }
                    }
                    const visible = grouped.slice(0, 3)
                    const hiddenCount = grouped.length - visible.length
                    return (
                      <>
                        {visible.map((g, i) => (
                          <div key={i} className={styles.cardTeamRow}>
                            {g.event.event_date && (
                              <span className={styles.cardEventDay}>
                                {dayLabel(g.event.event_date, combo.start_date)}
                              </span>
                            )}
                            <span
                              className={styles.cardLeaguePill}
                              style={{ background: categoryColor(g.event) }}
                            >
                              {categoryLabel(g.event)}
                            </span>
                            <span className={styles.cardTeamName}>
                              {eventDescription(g.event)}
                              {g.count > 1 && (
                                <span style={{ color: 'var(--text2)', fontWeight: 400 }}> · {g.count} nights</span>
                              )}
                            </span>
                          </div>
                        ))}
                        {hiddenCount > 0 && (
                          <div className={styles.cardMore}>+{hiddenCount} more →</div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
          </section>
        ))}
      </main>
    </div>
  )
}

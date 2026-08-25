import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ComboDetail from './ComboDetail'
import styles from './Dashboard.module.css'

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

export default function Dashboard({ session }) {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('sports_plus_shows')
  const navigate = useNavigate()
  
  useEffect(() => {
    loadCombos()
  }, [])

  async function loadCombos() {
    const { data: comboData, error } = await supabase
      .from('trip_combos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('score', { ascending: false })
      .order('start_date', { ascending: true })

    if (error || !comboData) { setLoading(false); return }

    const allIds = [...new Set(comboData.flatMap(c => c.event_ids || []))]
    const { data: eventData } = await supabase
      .from('events')
      .select('id, away_team, home_team, league_key, artist_name, type, event_date, parent_event, lineup')
      .in('id', allIds)

    const eventMap = {}
    for (const e of (eventData || [])) eventMap[e.id] = e

    const combosWithEvents = comboData.map(c => ({
      ...c,
      events: (c.event_ids || []).map(id => eventMap[id]).filter(Boolean)
    }))

    setCombos(combosWithEvents)
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function displayCity(combo) {
    const raw = combo.cities && combo.cities.length > 0 ? combo.cities : [combo.city]
    const cities = collapseCities(raw)
    if (!cities[0]) return ''
    if (cities.length === 1) return cities[0]
    if (cities.length === 2) return `${cities[0]} & ${cities[1]}`
    return `${cities[0]}, ${cities[1]} +${cities.length - 2} more`
  }

  function formatScore(score) {
    if (score >= 4) return '🌭 Hot Dog'
    if (score >= 2) return '🐕 Big Dog'
    return '🐶 Good Dog'
  }

  function categoryColor(event) {
    if (event.league_key === 'marquee') return '#B8860B'
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
      return `${away} @ ${home}`
    }
    if (event.parent_event) return event.parent_event
    return event.artist_name || 'Untitled event'
  }

  if (selected) {
    return <ComboDetail combo={selected} onBack={() => setSelected(null)} />
  }

  const filteredCombos = combos.filter(c => c.combo_type === activeTab)
  const tabCounts = {}
  for (const tab of TABS) {
    tabCounts[tab.key] = combos.filter(c => c.combo_type === tab.key).length
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            className={styles.signOut} 
            onClick={() => navigate('/hub')}
            style={{ background: 'transparent' }}
          >
            ← Hub
          </button>
          <div className={styles.logo}>Road<span>Dog</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className={styles.signOut} 
            onClick={() => navigate('/settings')}
            style={{ background: 'transparent' }}
          >
            ⚙ My Picks
          </button>
          <button className={styles.signOut} onClick={handleSignOut}>Sign out</button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Trips</h1>
          <p>Away games and shows that line up in the same city.</p>
        </div>

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
        ) : (
          <div className={styles.grid}>
            {filteredCombos.map(combo => (
              <div
                key={combo.id}
                className={styles.card}
                onClick={() => setSelected(combo)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardCity}>{displayCity(combo)}</div>
                  <div className={styles.cardBadge}>{formatScore(combo.score)}</div>
                </div>
                <div className={styles.cardDates}>
                  {formatDate(combo.start_date)} – {formatDate(combo.end_date)}
                </div>
                <div className={styles.cardTeams}>
                  {combo.events && (() => {
                    const grouped = []
                    for (const event of combo.events) {
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
        )}
      </main>
    </div>
  )
}

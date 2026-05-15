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
    // Parse as local date (noon UTC avoids timezone shifts to prior/next day)
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function formatScore(score) {
    if (score >= 7) return '🔥 Hot combo'
    if (score >= 5) return '⭐ Great combo'
    return '✈️ Good combo'
  }

  function categoryColor(event) {
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
    if (event.type === 'sport') {
      const away = event.away_team || 'TBD'
      const home = event.home_team || 'TBD'
      return `${away} @ ${home}`
    }
    // For festivals, show the festival name (more iconic than the individual artist)
    if (event.parent_event) {
      return event.parent_event
    }
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
            ⚙ Edit preferences
          </button>
          <button className={styles.signOut} onClick={handleSignOut}>Sign out</button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Trip Combos</h1>
          <p>Away games and shows that line up in the same city.</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 0,
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
                  fontSize: 14,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--orange)' : '2px solid transparent',
                  marginBottom: -1,
                  fontFamily: 'var(--head)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: 8,
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
            <p>Loading your combos…</p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✈️</div>
            <h2>No combos in this category yet</h2>
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
                  <div className={styles.cardCity}>{combo.city}</div>
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

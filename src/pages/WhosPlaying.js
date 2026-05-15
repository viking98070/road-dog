import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Dashboard.module.css'

const LEAGUE_OPTIONS = [
  { key: 'nfl',  label: 'NFL' },
  { key: 'mlb',  label: 'MLB' },
  { key: 'nba',  label: 'NBA' },
  { key: 'nhl',  label: 'NHL' },
  { key: 'mls',  label: 'MLS' },
  { key: 'nwsl', label: 'NWSL' },
  { key: 'wnba', label: 'WNBA' },
  { key: 'cfb',  label: 'CFB' },
  { key: 'mcbb', label: "Men's CBB" },
  { key: 'wcbb', label: "Women's CBB" },
]

const GENRE_OPTIONS = [
  'Rock', 'Pop', 'Country', 'Hip-Hop/Rap', 'R&B', 'Alternative',
  'Metal', 'Folk', 'Jazz', 'Latin', 'World', 'Dance/Electronic',
]
const CITIES = [
  'Atlanta, GA', 'Austin, TX', 'Baltimore, MD', 'Boston, MA', 'Buffalo, NY',
  'Charlotte, NC', 'Chicago, IL', 'Cincinnati, OH', 'Cleveland, OH', 'Columbus, OH',
  'Dallas, TX', 'Denver, CO', 'Detroit, MI', 'Green Bay, WI', 'Houston, TX',
  'Indianapolis, IN', 'Jacksonville, FL', 'Kansas City, MO', 'Las Vegas, NV',
  'Los Angeles, CA', 'Louisville, KY', 'Memphis, TN', 'Miami, FL', 'Milwaukee, WI',
  'Minneapolis, MN', 'Nashville, TN', 'New Orleans, LA', 'New York, NY',
  'Oakland, CA', 'Oklahoma City, OK', 'Orlando, FL', 'Philadelphia, PA',
  'Phoenix, AZ', 'Pittsburgh, PA', 'Portland, OR', 'Raleigh, NC',
  'Sacramento, CA', 'Salt Lake City, UT', 'San Antonio, TX', 'San Diego, CA',
  'San Francisco, CA', 'San Jose, CA', 'Seattle, WA', 'St. Louis, MO',
  'Tampa, FL', 'Washington, DC',
]
function defaultDates() {
  const today = new Date()
  const in30 = new Date(today)
  in30.setDate(today.getDate() + 30)
  const fmt = (d) => d.toISOString().slice(0, 10)
  return { start: fmt(today), end: fmt(in30) }
}

export default function WhosPlaying({ session }) {
  const navigate = useNavigate()
  const defaults = defaultDates()
  const [city, setCity] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [includeComedy, setIncludeComedy] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  function toggleLeague(key) {
    setSelectedLeagues(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }
  function toggleGenre(g) {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    )
  }

  const canSearch = city.trim().length > 0 &&
    startDate && endDate &&
    (selectedLeagues.length > 0 || selectedGenres.length > 0 || includeComedy)

  async function handleSearch() {
    if (!canSearch) return
    setLoading(true)
    setResults(null)

    try {
      const musicSelected = selectedGenres.length > 0
      const { data, error } = await supabase.functions.invoke('whos-playing-search', {
        body: {
          city: city.trim(),
          startDate,
          endDate,
          leagues: selectedLeagues,
          musicSelected,
          includeComedy,
        }
      })

      if (error) {
        console.error('Search error:', error)
        setResults([])
        return
      }

      let events = data?.results || []

      // Client-side genre filter: if user picked specific genres,
      // narrow music events to only those genres
      if (musicSelected && selectedGenres.length > 0) {
        events = events.filter(e => {
          if (e.type !== 'music') return true // keep sports + comedy as-is
          if (!e.genre) return false
          // Match user-selected genres against event genre (case-insensitive)
          return selectedGenres.some(g => 
            e.genre.toLowerCase().includes(g.toLowerCase()) ||
            g.toLowerCase().includes(e.genre.toLowerCase())
          )
        })
      }

      setResults(events)
    } catch (e) {
      console.error('Search error:', e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }
  function fmt(d) {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  function categoryColor(event) {
    if (event.parent_event) return '#7B2D8B'
    if (event.type === 'music') return '#7B2D8B'
    if (event.type === 'comedy') return '#F4911E'
    const colors = {
      nfl:'#013369', mlb:'#002D72', nba:'#C9082A',
      nhl:'#0033A0', wnba:'#C9082A', mls:'#002F6C',
      nwsl:'#7B2D8B', cfb:'#BF5700', mcbb:'#0033A0', wcbb:'#0033A0',
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

  function eventTitle(event) {
    if (event.type === 'sport') {
      return `${event.away_team || 'TBD'} @ ${event.home_team || 'TBD'}`
    }
    return event.artist_name || 'Untitled event'
  }

  const chipStyle = (active) => ({
    padding: '6px 14px',
    background: active ? '#1f0f00' : 'var(--surface)',
    border: `1px solid ${active ? 'var(--orange)' : 'var(--border)'}`,
    borderRadius: 999,
    fontSize: 12,
    color: active ? 'var(--orange)' : 'var(--text2)',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    fontFamily: 'var(--head)',
    letterSpacing: 0.3,
  })

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
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Who's Playing</h1>
          <p>Pick a city, a date range, and what you're into.</p>
        </div>

        {/* Search inputs */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{ marginBottom: 14, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--head)', marginBottom: 6 }}>
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={e => {
                setCity(e.target.value)
                setShowCitySuggestions(true)
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              placeholder="e.g., Austin, Chicago, New York"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
                color: 'var(--text)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'var(--body)',
              }}
            />
            {showCitySuggestions && city.trim().length > 0 && (() => {
              const matches = CITIES.filter(c => c.toLowerCase().includes(city.toLowerCase())).slice(0, 8)
              if (matches.length === 0) return null
              return (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  maxHeight: 280,
                  overflowY: 'auto',
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {matches.map(c => (
                    <div
                      key={c}
                      onMouseDown={() => {
                        setCity(c.split(',')[0])
                        setShowCitySuggestions(false)
                      }}
                      style={{
                        padding: '10px 14px',
                        fontSize: 14,
                        color: 'var(--text)',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--head)', marginBottom: 6 }}>
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'var(--body)',
                  colorScheme: 'dark',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--head)', marginBottom: 6 }}>
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'var(--body)',
                  colorScheme: 'dark',
                }}
              />
            </div>
          </div>

          {/* Sports */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--head)', marginBottom: 8 }}>
              Sports
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {LEAGUE_OPTIONS.map(l => (
                <div
                  key={l.key}
                  onClick={() => toggleLeague(l.key)}
                  style={chipStyle(selectedLeagues.includes(l.key))}
                >
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Shows: music genres + comedy */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--head)', marginBottom: 8 }}>
              Shows
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {GENRE_OPTIONS.map(g => (
                <div
                  key={g}
                  onClick={() => toggleGenre(g)}
                  style={chipStyle(selectedGenres.includes(g))}
                >
                  {g}
                </div>
              ))}
              <div
                onClick={() => setIncludeComedy(!includeComedy)}
                style={chipStyle(includeComedy)}
              >
                Comedy
              </div>
            </div>
          </div>

          
          <button
            onClick={handleSearch}
            disabled={!canSearch || loading}
            style={{
              background: canSearch ? 'var(--orange)' : 'var(--surface2)',
              color: canSearch ? '#000' : 'var(--text3)',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontFamily: 'var(--head)',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              cursor: canSearch ? 'pointer' : 'not-allowed',
              width: '100%',
            }}
          >
            {loading ? 'Searching…' : 'Show me what\'s playing'}
          </button>
        </div>

        {/* Results */}
        {results !== null && (
          <>
            <div style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontFamily: 'var(--head)',
              marginBottom: 10,
            }}>
              {results.length === 0 ? 'No results' : `${results.length} events found`}
            </div>

            {results.length === 0 ? (
              <div style={{ color: 'var(--text2)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
                Try a different city or expand your filters.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map(event => (
                  <div key={event.id} style={{
                    background: 'var(--surface)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{
                      fontFamily: 'var(--head)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff',
                      letterSpacing: 0.5,
                      padding: '4px 8px',
                      borderRadius: 6,
                      minWidth: 44,
                      textAlign: 'center',
                      background: categoryColor(event),
                      flexShrink: 0,
                    }}>
                      {categoryLabel(event)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        {eventTitle(event)}
                      </div>
                      {event.parent_event && (
                        <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginTop: 2 }}>
                          {event.parent_event}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {event.venue}{event.city ? ` · ${event.city}` : ''}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--head)',
                      fontSize: 12,
                      color: 'var(--orange)',
                      fontWeight: 600,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}>
                      {fmt(event.event_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

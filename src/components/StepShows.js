import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Step.module.css'

// requireOne: set during onboarding when the user skipped teams, so they can't
// finish with nothing followed (no teams AND no artists = no trips, ever).
// Genre chips on the Music tab. `match` is the Ticketmaster genre name stored in popular_artists.
const GENRES = [
  { label: 'All', match: null },
  { label: 'Rock', match: 'Rock' },
  { label: 'Pop', match: 'Pop' },
  { label: 'Country', match: 'Country' },
  { label: 'Hip-Hop', match: 'Hip-Hop/Rap' },
  { label: 'R&B', match: 'R&B' },
  { label: 'Metal', match: 'Metal' },
  { label: 'Latin', match: 'Latin' },
  { label: 'Electronic', match: 'Dance/Electronic' },
  { label: 'Alternative', match: 'Alternative' },
  { label: 'Other', match: '__other__' },
]
const NAMED_GENRES = GENRES.map(g => g.match).filter(m => m && m !== '__other__')

export default function StepShows({ selected, setSelected, onBack, onFinish, saving, hideFooter, requireOne, stepNumber, totalSteps }) {
  // Opens on "Fan favorites" when there are enough of them (see below).
  const [activeTab, setActiveTab] = useState('Fans')
  const [activeGenre, setActiveGenre] = useState('All')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [popular, setPopular] = useState([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [fanFaves, setFanFaves] = useState([])
  const [loadingFans, setLoadingFans] = useState(true)
  const debounceRef = useRef(null)

  useEffect(() => {
    supabase
      .from('popular_artists')
      .select('attraction_id, name, segment, genre, image, upcoming_events_count, popularity_rank')
      // Most popular touring acts first (set by the weekly refresh; see
      // populate-popular-artists). Older rows without a rank fall back to show count.
      .order('popularity_rank', { ascending: true, nullsFirst: false })
      .order('upcoming_events_count', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPopular(data)
        setLoadingPopular(false)
      })
    // Most-followed artists across Road Dog (names + counts only).
    supabase
      .rpc('fan_favorite_artists', { max_rows: 25 })
      .then(({ data, error }) => {
        if (!error && data) setFanFaves(data)
        setLoadingFans(false)
      })
  }, [])

  // Only offer the tab once there's a real list behind it.
  const showFansTab = fanFaves.length >= 5
  const tab = activeTab === 'Fans' && !showFansTab && !loadingFans ? 'Music' : activeTab

  const isSelected = (name) =>
    selected.some(s => (typeof s === 'string' ? s : s.name).toLowerCase() === name.toLowerCase())

  function addArtist(name, attractionId = null) {
    if (isSelected(name)) return
    setSelected(prev => [...prev, { name, attractionId }])
  }

  function removeArtist(name) {
    setSelected(prev => prev.filter(s =>
      (typeof s === 'string' ? s : s.name).toLowerCase() !== name.toLowerCase()
    ))
  }

  function togglePopular(item) {
    if (isSelected(item.name)) removeArtist(item.name)
    else addArtist(item.name, item.attraction_id)
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('search-artists', {
          body: { query: query.trim() }
        })
        if (error) {
          setSearchResults([])
        } else {
          setSearchResults(data?.results || [])
        }
      } catch (e) {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  let filteredPopular = popular.filter(p => p.segment === tab)
  const genre = GENRES.find(g => g.label === activeGenre) || GENRES[0]
  if (tab === 'Music' && genre.match) {
    filteredPopular = filteredPopular.filter(p =>
      genre.match === '__other__'
        ? !p.genre || !NAMED_GENRES.includes(p.genre)
        : p.genre === genre.match
    )
  }
  // "All" mixes genres: popularity_rank is per genre, so a #1 jazz act would
  // otherwise sit next to the #1 rock act. Weight the big genres up.
  if (tab === 'Music' && !genre.match) {
    const W = { Rock: 1, Pop: 1, Country: 1, 'Hip-Hop/Rap': 1, 'R&B': 1.5, Metal: 1.5 }
    const key = p => (p.popularity_rank ?? 999) * (W[p.genre] || 3)
    filteredPopular = [...filteredPopular].sort((a, b) => key(a) - key(b))
  }
  // Only show genre chips that actually have artists in them.
  const musicPopular = popular.filter(p => p.segment === 'Music')
  const visibleGenres = GENRES.filter(g =>
    !g.match ||
    musicPopular.some(p => g.match === '__other__'
      ? !p.genre || !NAMED_GENRES.includes(p.genre)
      : p.genre === g.match)
  )
  const nothingPicked = selected.length === 0

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        {stepNumber && totalSteps && (
          <div style={{
            fontSize: 11, color: 'var(--orange)', textTransform: 'uppercase',
            letterSpacing: 1, fontFamily: 'var(--head)', fontWeight: 700, marginBottom: 6,
          }}>
            Step {stepNumber} of {totalSteps}
          </div>
        )}
        <h1 className={styles.title}>Shows</h1>
        <p className={styles.sub}>Search for artists or comedians, or pick from popular options below.</p>
      </div>

      {/* Search box */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for any artist or comedian..."
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 15,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text)',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'var(--body)',
          }}
        />
        {query.trim().length >= 2 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {searching ? (
              <div style={{ padding: 16, color: 'var(--text2)', fontSize: 13 }}>Searching…</div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: 16, color: 'var(--text2)', fontSize: 13 }}>
                No artist by that name is on tour right now. Check the spelling, or try again later — once they announce dates, you can follow them here.
              </div>
            ) : (
              searchResults.map(result => {
                const alreadyAdded = isSelected(result.name)
                return (
                  <div
                    key={result.id}
                    onClick={() => {
                      if (alreadyAdded) {
                        removeArtist(result.name)
                      } else {
                        addArtist(result.name, result.id)
                        setQuery('')
                      }
                    }}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: alreadyAdded ? '#1f0f00' : 'transparent',
                    }}
                  >
                    {result.image && (
                      <img
                        src={result.image}
                        alt=""
                        style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>
                        {result.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {result.genre || result.segment} · {result.upcomingEventsCount} upcoming events
                      </div>
                    </div>
                    <div style={{ color: alreadyAdded ? 'var(--orange)' : 'var(--text3)', fontSize: 18, fontWeight: 700 }}>
                      {alreadyAdded ? '✓' : '+'}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <div style={{
              fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: 0.5, fontFamily: 'var(--head)',
            }}>
              Selected ({selected.length})
            </div>
            <button
              onClick={() => setSelected([])}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--orange)', fontSize: 12,
                cursor: 'pointer', fontFamily: 'var(--head)',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}
            >
              Clear all
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selected.map((s, idx) => {
              const name = typeof s === 'string' ? s : s.name
              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    background: '#1f0f00',
                    border: '1px solid var(--orange)',
                    borderRadius: 999,
                    fontSize: 12,
                    color: 'var(--text)',
                  }}
                >
                  <span>{name}</span>
                  <button
                    onClick={() => removeArtist(name)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--orange)',
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                    }}
                    aria-label={`Remove ${name}`}
                  >×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{
        fontSize: 11,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginTop: 8,
        fontFamily: 'var(--head)',
      }}>
        Popular right now
      </div>

      {/* Fan favorites / Music / Comedy tabs */}
      <div className={styles.tabs} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {showFansTab && (
          <div
            className={`${styles.tab} ${tab === 'Fans' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('Fans')}
            style={{ whiteSpace: 'nowrap' }}
          >
            ⭐ Fan favorites
          </div>
        )}
        <div
          className={`${styles.tab} ${tab === 'Music' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Music')}
          style={{ whiteSpace: 'nowrap' }}
        >
          🎤 Music
        </div>
        <div
          className={`${styles.tab} ${tab === 'Comedy' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Comedy')}
          style={{ whiteSpace: 'nowrap' }}
        >
          😂 Comedy
        </div>
      </div>

      {tab === 'Music' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {visibleGenres.map(({ label: g }) => (
            <div
              key={g}
              onClick={() => setActiveGenre(g)}
              style={{
                padding: '5px 12px',
                background: activeGenre === g ? '#1f0f00' : 'var(--surface)',
                border: `1px solid ${activeGenre === g ? 'var(--orange)' : 'var(--border)'}`,
                borderRadius: 999,
                fontSize: 11,
                color: activeGenre === g ? 'var(--orange)' : 'var(--text2)',
                fontWeight: activeGenre === g ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'var(--head)',
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {g}
            </div>
          ))}
        </div>
      )}

      <div className={styles.showList} style={hideFooter ? undefined : { paddingBottom: 96 }}>
        {tab === 'Fans' && loadingFans ? (
          <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12 }}>Loading…</div>
        ) : tab === 'Fans' ? (
          <>
            <div style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 10px' }}>
              The artists Road Dog fans follow most.
            </div>
            {fanFaves.map(item => {
              const sel = isSelected(item.artist_name)
              return (
                <div
                  key={item.artist_name}
                  className={`${styles.showRow} ${sel ? styles.sel : ''}`}
                  onClick={() => sel ? removeArtist(item.artist_name) : addArtist(item.artist_name, item.attraction_id)}
                >
                  <span>
                    {item.artist_name}
                    {/* Counts only once they're big enough to impress a stranger. */}
                    {item.fans >= 100 && (
                      <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 8 }}>
                        {item.fans} fans
                      </span>
                    )}
                  </span>
                  <div className={`${styles.showCheck} ${sel ? styles.checked : ''}`}>
                    {sel && '✓'}
                  </div>
                </div>
              )
            })}
          </>
        ) : loadingPopular ? (
          <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12 }}>Loading…</div>
        ) : filteredPopular.length === 0 ? (
          <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12 }}>
            Nothing here right now. Try searching above.
          </div>
        ) : (
          filteredPopular.map(item => {
            const sel = isSelected(item.name)
            return (
              <div
                key={item.attraction_id}
                className={`${styles.showRow} ${sel ? styles.sel : ''}`}
                onClick={() => togglePopular(item)}
              >
                <span>
                  {item.name}
                  {item.genre && (
                    <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 8 }}>
                      {item.genre}
                    </span>
                  )}
                </span>
                <div className={`${styles.showCheck} ${sel ? styles.checked : ''}`}>
                  {sel && '✓'}
                </div>
              </div>
            )
          })
        )}
      </div>

      {!hideFooter && (
        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Back">←<span className={styles.backWord}> Back</span></button>
          {requireOne && nothingPicked
            ? <div className={styles.count} style={{ textAlign: 'center' }}>Pick an artist</div>
            : <div className={styles.count}><b>{selected.length}</b> selected</div>}
          <button
            className={styles.nextBtn}
            onClick={() => onFinish(selected)}
            disabled={saving || (requireOne && nothingPicked)}
          >
            {saving
              ? 'Building your trips…'
              : nothingPicked && !requireOne
                ? 'Skip — show my trips →'
                : 'Find my trips →'}
          </button>
        </div>
      )}
    </div>
  )
}

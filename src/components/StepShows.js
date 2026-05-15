import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Step.module.css'

export default function StepShows({ selected, setSelected, onBack, onFinish, saving, hideFooter }) {
  const [activeTab, setActiveTab] = useState('Music')
  const [activeGenre, setActiveGenre] = useState('All')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [popular, setPopular] = useState([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const debounceRef = useRef(null)

  // Load popular artists on mount
  useEffect(() => {
    supabase
      .from('popular_artists')
      .select('attraction_id, name, segment, genre, image, upcoming_events_count')
      .order('upcoming_events_count', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPopular(data)
        setLoadingPopular(false)
      })
  }, [])

  // Helpers — selected is an array of {name, attractionId|null}
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

  // Debounced search
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

  let filteredPopular = popular.filter(p => p.segment === activeTab)
  if (activeTab === 'Music' && activeGenre !== 'All') {
    filteredPopular = filteredPopular.filter(p => {
      if (activeGenre === 'Other') {
        // "Other" catches anything not in main genres
        const mainGenres = ['Rock', 'Pop', 'Country', 'Hip-Hop/Rap', 'R&B', 'Dance/Electronic']
        return !p.genre || !mainGenres.includes(p.genre)
      }
      return p.genre === activeGenre
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
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
                No matching artists with upcoming events. Try a different name?
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
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 16,
          padding: '8px 0',
        }}>
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
                >
                  ×
                </button>
              </div>
            )
          })}
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

      {/* Music / Comedy tabs */}
      <div className={styles.tabs} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        <div
          className={`${styles.tab} ${activeTab === 'Music' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Music')}
          style={{ whiteSpace: 'nowrap' }}
        >
          🎤 Music
        </div>
        <div
          className={`${styles.tab} ${activeTab === 'Comedy' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('Comedy')}
          style={{ whiteSpace: 'nowrap' }}
        >
          😂 Comedy
        </div>
      </div>
      {/* Music genre sub-tabs (only show when Music is active) */}
      {activeTab === 'Music' && (
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}>
          {['All', 'Rock', 'Pop', 'Country', 'Hip-Hop/Rap', 'R&B', 'Dance/Electronic', 'Other'].map(g => (
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

      <div className={styles.showList}>
        {loadingPopular ? (
          <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12 }}>
            Loading…
          </div>
        ) : filteredPopular.length === 0 ? (
          <div style={{ color: 'var(--text2)', fontSize: 13, padding: 12 }}>
            No popular artists found. Try searching above.
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
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <div className={styles.count}><b>{selected.length}</b> selected</div>
          <button
            className={styles.nextBtn}
            onClick={() => onFinish(selected)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  )
}

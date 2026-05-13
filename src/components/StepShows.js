import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Step.module.css'

const ARTISTS = {
  rock: [
    'Foo Fighters', 'Green Day', 'Blink-182', 'Weezer', 'Muse',
    'Arctic Monkeys', 'Queens of the Stone Age', 'Jack White', 'Beck', 'Interpol',
    'My Chemical Romance', 'Rush', "Guns N'Roses", 'Metallica', 'Pearl Jam',
    'Red Hot Chili Peppers', 'The Black Keys', 'Tame Impala', 'Radiohead', 'The Strokes',
  ],
  pop: [
    'Taylor Swift', 'Ariana Grande', 'The Weeknd', 'Ed Sheeran', 'Coldplay',
    'Billie Eilish', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Chappell Roan', 'Dua Lipa',
    'Bruno Mars', 'Post Malone', 'Lady Gaga', 'Doja Cat', 'Cardi B',
    'SZA', 'Lizzo', 'Harry Styles', 'Noah Kahan', 'Hozier',
  ],
  hiphop: [
    'Kendrick Lamar', 'Bad Bunny', 'Drake', 'Tyler the Creator', 'J. Cole',
    'Eminem', 'Travis Scott', 'Lil Wayne', 'Future', '21 Savage',
    'Childish Gambino', 'Lil Baby', 'Gunna', 'Vince Staples', 'Joey Bada$$',
    'Pusha T', 'JPEGMAFIA', 'Ice Spice', 'GloRilla', 'Doechii',
  ],
  country: [
    'Morgan Wallen', 'Zach Bryan', 'Luke Combs', 'Chris Stapleton', 'Kacey Musgraves',
    'Lainey Wilson', 'Tyler Childers', 'Jason Isbell', 'Cody Johnson', 'Eric Church',
    'Miranda Lambert', 'Megan Moroney', 'Hardy', 'Jelly Roll', 'Shaboozey',
    'Thomas Rhett', 'Kane Brown', 'Dierks Bentley', 'Blake Shelton', 'Carrie Underwood',
  ],
  indie: [
    'Bon Iver', 'Phoebe Bridgers', 'Boygenius', 'Mitski', 'Big Thief',
    'The National', 'Vampire Weekend', 'LCD Soundsystem', 'Arcade Fire', 'Waxahatchee',
    'Angel Olsen', 'Sharon Van Etten', 'Japanese Breakfast', 'Soccer Mommy', 'Snail Mail',
    'Weyes Blood', 'Faye Webster', 'Gracie Abrams', 'Fleet Foxes', 'Death Cab for Cutie',
  ],
  comedy: [
    'Nate Bargatze', 'John Mulaney', 'Dave Chappelle', 'Nikki Glaser', 'Bert Kreischer',
    'Taylor Tomlinson', 'Shane Gillis', 'Bill Burr', 'Kevin Hart', 'Jerry Seinfeld',
    'Jim Gaffigan', 'Ali Wong', 'Sebastian Maniscalco', 'Andrew Schulz', 'Tom Segura',
    'Theo Von', 'Matt Rife', 'Neal Brennan', 'Mark Normand', 'Hannah Gadsby',
  ],
}

const GENRE_LABELS = {
  rock: '🎸 Rock',
  pop: '🎤 Pop',
  hiphop: '🎧 Hip-Hop',
  country: '🤠 Country',
  indie: '🌿 Indie & Folk',
  comedy: '😂 Comedy',
}

export default function StepShows({ selected, setSelected, onBack, onFinish, saving }) {
  const [genre, setGenre] = useState('rock')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

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

  function toggleFromGrid(name) {
    if (isSelected(name)) removeArtist(name)
    else addArtist(name, null)
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
        {/* Search results dropdown */}
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
        Popular suggestions
      </div>

      <div className={styles.tabs} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {Object.entries(GENRE_LABELS).map(([key, label]) => (
          <div
            key={key}
            className={`${styles.tab} ${genre === key ? styles.tabActive : ''}`}
            onClick={() => setGenre(key)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className={styles.showList}>
        {ARTISTS[genre].map(name => {
          const sel = isSelected(name)
          return (
            <div
              key={name}
              className={`${styles.showRow} ${sel ? styles.sel : ''}`}
              onClick={() => toggleFromGrid(name)}
            >
              <span>{name}</span>
              <div className={`${styles.showCheck} ${sel ? styles.checked : ''}`}>
                {sel && '✓'}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.count}><b>{selected.length}</b> selected</div>
        <button
          className={styles.nextBtn}
          onClick={() => onFinish(selected)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

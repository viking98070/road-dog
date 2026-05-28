import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ComboDetail.module.css'

export default function ComboDetail({ combo, onBack }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!combo.event_ids || combo.event_ids.length === 0) { setLoading(false); return }
    supabase.from('events').select('*').in('id', combo.event_ids).order('event_date')
      .then(({ data }) => { setEvents(data || []); setLoading(false) })
  }, [combo])

const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
  const fmtRange = (s,e) => `${new Date(s + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(e + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`
function displayCity(combo) {
    const cities = combo.cities && combo.cities.length > 0 ? combo.cities : [combo.city]
    if (!cities[0]) return ''
    if (cities.length === 1) return cities[0]
    if (cities.length === 2) return `${cities[0]} & ${cities[1]}`
    return `${cities[0]}, ${cities[1]} +${cities.length - 2} more`
  }
  function categoryColor(event) {
  if (event.league_key === 'marquee') return '#B8860B'
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
  if (event.league_key === 'marquee') {
    return event.artist_name || 'Marquee Event'
  }
  if (event.type === 'sport') {
    const away = event.away_team || 'TBD'
    const home = event.home_team || 'TBD'
    return <>{away} <span>@</span> {home}</>
  }
  return event.artist_name || 'Untitled event'
}

  function lineupPreview(event) {
    if (!event.lineup || event.lineup.length === 0) return null
    // Filter the user's own artist out of the "also playing" list
    const others = event.lineup.filter(name =>
      (name || '').toLowerCase() !== (event.artist_name || '').toLowerCase() &&
      (name || '').toLowerCase() !== (event.parent_event || '').toLowerCase()
    )
    if (others.length === 0) return null
    const preview = others.slice(0, 4).join(', ')
    const more = others.length > 4 ? ` +${others.length - 4} more` : ''
    return `Also playing: ${preview}${more}`
  }
// Group events by artist+venue or matchup+venue. Multi-night sequences collapse.
  function groupEvents(events) {
    const groups = []
    const used = new Set()
    
    for (const event of events) {
      if (used.has(event.id)) continue
      
      // Build a grouping key per event
      let key
      if (event.type === 'sport') {
        key = `${event.away_team}|${event.home_team}|${event.venue}`
      } else {
        key = `${event.artist_name}|${event.venue}`
      }
      
      // Find all events matching this key
      const matches = events.filter(e => {
        if (used.has(e.id)) return false
        let eKey
        if (e.type === 'sport') {
          eKey = `${e.away_team}|${e.home_team}|${e.venue}`
        } else {
          eKey = `${e.artist_name}|${e.venue}`
        }
        return eKey === key
      })
      
      // Mark them all as used
      matches.forEach(m => used.add(m.id))
      
      // Sort by date
      matches.sort((a, b) => a.event_date.localeCompare(b.event_date))
      
      groups.push({
        primary: matches[0],
        count: matches.length,
        firstDate: matches[0].event_date,
        lastDate: matches[matches.length - 1].event_date,
      })
    }
    return groups
  }
  const badge = combo.score >= 4 ? '🔥 Hot combo' : combo.score >= 2 ? '⭐ Great combo' : '✈️ Good combo'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>← Back</button>
        <div className={styles.logo}>Road<span>Dog</span></div>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroCity}>{displayCity(combo)}</div>
        <div className={styles.heroDates}>{fmtRange(combo.start_date, combo.end_date)}</div>
        <div className={styles.heroBadge}>{badge}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.sectionTitle}>What's happening</div>
        {loading ? (
          <div className={styles.loading}><div className={styles.spinner}/><p>Loading…</p></div>
        ) : events.length === 0 ? (
          <p className={styles.empty}>No event details found.</p>
        ) : (
          <div className={styles.eventList}>
            {groupEvents(events).map(group => {
              const event = group.primary
              const lineup = lineupPreview(event)
              const isMultiNight = group.count > 1
              return (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventLeague} style={{background:categoryColor(event)}}>{categoryLabel(event)}</div>
                  <div className={styles.eventInfo}>
                    <div className={styles.eventName}>
                      {eventTitle(event)}
                      {isMultiNight && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>
                          × {group.count} nights
                        </span>
                      )}
                    </div>
                    {event.parent_event && (
                      <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginTop: 2 }}>
                        {event.parent_event}
                      </div>
                    )}
                    <div className={styles.eventMeta}>{event.venue}{event.city ? ` · ${event.city}` : ''}</div>
                    {lineup && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }}>
                        {lineup}
                      </div>
                    )}
                  </div>
                  <div className={styles.eventDate}>
  {isMultiNight
    ? fmtRange(group.firstDate, group.lastDate)
    : event.end_date && event.end_date !== event.event_date
      ? fmtRange(event.event_date, event.end_date)
      : fmt(event.event_date)}
</div>
                </div>
              )
            })}
          </div>
        )}
        <div className={styles.sectionTitle} style={{marginTop:28}}>Plan your trip</div>
        <div className={styles.planGrid}>
          <a 
            href={`https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(combo.city)}%20${combo.start_date}%20to%20${combo.end_date}`}
            target="_blank" 
            rel="noreferrer" 
            className={styles.planCard}
          >
            <div className={styles.planIcon}>✈️</div>
            <div className={styles.planLabel}>Flights</div>
            <div className={styles.planSub}>Google Flights</div>
          </a>
          <a 
            href={`https://www.google.com/travel/hotels/${encodeURIComponent(combo.city)}?q=Hotels%20in%20${encodeURIComponent(combo.city)}&checkin=${combo.start_date}&checkout=${combo.end_date}`}
            target="_blank" 
            rel="noreferrer" 
            className={styles.planCard}
          >
            <div className={styles.planIcon}>🏨</div>
            <div className={styles.planLabel}>Hotels</div>
            <div className={styles.planSub}>Google Hotels</div>
          </a>
          <a 
            href={`https://www.stubhub.com/find/s/?q=${encodeURIComponent(combo.city)}`}
            target="_blank" 
            rel="noreferrer" 
            className={styles.planCard}
          >
            <div className={styles.planIcon}>🎟️</div>
            <div className={styles.planLabel}>Tickets</div>
            <div className={styles.planSub}>StubHub</div>
          </a>
        </div>
      </div>
    </div>
  )
}

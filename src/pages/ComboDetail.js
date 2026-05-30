import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ComboDetail.module.css'

const METRO_CLUSTERS = {
  'New York, NY': ['Bronx, NY', 'Brooklyn, NY', 'Queens, NY', 'Staten Island, NY', 'Newark, NJ', 'East Rutherford, NJ', 'Elmont, NY', 'Uniondale, NY'],
  'Los Angeles, CA': ['Anaheim, CA', 'Carson, CA', 'Inglewood, CA', 'Burbank, CA', 'Long Beach, CA', 'El Segundo, CA', 'Cerritos, CA'],
  'San Francisco, CA': ['Oakland, CA', 'San Jose, CA', 'Berkeley, CA', 'Santa Clara, CA', 'Fremont, CA'],
  'Dallas, TX': ['Arlington, TX', 'Addison, TX', 'Irving, TX', 'Frisco, TX'],
  'Washington, DC': ['Alexandria, VA', 'Arlington, VA', 'Landover, MD', 'Bristow, VA'],
  'Philadelphia, PA': ['Camden, NJ', 'Bensalem, PA', 'Voorhees, NJ'],
  'Chicago, IL': ['Bridgeview, IL', 'Rosemont, IL', 'Tinley Park, IL'],
  'Boston, MA': ['Foxborough, MA', 'Worcester, MA', 'Providence, RI', 'Wantagh, NY'],
  'Miami, FL': ['Fort Lauderdale, FL', 'Sunrise, FL', 'Miami Gardens, FL', 'West Palm Beach, FL'],
  'Atlanta, GA': ['Alpharetta, GA', 'Duluth, GA', 'Kennesaw, GA', 'Marietta, GA'],
  'Seattle, WA': ['Tacoma, WA', 'Bellevue, WA', 'Auburn, WA', 'Airway Heights, WA', 'George, WA'],
  'Denver, CO': ['Aurora, CO', 'Commerce City, CO', 'Morrison, CO'],
  'Phoenix, AZ': ['Glendale, AZ', 'Tempe, AZ', 'Scottsdale, AZ', 'Mesa, AZ', 'Chandler, AZ'],
  'Minneapolis, MN': ['Saint Paul, MN', 'Bloomington, MN'],
  'Tampa, FL': ['St. Petersburg, FL', 'Clearwater, FL', 'Brandon, FL'],
  'Kansas City, MO': ['Independence, MO', 'Bonner Springs, KS'],
  'Nashville, TN': ['Murfreesboro, TN', 'Franklin, TN'],
  'Portland, OR': ['Beaverton, OR', 'Hillsboro, OR', 'Ridgefield, WA'],
  'Pittsburgh, PA': ['Burgettstown, PA'],
  'Charlotte, NC': ['Concord, NC'],
  'Las Vegas, NV': ['Henderson, NV', 'Paradise, NV'],
  'Indianapolis, IN': ['Noblesville, IN', 'Fishers, IN'],
  'Cincinnati, OH': ['Covington, KY', 'Newport, KY'],
}

const SUBURB_TO_PRIMARY = {}
for (const [primary, suburbs] of Object.entries(METRO_CLUSTERS)) {
  for (const suburb of suburbs) SUBURB_TO_PRIMARY[suburb] = primary
}

function collapseCities(cities) {
  if (!cities || cities.length === 0) return cities
  const collapsed = []
  for (const city of cities) {
    const mapped = SUBURB_TO_PRIMARY[city] || city
    if (!collapsed.includes(mapped)) collapsed.push(mapped)
  }
  return collapsed
}

export default function ComboDetail({ combo, onBack }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!combo.event_ids || combo.event_ids.length === 0) { setLoading(false); return }
    supabase.from('events').select('*').in('id', combo.event_ids).order('event_date')
      .then(({ data }) => { setEvents(data || []); setLoading(false) })
  }, [combo])

  const fmt = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
  const fmtRange = (s, e) => `${new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' })} – ${new Date(e + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' })}`

  function displayCity(combo) {
    const raw = combo.cities && combo.cities.length > 0 ? combo.cities : [combo.city]
    const cities = collapseCities(raw)
    if (!cities[0]) return ''
    if (cities.length === 1) return cities[0]
    if (cities.length === 2) return `${cities[0]} & ${cities[1]}`
    const last = cities[cities.length - 1]
    const rest = cities.slice(0, -1).join(', ')
    return `${rest} & ${last}`
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

  function eventTitle(event) {
    if (event.league_key === 'marquee') return event.artist_name || 'Marquee Event'
    if (event.type === 'sport') {
      const away = event.away_team || 'TBD'
      const home = event.home_team || 'TBD'
      return <>{away} <span>@</span> {home}</>
    }
    return event.artist_name || 'Untitled event'
  }

  function lineupPreview(event) {
    if (!event.lineup || event.lineup.length === 0) return null
    const others = event.lineup.filter(name =>
      (name || '').toLowerCase() !== (event.artist_name || '').toLowerCase() &&
      (name || '').toLowerCase() !== (event.parent_event || '').toLowerCase()
    )
    if (others.length === 0) return null
    const preview = others.slice(0, 4).join(', ')
    const more = others.length > 4 ? ` +${others.length - 4} more` : ''
    return `Also playing: ${preview}${more}`
  }

  function groupEvents(events) {
    const groups = []
    const used = new Set()
    for (const event of events) {
      if (used.has(event.id)) continue
      let key
      if (event.type === 'sport') {
        key = `${event.away_team}|${event.home_team}|${event.venue}`
      } else {
        key = `${event.artist_name}|${event.venue}`
      }
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
      matches.forEach(m => used.add(m.id))
      matches.sort((a, b) => a.event_date.localeCompare(b.event_date))
      groups.push({
        primary: matches[0],
        count: matches.length,
        firstDate: matches[0].event_date,
        lastDate: matches[matches.length - 1].event_date,
        endDate: matches[0].end_date || null,
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
                      : group.endDate && group.endDate !== event.event_date
                        ? fmtRange(event.event_date, group.endDate)
                        : fmt(event.event_date)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className={styles.sectionTitle} style={{marginTop:28}}>Plan your trip</div>
        <div className={styles.planGrid}>
          
            href={`https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(combo.city)}%20${combo.start_date}%20to%20${combo.end_date}`}
            target="_blank"
            rel="noreferrer"
            className={styles.planCard}
          >
            <div className={styles.planIcon}>✈️</div>
            <div className={styles.planLabel}>Flights</div>
            <div className={styles.planSub}>Google Flights</div>
          </a>
          
            href={`https://www.google.com/travel/hotels/${encodeURIComponent(combo.city)}?q=Hotels%20in%20${encodeURIComponent(combo.city)}&checkin=${combo.start_date}&checkout=${combo.end_date}`}
            target="_blank"
            rel="noreferrer"
            className={styles.planCard}
          >
            <div className={styles.planIcon}>🏨</div>
            <div className={styles.planLabel}>Hotels</div>
            <div className={styles.planSub}>Google Hotels</div>
          </a>
          
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

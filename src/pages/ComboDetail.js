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

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function ticketUrl(event) {
  const base = 'https://seatgeek.com/'
  if (event.type === 'sport') {
    const team = event.home_team || event.away_team || ''
    let slug = slugify(team)
    if (!slug) return base
    if (event.league_key === 'cfb') slug += '-football'
    if (event.league_key === 'mcbb' || event.league_key === 'wcbb') slug += '-basketball'
    return `${base}${slug}-tickets`
  }
  const name = event.artist_name || event.parent_event || ''
  const slug = slugify(name)
  return slug ? `${base}${slug}-tickets` : base
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
    if (cities.length === 3) return `${cities[0]}, ${cities[1]} & ${cities[2]}`
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

  function eventLocation(event) {
    if (event.city && event.state) return `${event.city}, ${event.state}`
    if (event.city) return event.city
    return ''
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
              const location = eventLocation(event)
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
                    <div className={styles.eventMeta}>{event.venue}{location ? ` · ${location}` : ''}</div>
                    {lineup && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }}>
                        {lineup}
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>{(<a href={ticketUrl(event)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', textDecoration: 'none' }}>Get tickets ↗</a>)}</div>
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
        {(() => {
          const raw = combo.cities && combo.cities.length > 0 ? combo.cities : [combo.city]
          const primaryCity = collapseCities(raw)[0] || combo.city || ''
          const isoDate = dt => {
            const y = dt.getFullYear()
            const m = String(dt.getMonth() + 1).padStart(2, '0')
            const day = String(dt.getDate()).padStart(2, '0')
            return `${y}-${m}-${day}`
          }
          const shiftDate = (d, delta) => {
            const dt = new Date(d + 'T12:00:00')
            dt.setDate(dt.getDate() + delta)
            return isoDate(dt)
          }
          const flyIn = shiftDate(combo.start_date, -1)
          const flyOut = shiftDate(combo.end_date, 1)
          const flightsQuery = `flights to ${primaryCity} on ${flyIn} through ${flyOut}`
          const links = [
            { icon: '✈️', label: 'Flights', sub: 'Google Flights', url: 'https://www.google.com/travel/flights?q=' + encodeURIComponent(flightsQuery) },
            { icon: '🏨', label: 'Hotels', sub: 'Google Hotels', url: 'https://www.google.com/travel/search?q=' + encodeURIComponent('hotels in ' + primaryCity) },
          ]
          return (
            <div className={styles.planGrid}>
              {links.map(link => (<a key={link.label} href={link.url} target="_blank" rel="noreferrer" className={styles.planCard}>
                  <div className={styles.planIcon}>{link.icon}</div>
                  <div className={styles.planLabel}>{link.label}</div>
                  <div className={styles.planSub}>{link.sub}</div>
                </a>))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

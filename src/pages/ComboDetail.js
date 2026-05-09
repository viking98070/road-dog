import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './ComboDetail.module.css'

export default function ComboDetail({ combo, onBack }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [combo])

  async function loadEvents() {
    if (!combo.event_ids || combo.event_ids.length === 0) {
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', combo.event_ids)
      .order('event_date')

    if (!error) setEvents(data || [])
    setLoading(false)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    })
  }

  function formatDateRange(start, end) {
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${s} – ${e}`
  }

  function leagueColor(key) {
    const colors = {
      nfl: '#013369', mlb: '#002D72', nba: '#C9082A',
      nhl: '#0033A0', wnba: '#C9082A', mls: '#002F6C',
    }
    return colors[key] || '#444'
  }

  function leagueLabel(key) {
    const labels = {
      nfl: 'NFL', mlb: 'MLB', nba: 'NBA',
      nhl: 'NHL', wnba: 'WNBA', mls: 'MLS',
    }
    return labels[key] || key.toUpperCase()
  }

  function scoreLabel(score) {
    if (score >= 7) return { text: '🔥 Hot combo', color: '#F97316' }
    if (score >= 5) return { text: '⭐ Great combo', color: '#F97316' }
    return { text: '✈️ Good combo', color: '#A0A0A0' }
  }

  const badge = scoreLabel(combo.score)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>← Back</button>
        <div className={styles.logo}>Road<span>Dog</span></div>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroCity}>{combo.city}</div>
        <div className={styles.heroDates}>{formatDateRange(combo.start_date, combo.end_date)}</div>
        <div className={styles.heroBadge} style={{ color: badge.color }}>{badge.text}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.sectionTitle}>What's happening</div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading events…</p>
          </div>
        ) : events.length === 0 ? (
          <p className={styles.empty}>No event details found.</p>
        ) : (
          <div className={styles.eventList}>
            {events.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventLeague} style={{ background: leagueColor(event.league_key) }}>
                  {leagueLabel(event.league_key)}
                </div>
                <div className={styles.eventInfo}>
                  <div className={styles.eventName}>
                    {event.away_team} <span>@</span> {event.home_team}
                  </div>
                  <div className={styles.eventMeta}>
                    {event.venue && <span>{event.venue}</span>}
                  </div>
                </div>
                <div className={styles.eventDate}>{formatDate(event.event_date)}</div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.sectionTitle} style={{ marginTop: 28 }}>Plan your trip</div>
        <div className={styles.planGrid}>
          
            href={`https://www.google.com/flights#search;f=ORD;t=${combo.city.split(',')[0].replace(/ /g,'+')}`}
            target="_blank"
            rel="noreferrer"
            className={styles.planCard}
          >
            <div className={styles.planIcon}>✈️</div>
            <div className={styles.planLabel}>Search Flights</div>
            <div className={styles.planSub}>Google Flights</div>
          </a>
          
            href={`https://www.hotels.com/search.do?q-destination=${combo.city.replace(/ /g,'+')}`}
            target="_blank"
            rel="noreferrer"
            className={styles.planCard}
          >
            <div className={styles.planIcon}>🏨</div>
            <div className={styles.planLabel}>Find Hotels</div>
            <div className={styles.planSub}>Hotels.com</div>
          </a>
          
            href={`https://www.stubhub.com/`}
            target="_blank"
            rel="noreferrer"
            className={styles.planCard}
          >
            <div className={styles.planIcon}>🎟️</div>
            <div className={styles.planLabel}>Get Tickets</div>
            <div className={styles.planSub}>StubHub</div>
          </a>
        </div>
      </div>
    </div>
  )
}

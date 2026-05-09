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

  const fmt = d => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
  const fmtRange = (s,e) => `${new Date(s).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(e).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`
  const leagueColor = k => ({nfl:'#013369',mlb:'#002D72',nba:'#C9082A',nhl:'#0033A0',wnba:'#C9082A',mls:'#002F6C'})[k]||'#444'
  const leagueLabel = k => ({nfl:'NFL',mlb:'MLB',nba:'NBA',nhl:'NHL',wnba:'WNBA',mls:'MLS'})[k]||k.toUpperCase()
  const badge = combo.score >= 7 ? '🔥 Hot combo' : combo.score >= 5 ? '⭐ Great combo' : '✈️ Good combo'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>← Back</button>
        <div className={styles.logo}>Road<span>Dog</span></div>
      </div>
      <div className={styles.hero}>
        <div className={styles.heroCity}>{combo.city}</div>
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
            {events.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventLeague} style={{background:leagueColor(event.league_key)}}>{leagueLabel(event.league_key)}</div>
                <div className={styles.eventInfo}>
                  <div className={styles.eventName}>{event.away_team} <span>@</span> {event.home_team}</div>
                  <div className={styles.eventMeta}>{event.venue}</div>
                </div>
                <div className={styles.eventDate}>{fmt(event.event_date)}</div>
              </div>
            ))}
          </div>
        )}
        <div className={styles.sectionTitle} style={{marginTop:28}}>Plan your trip</div>
        <div className={styles.planGrid}>
          <a href="https://www.google.com/flights" target="_blank" rel="noreferrer" className={styles.planCard}>
            <div className={styles.planIcon}>✈️</div>
            <div className={styles.planLabel}>Flights</div>
            <div className={styles.planSub}>Google Flights</div>
          </a>
          <a href="https://www.hotels.com" target="_blank" rel="noreferrer" className={styles.planCard}>
            <div className={styles.planIcon}>🏨</div>
            <div className={styles.planLabel}>Hotels</div>
            <div className={styles.planSub}>Hotels.com</div>
          </a>
          <a href="https://www.stubhub.com" target="_blank" rel="noreferrer" className={styles.planCard}>
            <div className={styles.planIcon}>🎟️</div>
            <div className={styles.planLabel}>Tickets</div>
            <div className={styles.planSub}>StubHub</div>
          </a>
        </div>
      </div>
    </div>
  )
}

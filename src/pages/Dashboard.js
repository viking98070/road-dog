import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ComboDetail from './ComboDetail'
import styles from './Dashboard.module.css'

export default function Dashboard({ session }) {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadCombos()
  }, [])

  async function loadCombos() {
    const { data, error } = await supabase
      .from('trip_combos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('score', { ascending: false })
      .order('start_date', { ascending: true })
    if (!error) setCombos(data || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function formatScore(score) {
    if (score >= 7) return '🔥 Hot combo'
    if (score >= 5) return '⭐ Great combo'
    return '✈️ Good combo'
  }

  if (selected) {
    return <ComboDetail combo={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Road<span>Dog</span></div>
        <button className={styles.signOut} onClick={handleSignOut}>Sign out</button>
      </header>
      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Trip Combos</h1>
          <p>Away games and shows that line up in the same city.</p>
        </div>
        {loading ? (
          <div className={styles.empty}>
            <div className={styles.spinner} />
            <p>Loading your combos…</p>
          </div>
        ) : combos.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✈️</div>
            <h2>No combos yet</h2>
            <p>We're scanning schedules for your teams. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {combos.map(combo => (
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
                <div className={styles.cardEvents}>
                  {combo.score} events that weekend →
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

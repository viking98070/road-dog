import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Dashboard.module.css'

export default function Dashboard({ session }) {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCombos()
  }, [])

  async function loadCombos() {
    const { data, error } = await supabase
      .from('trip_combos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('start_date', { ascending: true })

    if (!error) setCombos(data || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
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
            <p>We're building your profile. Add your teams and artists to start finding trips.</p>
            <button className={styles.btn}>Set up your interests</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {combos.map(combo => (
              <div key={combo.id} className={styles.card}>
                <div className={styles.cardCity}>{combo.city}</div>
                <div className={styles.cardDates}>
                  {new Date(combo.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' – '}
                  {new Date(combo.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className={styles.cardEvents}>
                  {combo.event_ids.length} events
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

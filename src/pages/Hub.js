import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Dashboard.module.css'

export default function Hub({ session }) {
  const navigate = useNavigate()
  const [comboCount, setComboCount] = useState(null)

  useEffect(() => {
    supabase
      .from('trip_combos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .then(({ count }) => setComboCount(count ?? 0))
  }, [session.user.id])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const cardStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '28px 24px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    position: 'relative',
  }

  const titleStyle = {
    fontFamily: 'var(--head)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Road<span>Dog</span></div>
        <button className={styles.signOut} onClick={handleSignOut}>Sign out</button>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Welcome back</h1>
          <p>Pick a way to explore.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, margin: '0 auto', width: '100%' }}>
          {/* Trip Combos card */}
          <div
            onClick={() => navigate('/combos')}
            style={cardStyle}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--orange)'}

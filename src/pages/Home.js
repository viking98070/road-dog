import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
export default function Home() {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <header style={{
        padding: '20px 24px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--head)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          Road<span style={{ color: 'var(--orange)' }}>Dog</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 18px',
            color: 'var(--text2)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--head)',
            letterSpacing: 0.3,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </header>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Introducing Road Dog</div>
        <h1 className={styles.headline}>
          Your game.<br /><span>Their city.</span>
        </h1>
        <p className={styles.sub}>
          Follow your teams and artists. Road Dog finds the weekends when
          everything lines up — and builds the trip around it.
        </p>
        <div className={styles.pills}>
          <span>🏈 Away games & must-see events</span>
          <span>🎵 Live shows</span>
          <span>🎤 Comedy</span>
          <span>✈️ Trip planning</span>
        </div>
        <button className={styles.cta} onClick={() => navigate('/login')}>
          Get started
        </button>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: 'var(--orange)', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  )
}

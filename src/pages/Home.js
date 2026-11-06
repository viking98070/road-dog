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
        <div className={styles.eyebrow}>Sports &amp; music road trips</div>
        <h1 className={styles.headline}>
          Your game.<br /><span>Their city.</span>
        </h1>
        <p className={styles.sub}>
          Pick your teams and artists. We find the weekends they land in the same city.
        </p>
        <button className={styles.cta} onClick={() => navigate('/start')}>
          Find my trips
        </button>
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text3)' }}>
          Free · no sign-up needed to look
        </div>

        <div className={styles.sample} aria-label="Example trip">
          <div className={styles.sampleLabel}>Example trip</div>
          <div
            className={styles.sampleCard}
            role="button"
            tabIndex={0}
            onClick={() => navigate('/start')}
            onKeyDown={e => { if (e.key === 'Enter') navigate('/start') }}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.sampleTop}>
              <div>
                <div className={styles.sampleCity}>Dallas, TX</div>
                <div className={styles.sampleDates}>Fri – Sun · 3 days</div>
              </div>
              <span className={styles.sampleBadge}>🌭 Hot Dog</span>
            </div>
            <div className={styles.sampleEvent}>
              <span className={styles.sampleDay}>Fri</span>
              <span className={styles.sampleTag} style={{ background: '#0033A0' }}>NHL</span>
              <span>Seattle Kraken @ Dallas Stars</span>
            </div>
            <div className={styles.sampleEvent}>
              <span className={styles.sampleDay}>Sat</span>
              <span className={styles.sampleTag} style={{ background: '#7B2D8B' }}>Music</span>
              <span>Luke Combs</span>
            </div>
            <div className={styles.sampleEvent}>
              <span className={styles.sampleDay}>Sun</span>
              <span className={styles.sampleTag} style={{ background: '#013369' }}>NFL</span>
              <span>Seattle Seahawks @ Dallas Cowboys</span>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text3)' }}>
            Pick your teams to see yours →
          </div>
        </div>
      </div>
    </div>
  )
}

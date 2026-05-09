import React from 'react'
import styles from './Step.module.css'

const CITIES = [
  'Atlanta, GA', 'Baltimore, MD', 'Boston, MA', 'Charlotte, NC',
  'Chicago, IL', 'Cincinnati, OH', 'Cleveland, OH', 'Columbus, OH',
  'Dallas, TX', 'Denver, CO', 'Detroit, MI', 'Green Bay, WI',
  'Houston, TX', 'Indianapolis, IN', 'Jacksonville, FL', 'Kansas City, MO',
  'Las Vegas, NV', 'Los Angeles, CA', 'Memphis, TN', 'Miami, FL',
  'Milwaukee, WI', 'Minneapolis, MN', 'Nashville, TN', 'New Orleans, LA',
  'New York, NY', 'Oakland, CA', 'Orlando, FL', 'Philadelphia, PA',
  'Phoenix, AZ', 'Pittsburgh, PA', 'Portland, OR', 'Raleigh, NC',
  'Sacramento, CA', 'Salt Lake City, UT', 'San Antonio, TX', 'San Diego, CA',
  'San Francisco, CA', 'Seattle, WA', 'St. Louis, MO', 'Tampa, FL',
  'Washington, DC',
]

export default function StepCity({ homeCity, setHomeCity, onBack, onFinish, saving }) {
  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Your home city</h1>
        <p className={styles.sub}>We'll filter out home games and focus on road trips.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {CITIES.map(city => (
          <div
            key={city}
            onClick={() => setHomeCity(city)}
            style={{
              padding: '13px 14px',
              background: homeCity === city ? '#1f0f00' : 'var(--surface)',
              border: `1px solid ${homeCity === city ? 'var(--orange)' : 'var(--border)'}`,
              borderRadius: 10,
              marginBottom: 7,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 14,
              color: 'var(--text)',
              fontWeight: homeCity === city ? 600 : 400,
            }}
          >
            {city}
            {homeCity === city && <span style={{ color: 'var(--orange)' }}>✓</span>}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.count}>
          {homeCity ? <span style={{ color: 'var(--text)' }}>{homeCity}</span> : 'None selected'}
        </div>
        <button
          className={styles.nextBtn}
          onClick={onFinish}
          disabled={!homeCity || saving}
        >
          {saving ? 'Saving...' : 'Done →'}
        </button>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
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

export default function StepCity({ homeCity, setHomeCity, onBack, onFinish, saving, stepNumber, totalSteps, hideFooter }) {
  const [search, setSearch] = useState('')
  const filtered = CITIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        {stepNumber && totalSteps && (
          <div style={{
            fontSize: 11,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: 'var(--head)',
            marginBottom: 6,
          }}>
            Step {stepNumber} of {totalSteps}
          </div>
        )}
        <h1 className={styles.title}>Where are you traveling from?</h1>
        <p className={styles.sub}>Used to estimate drive or flight distance to each trip.</p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search cities…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 14px',
            color: 'var(--text)',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'var(--body)',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 480, paddingBottom: 16 }}>
        {filtered.map(city => (
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
        {filtered.length === 0 && (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
            No cities found
          </div>
        )}
      </div>
      {!hideFooter && (
        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <div className={styles.count}>
            {homeCity
              ? <span style={{ color: 'var(--text)' }}>{homeCity}</span>
              : <span>None selected</span>}
          </div>
          <button
            className={styles.nextBtn}
            onClick={onFinish}
            disabled={!homeCity || saving}
          >
            {saving ? 'Saving...' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  )
}

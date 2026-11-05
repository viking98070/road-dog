import React, { useState } from 'react'
import styles from './Step.module.css'

// City -> [lat, lng]. Used for search and for "Use my location" (nearest city).
const CITY_COORDS = {
  'Albuquerque, NM': [35.08, -106.65], 'Anaheim, CA': [33.84, -117.91], 'Anchorage, AK': [61.22, -149.9],
  'Arlington, TX': [32.74, -97.11], 'Atlanta, GA': [33.75, -84.39], 'Austin, TX': [30.27, -97.74],
  'Baltimore, MD': [39.29, -76.61], 'Birmingham, AL': [33.52, -86.8], 'Boise, ID': [43.62, -116.2],
  'Boston, MA': [42.36, -71.06], 'Bridgeport, CT': [41.19, -73.2], 'Buffalo, NY': [42.89, -78.88],
  'Burlington, VT': [44.48, -73.21], 'Charleston, SC': [32.78, -79.93], 'Charlotte, NC': [35.23, -80.84],
  'Chattanooga, TN': [35.05, -85.31], 'Chicago, IL': [41.88, -87.63], 'Cincinnati, OH': [39.1, -84.51],
  'Cleveland, OH': [41.5, -81.69], 'Colorado Springs, CO': [38.83, -104.82], 'Columbus, OH': [39.96, -83.0],
  'Dallas, TX': [32.78, -96.8], 'Denver, CO': [39.74, -104.99], 'Des Moines, IA': [41.59, -93.62],
  'Detroit, MI': [42.33, -83.05], 'El Paso, TX': [31.76, -106.49], 'Fort Lauderdale, FL': [26.12, -80.14],
  'Fort Worth, TX': [32.76, -97.33], 'Fresno, CA': [36.74, -119.79], 'Grand Rapids, MI': [42.96, -85.67],
  'Green Bay, WI': [44.52, -88.02], 'Hartford, CT': [41.76, -72.68], 'Honolulu, HI': [21.31, -157.86],
  'Houston, TX': [29.76, -95.37], 'Indianapolis, IN': [39.77, -86.16], 'Jacksonville, FL': [30.33, -81.66],
  'Kansas City, MO': [39.1, -94.58], 'Lansing, MI': [42.73, -84.56], 'Las Vegas, NV': [36.17, -115.14],
  'Little Rock, AR': [34.75, -92.29], 'Long Beach, CA': [33.77, -118.19], 'Los Angeles, CA': [34.05, -118.24],
  'Louisville, KY': [38.25, -85.76], 'Memphis, TN': [35.15, -90.05], 'Mesa, AZ': [33.42, -111.83],
  'Miami, FL': [25.76, -80.19], 'Milwaukee, WI': [43.04, -87.91], 'Minneapolis, MN': [44.98, -93.27],
  'Mobile, AL': [30.69, -88.04], 'Nashville, TN': [36.16, -86.78], 'New Orleans, LA': [29.95, -90.07],
  'New York, NY': [40.71, -74.01], 'Newark, NJ': [40.74, -74.17], 'Oakland, CA': [37.8, -122.27],
  'Oklahoma City, OK': [35.47, -97.52], 'Omaha, NE': [41.26, -95.93], 'Orlando, FL': [28.54, -81.38],
  'Philadelphia, PA': [39.95, -75.17], 'Phoenix, AZ': [33.45, -112.07], 'Pittsburgh, PA': [40.44, -80.0],
  'Portland, OR': [45.52, -122.68], 'Providence, RI': [41.82, -71.41], 'Raleigh, NC': [35.78, -78.64],
  'Reno, NV': [39.53, -119.81], 'Richmond, VA': [37.54, -77.44], 'Rochester, NY': [43.16, -77.61],
  'Sacramento, CA': [38.58, -121.49], 'Salt Lake City, UT': [40.76, -111.89], 'San Antonio, TX': [29.42, -98.49],
  'San Diego, CA': [32.72, -117.16], 'San Francisco, CA': [37.77, -122.42], 'San Jose, CA': [37.34, -121.89],
  'Savannah, GA': [32.08, -81.09], 'Scottsdale, AZ': [33.49, -111.93], 'Seattle, WA': [47.61, -122.33],
  'Spokane, WA': [47.66, -117.43], 'Springfield, MO': [37.21, -93.29], 'St. Louis, MO': [38.63, -90.2],
  'Syracuse, NY': [43.05, -76.15], 'Tampa, FL': [27.95, -82.46], 'Toledo, OH': [41.65, -83.54],
  'Tulsa, OK': [36.15, -95.99], 'Virginia Beach, VA': [36.85, -75.98], 'Washington, DC': [38.91, -77.04],
  'Wichita, KS': [37.69, -97.34],
}
const CITIES = Object.keys(CITY_COORDS).sort()

function milesBetween([lat1, lng1], [lat2, lng2]) {
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 3959 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestCity(lat, lng) {
  let best = null
  for (const city of CITIES) {
    const d = milesBetween([lat, lng], CITY_COORDS[city])
    if (!best || d < best.miles) best = { city, miles: d }
  }
  return best
}

export default function StepCity({ homeCity, setHomeCity, onBack, onFinish, saving, stepNumber, totalSteps, hideFooter }) {
  const [search, setSearch] = useState('')
  const [locating, setLocating] = useState(false)
  const [locateMsg, setLocateMsg] = useState('')

  // 'set' is the placeholder onboarding saves to mark "finished onboarding",
  // not a real city — treat it as nothing picked.
  const picked = homeCity && homeCity !== 'set' ? homeCity : ''

  const q = search.trim().toLowerCase()
  const matches = q ? CITIES.filter(c => c.toLowerCase().includes(q)) : []

  function pick(city) {
    setHomeCity(city)
    setSearch('')
    setLocateMsg('')
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateMsg("Your browser can't share location — search for your city instead.")
      return
    }
    setLocating(true)
    setLocateMsg('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const near = nearestCity(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
        if (!near) return
        setHomeCity(near.city)
        setSearch('')
        setLocateMsg(near.miles > 60
          ? `Closest city we have is ${near.city} (${Math.round(near.miles)} mi away). Search if there's a better fit.`
          : `Found you near ${near.city}.`)
      },
      () => {
        setLocating(false)
        setLocateMsg("Couldn't get your location — search for your city instead.")
      },
      { timeout: 10000, maximumAge: 600000 }
    )
  }

  const inputStyle = {
    flex: 1,
    minWidth: 0,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '11px 14px',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
    fontFamily: 'var(--body)',
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        {stepNumber && totalSteps && (
          <div style={{
            fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase',
            letterSpacing: 0.5, fontFamily: 'var(--head)', marginBottom: 6,
          }}>
            Step {stepNumber} of {totalSteps}
          </div>
        )}
        <h1 className={styles.title}>Where are you traveling from?</h1>
        <p className={styles.sub}>Used to estimate drive or flight distance to each trip.</p>
      </div>

      {picked && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '13px 14px', marginBottom: 14, borderRadius: 10,
          background: '#1f0f00', border: '1px solid var(--orange)',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--head)' }}>
              Home city
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{picked}</div>
          </div>
          <span style={{ color: 'var(--orange)', fontSize: 18 }}>✓</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder={picked ? 'Search to change your city…' : 'Search your city…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          style={{
            flexShrink: 0,
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '11px 14px',
            color: 'var(--text)',
            fontSize: 14,
            cursor: locating ? 'default' : 'pointer',
            fontFamily: 'var(--body)',
            whiteSpace: 'nowrap',
          }}
        >
          {locating ? 'Locating…' : '📍 Use my location'}
        </button>
      </div>

      {locateMsg && (
        <div style={{ fontSize: 13, color: 'var(--text2)', margin: '4px 0 10px' }}>{locateMsg}</div>
      )}

      <div style={{ overflowY: 'auto', maxHeight: 420, paddingBottom: 16, marginTop: 6 }}>
        {q && matches.map(city => (
          <div
            key={city}
            onClick={() => pick(city)}
            style={{
              padding: '13px 14px',
              background: picked === city ? '#1f0f00' : 'var(--surface)',
              border: `1px solid ${picked === city ? 'var(--orange)' : 'var(--border)'}`,
              borderRadius: 10,
              marginBottom: 7,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 14,
              color: 'var(--text)',
              fontWeight: picked === city ? 600 : 400,
            }}
          >
            {city}
            {picked === city && <span style={{ color: 'var(--orange)' }}>✓</span>}
          </div>
        ))}
        {q && matches.length === 0 && (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: '16px 0' }}>
            We don't have that city yet — pick the closest big city near you.
          </div>
        )}
        {!q && !picked && (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: '8px 0' }}>
            Start typing your city, or tap “Use my location.”
          </div>
        )}
      </div>

      {!hideFooter && (
        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <div className={styles.count}>
            {picked
              ? <span style={{ color: 'var(--text)' }}>{picked}</span>
              : <span>None selected</span>}
          </div>
          <button
            className={styles.nextBtn}
            onClick={onFinish}
            disabled={!picked || saving}
          >
            {saving ? 'Saving...' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  )
}

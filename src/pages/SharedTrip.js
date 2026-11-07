import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ComboDetail from './ComboDetail'

// Public page for a shared trip (#18): roaddogapp.com/trip/<code>.
// Anyone can open it, no account. The trip is a frozen snapshot made when it
// was shared (shared_trips), so the link survives the hourly trip rebuilds.
export default function SharedTrip() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, trip: null })

  useEffect(() => {
    let alive = true
    supabase.rpc('get_shared_trip', { p_code: code }).then(({ data, error }) => {
      if (alive) setState({ loading: false, trip: error ? null : data })
    })
    return () => { alive = false }
  }, [code])

  const { loading, trip } = state
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Loading…</div>
  }

  const today = new Date().toISOString().slice(0, 10)
  const gone = !trip || !trip.events || trip.events.length === 0 || (trip.end_date && trip.end_date < today)
  if (gone) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--head)', fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
          Road<span style={{ color: 'var(--orange)' }}>Dog</span>
        </div>
        <div style={{ fontFamily: 'var(--head)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          {trip ? 'This trip has already happened' : 'Trip not found'}
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 22, maxWidth: 420 }}>
          Pick your teams and artists, and Road Dog finds the weekends they land in the same city.
        </div>
        <button onClick={() => navigate('/start')} style={{ background: 'var(--orange)', color: '#0F0F0F', border: 'none', borderRadius: 10, padding: '12px 28px', fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          Find my trips →
        </button>
      </div>
    )
  }

  return <ComboDetail combo={trip} preloadedEvents={trip.events} publicView />
}

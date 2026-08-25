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
        <div className={styles.logo}>
          <img src="/roaddog-wordmark-horizontal.svg" alt="Road Dog" style={{ height: '26px', width: 'auto', display: 'block' }} />
        </div>
        <button className={styles.signOut} onClick={handleSignOut}>Sign out</button>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Welcome back</h1>
          <p>Pick a way to explore.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, margin: '0 auto', width: '100%' }}>
          {/* Road Trips card */}
          <div
            onClick={() => navigate('/combos')}
            style={cardStyle}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--orange)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ fontSize: 32, lineHeight: 1 }}>🎯</div>
              <div style={{ flex: 1 }}>
                <div style={titleStyle}>Trips</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>
                  Curated road trips for your favorite teams and artists. Multiple events lining up in the same city.
                </div>
                <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>
                  {comboCount === null ? 'Loading…' : `${comboCount} trips ready →`}
                </div>
              </div>
            </div>
          </div>

          {/* Who's Playing card */}
          <div
            onClick={() => navigate('/whos-playing')}
            style={cardStyle}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--orange)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ fontSize: 32, lineHeight: 1 }}>🔍</div>
              <div style={{ flex: 1 }}>
                <div style={titleStyle}>Who's Playing</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>
                  Pick any city and date range. See sports, concerts, and comedy happening there.
                </div>
                <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>
                  Start exploring →
                </div>
              </div>
            </div>
          </div>

          {/* My Picks card */}
          <div
            onClick={() => navigate('/settings')}
            style={cardStyle}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--orange)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ fontSize: 32, lineHeight: 1 }}>⚙️</div>
              <div style={{ flex: 1 }}>
                <div style={titleStyle}>My Picks</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>
                  Update your leagues, teams, artists, and home city. We'll refresh your trips.
                </div>
                <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>
                  Edit preferences →
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

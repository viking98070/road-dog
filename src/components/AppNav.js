import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './AppNav.module.css'

// One navigation for every signed-in page.
//   Desktop: top bar — logo (→ Trips), Trips · Who's Playing · My Picks, Sign out.
//   Phones:  slim top bar (logo + Sign out) and a bottom tab bar with the same
//            three tabs, so they're always under the user's thumb.
// Replaces the per-page "← Hub" / "← Back to hub" buttons; the Hub page itself
// now just redirects to Trips.

const TABS = [
  { path: '/trips', label: 'Trips', icon: TripsIcon },
  { path: '/whos-playing', label: "Who's Playing", icon: SearchIcon },
  { path: '/settings', label: 'My Picks', icon: PicksIcon },
]

export default function AppNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Tell the page a bottom tab bar is showing, so phone layouts (and fixed
  // bars like My Picks' save bar) can leave room for it. See index.css.
  useEffect(() => {
    document.body.classList.add('has-bottom-nav')
    return () => document.body.classList.remove('has-bottom-nav')
  }, [])

  // Guests (picked teams, no email yet) get "Sign in" instead of "Sign out" —
  // signing a guest out would throw away their picks.
  const [isGuest, setIsGuest] = useState(false)
  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setIsGuest(!!data?.session?.user?.is_anonymous)
    })
    return () => { alive = false }
  }, [])

  const isActive = path => pathname === path || pathname.startsWith(path + '/')

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className={styles.top}>
        <button className={styles.logo} onClick={() => navigate('/trips')} aria-label="Road Dog — go to Trips">
          Road<span>Dog</span>
        </button>

        <nav className={styles.topTabs} aria-label="Main">
          {TABS.map(t => (
            <button
              key={t.path}
              className={`${styles.topTab} ${isActive(t.path) ? styles.active : ''}`}
              onClick={() => navigate(t.path)}
              aria-current={isActive(t.path) ? 'page' : undefined}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {isGuest
          ? <button className={styles.signOut} onClick={() => navigate('/login')}>Sign in</button>
          : <button className={styles.signOut} onClick={signOut}>Sign out</button>}
      </header>

      <nav className={styles.bottom} aria-label="Main">
        {TABS.map(t => {
          const Icon = t.icon
          const on = isActive(t.path)
          return (
            <button
              key={t.path}
              className={`${styles.bottomTab} ${on ? styles.active : ''}`}
              onClick={() => navigate(t.path)}
              aria-current={on ? 'page' : undefined}
            >
              <Icon />
              <span>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

function TripsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5" />
    </svg>
  )
}

function PicksIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
        d="M4 7h10M18 7h2M4 17h4M12 17h8M16 4v6M10 14v6" />
    </svg>
  )
}

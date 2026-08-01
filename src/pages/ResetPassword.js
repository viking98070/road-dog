import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)   // recovery session detected
  const [done, setDone] = useState(false)     // password successfully updated

  useEffect(() => {
    // When the user arrives from the reset email, Supabase fires PASSWORD_RECOVERY
    // and establishes a temporary recovery session from the URL fragment.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      } else if (session) {
        // If a session already exists on mount (e.g. the event fired before this
        // listener attached), treat the page as ready to accept a new password.
        setReady(true)
      }
    })

    // Fallback: check for an existing session on mount in case the event already fired.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleUpdate(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  // ----- Success screen -----
  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>Road<span>Dog</span></div>
          <div className={styles.sent}>
            <div className={styles.sentIcon}>✅</div>
            <h2>Password updated</h2>
            <p>Your password has been changed.<br />You're all set.</p>
          </div>
          <a href="/hub" className={styles.btn} style={{ display: 'block', marginTop: 24, textDecoration: 'none' }}>
            Go to Road Dog
          </a>
        </div>
      </div>
    )
  }

  // ----- Waiting for the recovery link to establish a session -----
  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>Road<span>Dog</span></div>
          <div className={styles.sent}>
            <div className={styles.sentIcon}>🔑</div>
            <h2>Reset password</h2>
            <p>
              Open this page from the password reset link in your email.<br />
              If you came from that link and still see this, the link may have expired — request a new one from the login page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ----- Set new password form -----
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>Road<span>Dog</span></div>
        <p className={styles.sub}>Choose a new password for your account.</p>
        <form onSubmit={handleUpdate} className={styles.form}>
          <input
            type="password"
            placeholder="new password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? 'Please wait...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}

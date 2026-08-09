import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)       // recovery session established
  const [done, setDone] = useState(false)         // password successfully updated
  const [linkError, setLinkError] = useState('')  // the reset link itself is bad/expired

  useEffect(() => {
    let active = true

    // The reset email links here with ?token_hash=...&type=recovery.
    // Exchange that token for a recovery session before showing the form.
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')

    async function establish() {
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        })
        if (!active) return
        if (error) {
          setLinkError('This reset link is invalid or has expired. Request a new one from the login page.')
        } else {
          setReady(true)
          // Strip the token from the URL so it can't be reused or leak via history.
          window.history.replaceState({}, document.title, '/reset-password')
        }
        return
      }

      // Fallback: an existing recovery session (older hash-fragment links, or the
      // page opened directly while already in a recovery session).
      const { data: { session } } = await supabase.auth.getSession()
      if (active && session) setReady(true)
    }

    // Safety net for implicit-flow links that fire PASSWORD_RECOVERY.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || session) && active) setReady(true)
    })

    establish()

    return () => {
      active = false
      subscription.unsubscribe()
    }
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
              {linkError
                ? linkError
                : <>Open this page from the password reset link in your email.<br />
                    If you came from that link and still see this, it may still be verifying — give it a moment, or request a new link from the login page.</>}
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

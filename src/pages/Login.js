import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard'
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>Road<span>Dog</span></div>

        {sent ? (
          <div className={styles.sent}>
            <div className={styles.sentIcon}>✉️</div>
            <h2>Check your email</h2>
            <p>We sent a magic link to <strong>{email}</strong>.<br />Click it to sign in — no password needed.</p>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.sub}>We'll send you a magic link — no password needed.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} className={styles.btn}>
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('magic')

  async function handleMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  async function handlePassword(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // If login fails try signing up first
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) setError(signUpError.message)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>Road<span>Dog</span></div>

        <div className={styles.modeTabs}>
          <div
            className={`${styles.modeTab} ${mode === 'magic' ? styles.modeActive : ''}`}
            onClick={() => setMode('magic')}
          >
            Magic Link
          </div>
          <div
            className={`${styles.modeTab} ${mode === 'password' ? styles.modeActive : ''}`}
            onClick={() => setMode('password')}
          >
            Password
          </div>
        </div>

        {sent ? (
          <div className={styles.sent}>
            <div className={styles.sentIcon}>✉️</div>
            <h2>Check your email</h2>
            <p>We sent a magic link to <strong>{email}</strong>.<br />Click it to sign in.</p>
          </div>
        ) : (
          <>
            <p className={styles.sub}>
              {mode === 'magic'
                ? "We'll send you a magic link — no password needed."
                : "Sign in or create an account with email and password."}
            </p>
            <form
              onSubmit={mode === 'magic' ? handleMagicLink : handlePassword}
              className={styles.form}
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
              />
              {mode === 'password' && (
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
              )}
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} className={styles.btn}>
                {loading ? 'Please wait...' : mode === 'magic' ? 'Send magic link' : 'Sign in'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

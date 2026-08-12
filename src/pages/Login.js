import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Top-level: 'magic' or 'password'
  const [mode, setMode] = useState('magic')
  // Inside password mode: 'signin' or 'signup'
  const [pwMode, setPwMode] = useState('signin')

  // Success screens
  const [magicSent, setMagicSent] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  function resetMessages() {
    setError('')
    setNotice('')
  }

  async function handleMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    resetMessages()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/hub' }
    })
    if (error) setError(error.message)
    else setMagicSent(true)
    setLoading(false)
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    resetMessages()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        setError("That email and password don't match. If you're new, switch to Create account.")
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        setError("Please confirm your email first — check your inbox for the confirmation link.")
      } else {
        setError(error.message)
      }
    }
    // On success, App's onAuthStateChange listener redirects through the onboarding gate.
    setLoading(false)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    resetMessages()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/hub' }
    })
    if (error) {
      setError(error.message)
    } else if (data?.user && data.user.identities && data.user.identities.length === 0) {
      // Supabase returns a user with an empty identities array when the email is already registered.
      setError('That email is already registered. Switch to Sign in, or use Forgot password.')
    } else {
      setConfirmSent(true)
    }
    setLoading(false)
  }

  async function handleForgotPassword() {
    resetMessages()
    if (!email) {
      setError('Enter your email above first, then tap Forgot password.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    resetMessages()
  }

  function switchPwMode(nextPwMode) {
    setPwMode(nextPwMode)
    resetMessages()
  }

  // ----- Success screens -----

  if (magicSent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src="/roaddog-wordmark.svg" alt="Road Dog" style={{ width: '170px', maxWidth: '65%', height: 'auto', display: 'block', margin: '0 auto' }} />
          </div>
          <div className={styles.sent}>
            <div className={styles.sentIcon}>✉️</div>
            <h2>Check your email</h2>
            <p>We sent a magic link to <strong>{email}</strong>.<br />Click it to sign in.</p>
          </div>
        </div>
      </div>
    )
  }

  if (confirmSent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src="/roaddog-wordmark.svg" alt="Road Dog" style={{ width: '170px', maxWidth: '65%', height: 'auto', display: 'block', margin: '0 auto' }} />
          </div>
          <div className={styles.sent}>
            <div className={styles.sentIcon}>✅</div>
            <h2>Confirm your email</h2>
            <p>We sent a confirmation link to <strong>{email}</strong>.<br />Click it to activate your account, then come back and sign in.</p>
          </div>
        </div>
      </div>
    )
  }

  if (resetSent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <img src="/roaddog-wordmark.svg" alt="Road Dog" style={{ width: '170px', maxWidth: '65%', height: 'auto', display: 'block', margin: '0 auto' }} />
          </div>
          <div className={styles.sent}>
            <div className={styles.sentIcon}>🔑</div>
            <h2>Check your email</h2>
            <p>If an account exists for <strong>{email}</strong>, we sent a password reset link.<br />Click it to set a new password.</p>
          </div>
        </div>
      </div>
    )
  }

  // ----- Main form -----

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/roaddog-wordmark.svg" alt="Road Dog" style={{ width: '170px', maxWidth: '65%', height: 'auto', display: 'block', margin: '0 auto' }} />
        </div>

        <div className={styles.modeTabs}>
          <div
            className={`${styles.modeTab} ${mode === 'magic' ? styles.modeActive : ''}`}
            onClick={() => switchMode('magic')}
          >
            Magic Link
          </div>
          <div
            className={`${styles.modeTab} ${mode === 'password' ? styles.modeActive : ''}`}
            onClick={() => switchMode('password')}
          >
            Password
          </div>
        </div>

        {mode === 'magic' ? (
          <>
            <p className={styles.sub}>We'll send you a magic link — no password needed.</p>
            <form onSubmit={handleMagicLink} className={styles.form}>
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
                {loading ? 'Please wait...' : 'Send magic link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className={styles.sub}>
              {pwMode === 'signin'
                ? 'Sign in with your email and password.'
                : 'Create an account with email and password.'}
            </p>

            <form
              onSubmit={pwMode === 'signin' ? handleSignIn : handleSignUp}
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
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className={styles.input}
              />

              {error && <p className={styles.error}>{error}</p>}
              {notice && <p className={styles.notice}>{notice}</p>}

              <button type="submit" disabled={loading} className={styles.btn}>
                {loading
                  ? 'Please wait...'
                  : pwMode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {pwMode === 'signin' && (
              <button
                type="button"
                className={styles.linkBtn}
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot password?
              </button>
            )}

            <div className={styles.pwToggle}>
              {pwMode === 'signin' ? (
                <>New here?{' '}
                  <button type="button" className={styles.linkBtn} onClick={() => switchPwMode('signup')}>
                    Create account
                  </button>
                </>
              ) : (
                <>Have an account?{' '}
                  <button type="button" className={styles.linkBtn} onClick={() => switchPwMode('signin')}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </>
        )}

        <p className={styles.legal}>
          By continuing you agree to our{' '}
          <Link to="/terms">Terms</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

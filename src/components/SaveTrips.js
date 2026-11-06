import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { trackStep } from '../lib/track'

// "Save your trips" — turns a guest (anonymous) account into a real one by
// attaching an email. Supabase emails a confirmation link; once it's clicked
// the same account (teams, artists, trips) becomes permanent and starts
// getting trip alerts. Used on the onboarding payoff screen and in the guest
// banner on Trips.
//
// If the email already belongs to a Road Dog account, we offer a sign-in link
// to that account instead (its own saved picks load; the guest picks don't
// carry over).

export default function SaveTrips({ source = 'payoff', compact = false, onSaved }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('form') // form | sending | sent | exists | linkSent
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setState('sending')
    const { error } = await supabase.auth.updateUser(
      { email: email.trim() },
      { emailRedirectTo: window.location.origin + '/trips?saved=1' }
    )
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (error.code === 'email_exists' || msg.includes('already') || msg.includes('registered')) {
        trackStep('email_existing', { source })
        setState('exists')
        return
      }
      setError(msg.includes('rate') ? 'Too many tries — wait a minute and try again.' : error.message)
      setState('form')
      return
    }
    trackStep(source === 'banner' ? 'guest_banner_email' : 'email_submitted', { source })
    setState('sent')
    if (onSaved) onSaved(email.trim())
  }

  async function sendSignInLink() {
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/trips', shouldCreateUser: false },
    })
    setBusy(false)
    if (error) { setError(error.message); return }
    setState('linkSent')
  }

  const box = {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
    padding: compact ? '14px 16px' : '20px 20px 18px',
  }
  const head = {
    fontFamily: 'var(--head)', fontSize: compact ? 16 : 20, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text)', margin: 0,
  }
  const sub = { fontSize: 13.5, color: 'var(--text2)', margin: '6px 0 12px', lineHeight: 1.45 }
  const input = {
    flex: 1, minWidth: 0, background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 16,
    outline: 'none', fontFamily: 'var(--body)',
  }
  const btn = {
    flexShrink: 0, background: 'var(--orange)', color: '#0F0F0F', border: 'none',
    borderRadius: 10, padding: '12px 18px', fontWeight: 700, fontSize: 15,
    fontFamily: 'var(--head)', letterSpacing: 0.3, cursor: 'pointer', whiteSpace: 'nowrap',
  }

  if (state === 'sent') {
    return (
      <div style={box}>
        <p style={head}>✉️ Check your email</p>
        <p style={{ ...sub, marginBottom: 0 }}>
          We sent a link to <strong style={{ color: 'var(--text)' }}>{email.trim()}</strong>. Tap it to
          save your picks and turn on trip alerts.
        </p>
      </div>
    )
  }

  if (state === 'exists' || state === 'linkSent') {
    return (
      <div style={box}>
        {state === 'linkSent' ? (
          <>
            <p style={head}>✉️ Check your email</p>
            <p style={{ ...sub, marginBottom: 0 }}>
              We sent a sign-in link to <strong style={{ color: 'var(--text)' }}>{email.trim()}</strong>.
            </p>
          </>
        ) : (
          <>
            <p style={head}>You already have an account</p>
            <p style={sub}>
              <strong style={{ color: 'var(--text)' }}>{email.trim()}</strong> is already on Road Dog. Sign in
              to see the teams and trips saved there.
            </p>
            {error && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" style={btn} onClick={sendSignInLink} disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
              <button
                type="button"
                onClick={() => { setState('form'); setError('') }}
                style={{ ...btn, background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' }}
              >
                Use a different email
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <form style={box} onSubmit={submit}>
      <p style={head}>{compact ? 'Your picks aren’t saved yet' : 'Get alerts for new trips'}</p>
      <p style={sub}>
        {compact
          ? 'Add your email to save your teams and artists, and we’ll let you know when new trips line up as schedules and tour dates come out.'
          : 'Schedules and tour dates come out all year. Save your teams and artists, and we’ll email you the moment a new trip lines up. No password needed.'}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={input}
        />
        <button type="submit" style={btn} disabled={state === 'sending'}>
          {state === 'sending' ? 'Saving…' : 'Get trip alerts'}
        </button>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 13, margin: '10px 0 0' }}>{error}</p>}
      <p style={{ fontSize: 11.5, color: 'var(--text3)', margin: '10px 0 0' }}>
        By continuing you agree to our <a href="/terms" style={{ color: 'var(--text2)' }}>Terms</a> and{' '}
        <a href="/privacy" style={{ color: 'var(--text2)' }}>Privacy Policy</a>.
      </p>
    </form>
  )
}

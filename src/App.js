import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Settings from './pages/Settings'
import WhosPlaying from './pages/WhosPlaying'
import Legal from './pages/Legal'
import ResetPassword from './pages/ResetPassword'
import WhatsOn from './pages/WhatsOn'
import SharedTrip from './pages/SharedTrip'
import { captureUtm } from './lib/track'

captureUtm()
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F0F0F',
      }}
    >
      <style>{`@keyframes rdPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }`}</style>
      <img
        src="/roaddog-wordmark.svg"
        alt="Road Dog"
        style={{
          width: '200px',
          maxWidth: '55vw',
          height: 'auto',
          animation: 'rdPulse 1.6s ease-in-out infinite',
        }}
      />
    </div>
  )
}
export default function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])
  async function loadProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('home_city, onboarded_at')
      .eq('id', userId)
      .single()
    setProfile(data)
    // #36: record that this user opened the app (the database writes at most once an hour).
    supabase.rpc('touch_last_seen').then(() => {}, () => {})
  }
  // Onboarding works with or without an account (it creates a guest account at
  // the end), so never swap it out for the loading screen mid-flow.
  const path = window.location.pathname
  const onOnboarding = path === '/start' || path === '/onboarding'
  if (session === undefined) return <LoadingScreen />
  if (session && profile === null && !onOnboarding) return <LoadingScreen />
  // onboarded_at is the real flag; home_city = 'set' covers accounts from before it existed.
  const hasOnboarded = !!(profile?.onboarded_at || profile?.home_city)
  // Guests: picked teams without an account yet (Supabase anonymous sign-in).
  const isGuest = !!session?.user?.is_anonymous
  // Force not-yet-onboarded users into onboarding regardless of where they land
  function gateForOnboarding(component) {
    // Keep ?utm_… on the URL so analytics still sees where a signed-out visitor came from.
    if (!session) return <Navigate to={'/' + window.location.search} />
    if (!hasOnboarded) return <Navigate to="/start" />
    return component
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={hasOnboarded ? '/trips' : '/start'} /> : <Home />} />
        {/* Guests can still reach Login to get into an existing account. */}
        <Route path="/login" element={session && !isGuest ? <Navigate to={hasOnboarded ? '/trips' : '/start'} /> : <Login />} />
        <Route path="/start" element={<Onboarding session={session} />} />
        <Route path="/onboarding" element={<Onboarding session={session} />} />
        <Route path="/hub" element={<Navigate to="/trips" replace />} />
        <Route path="/trips" element={gateForOnboarding(<Dashboard session={session} />)} />
        <Route path="/combos" element={<Navigate to="/trips" replace />} />
        <Route path="/whos-playing" element={gateForOnboarding(<WhosPlaying session={session} />)} />
        <Route path="/settings" element={gateForOnboarding(<Settings session={session} />)} />
        <Route path="/dashboard" element={<Navigate to="/trips" replace />} />
        <Route path="/privacy" element={<Legal type="privacy" />} />
        <Route path="/terms" element={<Legal type="terms" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/trip/:code" element={<SharedTrip />} />
        <Route path="/whats-on" element={<WhatsOn session={session} signedIn={!!session && hasOnboarded} />} />
        <Route path="/whats-on/:city" element={<WhatsOn session={session} signedIn={!!session && hasOnboarded} />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  )
}

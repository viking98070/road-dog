import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Settings from './pages/Settings'
import Hub from './pages/Hub'
import WhosPlaying from './pages/WhosPlaying'
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
      .select('home_city')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

if (session === undefined) return null
if (session && profile === null) return null

const hasOnboarded = profile?.home_city

  // Force not-yet-onboarded users into onboarding regardless of where they land
  function gateForOnboarding(component) {
    if (!session) return <Navigate to="/" />
    if (!hasOnboarded) return <Navigate to="/onboarding" />
    return component
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={hasOnboarded ? '/hub' : '/onboarding'} /> : <Home />} />
        <Route path="/login" element={session ? <Navigate to={hasOnboarded ? '/hub' : '/onboarding'} /> : <Login />} />
        <Route path="/onboarding" element={session ? <Onboarding session={session} /> : <Navigate to="/" />} />
        <Route path="/hub" element={gateForOnboarding(<Hub session={session} />)} />
        <Route path="/combos" element={gateForOnboarding(<Dashboard session={session} />)} />
        <Route path="/whos-playing" element={gateForOnboarding(<WhosPlaying session={session} />)} />
        <Route path="/settings" element={gateForOnboarding(<Settings session={session} />)} />
        <Route path="/dashboard" element={<Navigate to="/combos" />} />
      </Routes>
    </BrowserRouter>
  )
}

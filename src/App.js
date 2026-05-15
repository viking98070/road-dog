import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Settings from './pages/Settings'
import Hub from './pages/Hub'
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={hasOnboarded ? '/hub' : '/onboarding'} /> : <Home />} />
        <Route path="/login" element={session ? <Navigate to={hasOnboarded ? '/hub' : '/onboarding'} /> : <Login />} />
        <Route path="/onboarding" element={session ? <Onboarding session={session} /> : <Navigate to="/" />} />
        <Route path="/hub" element={session ? <Hub session={session} /> : <Navigate to="/" />} />
        <Route path="/combos" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={<Navigate to="/combos" />} />
        <Route path="/settings" element={session ? <Settings session={session} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

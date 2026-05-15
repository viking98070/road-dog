import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import StepLeagues from '../components/StepLeagues'
import StepTeams from '../components/StepTeams'
import StepShows from '../components/StepShows'
import StepCity from '../components/StepCity'
import styles from './Dashboard.module.css'

const SECTIONS = [
  { key: 'leagues', label: 'Leagues' },
  { key: 'teams',   label: 'Teams' },
  { key: 'shows',   label: 'Shows' },
  { key: 'city',    label: 'Home City' },
]

export default function Settings({ session }) {
  const [activeSection, setActiveSection] = useState('leagues')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rebuilding, setRebuilding] = useState(false)
  const navigate = useNavigate()

  // Loaded preferences
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedShows, setSelectedShows] = useState([])
  const [homeCity, setHomeCity] = useState('')

  useEffect(() => {
    async function load() {
      const userId = session.user.id

      const [leaguesRes, teamsRes, showsRes, userRes] = await Promise.all([
        supabase.from('user_leagues').select('league_key').eq('user_id', userId),
        supabase.from('user_teams').select('league_key, team_name').eq('user_id', userId),
        supabase.from('user_shows').select('artist_name, attraction_id').eq('user_id', userId),
        supabase.from('users').select('home_city').eq('id', userId).single(),
      ])

      setSelectedLeagues((leaguesRes.data || []).map(l => l.league_key))

      // Teams in StepTeams use { id, league, name, short } shape
      setSelectedTeams((teamsRes.data || []).map(t => ({
        id: `${t.league_key}:${t.team_name}`,
        league: t.league_key,
        name: t.team_name,
        short: t.team_name,
      })))

      // Shows are {name, attractionId} objects
      setSelectedShows((showsRes.data || []).map(s => ({
        name: s.artist_name,
        attractionId: s.attraction_id || null,
      })))

      setHomeCity(userRes.data?.home_city || '')
      setLoading(false)
    }
    load()
  }, [session.user.id])

  async function handleSave() {
    setSaving(true)
    const userId = session.user.id

    // Wipe and re-insert each category
    await supabase.from('user_leagues').delete().eq('user_id', userId)
    if (selectedLeagues.length > 0) {
      await supabase.from('user_leagues').insert(
        selectedLeagues.map(k => ({ user_id: userId, league_key: k }))
      )
    }

    // Only save teams whose league is still selected
    const validTeams = selectedTeams.filter(t => selectedLeagues.includes(t.league))
    await supabase.from('user_teams').delete().eq('user_id', userId)
    if (validTeams.length > 0) {
      const teams = validTeams.map(t => ({
        user_id: userId,
        league_key: t.league,
        team_name: t.name,
      }))
      for (let i = 0; i < teams.length; i += 10) {
        await supabase.from('user_teams').insert(teams.slice(i, i + 10))
      }
    }

    await supabase.from('user_shows').delete().eq('user_id', userId)
    if (selectedShows.length > 0) {
      const showRows = selectedShows.map(s => {
        const name = typeof s === 'string' ? s : s.name
        const attractionId = typeof s === 'string' ? null : (s.attractionId || null)
        return { user_id: userId, artist_name: name, attraction_id: attractionId }
      })
      await supabase.from('user_shows').insert(showRows)
    }

    await supabase.from('users').update({ home_city: homeCity }).eq('id', userId)

    setSaving(false)
    setRebuilding(true)

    // Rebuild combos
    try {
      await supabase.functions.invoke('rebuild-combos', {
        body: { user_id: userId }
      })
    } catch (e) {
      console.error('Combo rebuild error:', e)
    }

    setRebuilding(false)
    navigate('/hub')
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <div className={styles.spinner} />
          <p>Loading preferences…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Road<span>Dog</span></div>
        <button className={styles.signOut} onClick={() => navigate('/hub')}>
          ← Back to hub
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Edit Preferences</h1>
          <p>Update your picks. We'll refresh your combos when you save.</p>
        </div>

        {/* Section tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 0,
          overflowX: 'auto',
        }}>
          {SECTIONS.map(sec => {
            const isActive = activeSection === sec.key
            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--orange)' : 'var(--text2)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--orange)' : '2px solid transparent',
                  marginBottom: -1,
                  fontFamily: 'var(--head)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                }}
              >
                {sec.label}
              </button>
            )
          })}
        </div>

        {/* Active section */}
        <div style={{ marginBottom: 80 }}>
          {activeSection === 'leagues' && (
            <StepLeagues
              selected={selectedLeagues}
              setSelected={setSelectedLeagues}
              onNext={() => {}}
              hideFooter={true}
            />
          )}
          {activeSection === 'teams' && (
            <StepTeams
              leagues={selectedLeagues}
              selected={selectedTeams}
              setSelected={setSelectedTeams}
              onBack={() => {}}
              onNext={() => {}}
              hideFooter={true}
            />
          )}
          {activeSection === 'shows' && (
            <StepShows
              selected={selectedShows}
              setSelected={setSelectedShows}
              onBack={() => {}}
              onFinish={() => {}}
              saving={false}
              hideFooter={true}
            />
          )}
          {activeSection === 'city' && (
            <StepCity
              homeCity={homeCity}
              setHomeCity={setHomeCity}
              onBack={() => {}}
              onFinish={() => {}}
              saving={false}
              hideFooter={true}
            />
          )}
        </div>

        {/* Sticky save bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 100,
        }}>
         <button
            onClick={() => navigate('/hub')}
            disabled={saving || rebuilding}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--head)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || rebuilding}
            style={{
              background: 'var(--orange)',
              border: 'none',
              color: '#000',
              padding: '10px 28px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--head)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {rebuilding ? 'Rebuilding combos…' : saving ? 'Saving…' : 'Save & rebuild'}
          </button>
        </div>
      </main>
    </div>
  )
}

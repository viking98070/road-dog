import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import StepTeams from '../components/StepTeams'
import StepShows from '../components/StepShows'
import styles from './Onboarding.module.css'

export default function Onboarding({ session }) {
  const [step, setStep] = useState(1)
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedShows, setSelectedShows] = useState([])
  const [saving, setSaving] = useState(false)

  async function handleFinish(shows) {
    setSaving(true)
    const userId = session.user.id

    const leaguesFromTeams = Array.from(new Set(selectedTeams.map(t => t.league)))
    await supabase.from('user_leagues').delete().eq('user_id', userId)
    if (leaguesFromTeams.length > 0) {
      await supabase.from('user_leagues').insert(
        leaguesFromTeams.map(k => ({ user_id: userId, league_key: k }))
      )
    }

    await supabase.from('user_teams').delete().eq('user_id', userId)
    if (selectedTeams.length > 0) {
      const teams = selectedTeams.map(t => ({
        user_id: userId,
        league_key: t.league,
        team_name: t.name
      }))
      for (let i = 0; i < teams.length; i += 10) {
        await supabase.from('user_teams').insert(teams.slice(i, i + 10))
      }
    }

    await supabase.from('user_shows').delete().eq('user_id', userId)
    const allShows = shows || selectedShows
    if (allShows.length > 0) {
      const showRows = allShows.map(s => {
        const name = typeof s === 'string' ? s : s.name
        const attractionId = typeof s === 'string' ? null : (s.attractionId || null)
        return { user_id: userId, artist_name: name, attraction_id: attractionId }
      })
      await supabase.from('user_shows').insert(showRows)
    }
await supabase.from('users').update({ home_city: 'set' }).eq('id', userId)
    try {
      await supabase.functions.invoke('rebuild-combos', {
        body: { user_id: userId }
      })
    } catch (e) {
      console.error('Initial combo build error:', e)
    }

    setSaving(false)
    window.location.href = '/hub'
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>Road<span>Dog</span></div>
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2</div>
        </div>
      </div>

      {step === 1 && (
        <StepTeams
          stepNumber={1}
          totalSteps={2}
          selected={selectedTeams}
          setSelected={setSelectedTeams}
          onBack={() => {}}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepShows
          stepNumber={2}
          totalSteps={2}
          selected={selectedShows}
          setSelected={setSelectedShows}
          onBack={() => setStep(1)}
          onFinish={handleFinish}
          saving={saving}
        />
      )}
    </div>
  )
}

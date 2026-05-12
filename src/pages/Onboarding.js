import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import StepPreference from '../components/StepPreference'
import StepLeagues from '../components/StepLeagues'
import StepTeams from '../components/StepTeams'
import StepShows from '../components/StepShows'
import StepCity from '../components/StepCity'
import styles from './Onboarding.module.css'

export default function Onboarding({ session }) {
  const [step, setStep] = useState(1)
  const [comboPreference, setComboPreference] = useState('sports_plus_shows')
  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedShows, setSelectedShows] = useState([])
  const [homeCity, setHomeCity] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  async function handleFinish() {
    setSaving(true)
    const userId = session.user.id

    if (selectedLeagues.length > 0) {
      await supabase.from('user_leagues').upsert(
        selectedLeagues.map(k => ({ user_id: userId, league_key: k }))
      )
    }

    if (selectedTeams.length > 0) {
      await supabase.from('user_teams').delete().eq('user_id', userId)
      const teams = selectedTeams.map(t => ({
        user_id: userId,
        league_key: t.league,
        team_name: t.name
      }))
      for (let i = 0; i < teams.length; i += 10) {
        const batch = teams.slice(i, i + 10)
        await supabase.from('user_teams').insert(batch)
      }
    }

    if (selectedShows.length > 0) {
      await supabase.from('user_shows').upsert(
        selectedShows.map(name => ({ user_id: userId, artist_name: name }))
      )
    }

    await supabase.from('users').update({
      home_city: homeCity,
      combo_preference: comboPreference,
    }).eq('id', userId)

    setSaving(false)
    navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>Road<span>Dog</span></div>
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 4 ? styles.active : ''}`}>4</div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step >= 5 ? styles.active : ''}`}>5</div>
        </div>
      </div>
      {step === 1 && (
        <StepPreference
          selected={comboPreference}
          setSelected={setComboPreference}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepLeagues
          selected={selectedLeagues}
          setSelected={setSelectedLeagues}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <StepTeams
          leagues={selectedLeagues}
          selected={selectedTeams}
          setSelected={setSelectedTeams}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <StepShows
          selected={selectedShows}
          setSelected={setSelectedShows}
          onBack={() => setStep(3)}
          onFinish={() => setStep(5)}
          saving={saving}
        />
      )}
      {step === 5 && (
        <StepCity
          homeCity={homeCity}
          setHomeCity={setHomeCity}
          onBack={() => setStep(4)}
          onFinish={handleFinish}
          saving={saving}
        />
      )}
    </div>
  )
}

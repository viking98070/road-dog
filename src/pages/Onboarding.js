import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { trackStep } from '../lib/track'
import StepTeams from '../components/StepTeams'
import StepShows from '../components/StepShows'
import SaveTrips from '../components/SaveTrips'
import styles from './Onboarding.module.css'
import { isSpring, SPRING_COLOR, SPRING_LABEL } from '../lib/spring'

// Onboarding (#21): pick first, sign up last.
//   1. Teams  →  2. Shows (optional)  →  3. "We found N trips" + save with email
// Visitors don't need an account to start. When they finish picking we create
// a guest (anonymous) account behind the scenes, save their picks and build
// their trips. Adding an email on step 3 turns the guest into a real account.

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const LEAGUE_LABEL = { nfl: 'NFL', mlb: 'MLB', nba: 'NBA', nhl: 'NHL', wnba: 'WNBA', mls: 'MLS', nwsl: 'NWSL', cfb: 'CFB', mcbb: 'MCBB', wcbb: 'WCBB', marquee: 'MARQUEE' }
const LEAGUE_COLOR = { nfl: '#013369', mlb: '#002D72', nba: '#C9082A', nhl: '#0033A0', wnba: '#C9082A', mls: '#002F6C', nwsl: '#7B2D8B', cfb: '#BF5700', mcbb: '#0033A0', wcbb: '#0033A0', marquee: '#B8860B' }

function tag(e) {
  if (e.type === 'music') return { label: e.parent_event ? 'FESTIVAL' : 'MUSIC', color: '#7B2D8B' }
  if (e.type === 'comedy') return { label: 'COMEDY', color: '#F4911E' }
  if (isSpring(e)) return { label: SPRING_LABEL, color: SPRING_COLOR }
  return { label: LEAGUE_LABEL[e.league_key] || 'EVENT', color: LEAGUE_COLOR[e.league_key] || '#444' }
}
function describe(e) {
  if (e.league_key === 'marquee') return e.artist_name || 'Marquee event'
  if (e.type === 'sport') return `${e.away_team || 'TBD'} ${e.neutral_site ? 'vs' : '@'} ${e.home_team || 'TBD'}`
  return e.parent_event || e.artist_name || 'Event'
}
function fmtDay(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function fmtRange(s, e) {
  const f = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return !e || s === e ? f(s) : `${f(s)} – ${f(e)}`
}
function cityOf(c) {
  const list = (c.cities && c.cities.length ? c.cities : [c.city]).filter(Boolean)
  const uniq = [...new Set(list)]
  if (uniq.length <= 1) return uniq[0] || 'Your trip'
  if (uniq.length === 2) return `${uniq[0]} & ${uniq[1]}`
  return `${uniq[0]}, ${uniq[1]} +${uniq.length - 2} more`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const normSchool = x => (x || '').toLowerCase().replace(/\bst\.?(\s|$)/g, 'state$1').trim()
const COLLEGE = ['cfb', 'mcbb', 'wcbb']

// Is this event one of the teams the person just picked?
function isMyTeamEvent(e, teams) {
  if (e.type !== 'sport') return false
  return teams.some(t => t.league === e.league_key && (
    COLLEGE.includes(t.league)
      ? normSchool(e.away_school) === normSchool(t.name) || normSchool(e.home_school) === normSchool(t.name)
      : e.away_team === t.name || e.home_team === t.name
  ))
}

// The 3 trips to show on the results screen: the highest-scoring trips that
// start at least a week out (so they're plannable). Same-city trips are fine —
// several of your teams in one city is exactly what a great trip looks like.
// If they picked teams but none of the 3 includes one, the best trip that does
// takes the last spot (football first).
function pickTop(combos, teams) {
  const soon = addDays(todayStr(), 7)
  let pool = combos.filter(c => c.start_date >= soon)
  if (pool.length < 3) pool = combos
  const top = pool.slice(0, 3)
  if (teams.length && top.length === 3) {
    const mine = c => (c.events || []).some(e => isMyTeamEvent(e, teams))
    if (!top.some(mine)) {
      const fb = c => (c.events || []).some(e => isMyTeamEvent(e, teams) && ['nfl', 'cfb'].includes(e.league_key))
      const swap = pool.find(fb) || pool.find(mine)
      if (swap) top[2] = swap
    }
  }
  return top
}

function UpcomingList({ events }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '6px 16px' }}>
      {events.map((e, i) => {
        const t = tag(e)
        return (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: i ? '1px solid var(--border)' : 'none', fontSize: 13.5, color: 'var(--text)' }}>
            <span style={{ width: 82, flexShrink: 0, color: 'var(--text3)', fontSize: 12 }}>{fmtDay(e.event_date)}</span>
            <span style={{ background: t.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{t.label}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{describe(e)}</span>
              {e.city && <span style={{ display: 'block', fontSize: 12, color: 'var(--text3)' }}>{e.city}{e.state ? `, ${e.state}` : ''}</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TripCard({ combo }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => { window.location.href = `/trips?trip=${combo.id}` }}
      onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/trips?trip=${combo.id}` }}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer',
        borderRadius: 14, padding: '16px 16px 12px', marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--head)', fontSize: 19, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {cityOf(combo)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{fmtRange(combo.start_date, combo.end_date)}</div>
        </div>
        {(combo.score ?? 0) >= 4 && (
          <span style={{
            whiteSpace: 'nowrap', background: 'rgba(249,115,22,0.14)', color: '#FB923C', fontWeight: 700,
            fontSize: 12.5, padding: '4px 11px', borderRadius: 999, border: '1px solid rgba(249,115,22,0.55)',
          }}>🌭 Hot Dog</span>
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        {(combo.events || []).slice(0, 4).map(e => {
          const t = tag(e)
          return (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: '1px solid var(--border)', fontSize: 13.5, color: 'var(--text)' }}>
              <span style={{ width: 82, flexShrink: 0, color: 'var(--text3)', fontSize: 12 }}>{fmtDay(e.event_date)}</span>
              <span style={{ background: t.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{t.label}</span>
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{describe(e)}</span>
            </div>
          )
        })}
      </div>
      <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--orange)', fontWeight: 600, marginTop: 6 }}>Details →</div>
    </div>
  )
}

function Payoff({ isGuest, combos, top, upcoming, hasTeams, hasShows, onAddTeams, onAddShows }) {
  const n = combos.length

  function goToTrips(skipped) {
    if (skipped && isGuest) trackStep('skipped_email', { trips: n })
    window.location.href = '/trips'
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', padding: '28px 20px 48px' }}>
      <h1 style={{ fontFamily: 'var(--head)', fontSize: 30, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px', color: 'var(--text)' }}>
        {n > 0 ? `We found ${n} ${n === 1 ? 'trip' : 'trips'} 🌭` : 'Here’s what’s coming up 🌭'}
      </h1>
      <p style={{ fontSize: 14.5, color: 'var(--text2)', margin: '0 0 20px', lineHeight: 1.45 }}>
        {n > 0
          ? (n === 1 ? 'Here it is:' : n <= 3 ? 'Here they are:' : 'Here are your top 3:')
          : upcoming.length
            ? 'None of your picks share a city yet, so there’s no trip — but here’s what’s next. Trips show up the moment two of them line up.'
            : 'Nothing on the calendar yet for your picks. Road Dog checks every day and finds trips as schedules and tour dates come out.'}
      </p>

      {n === 0 && upcoming.length > 0 && <UpcomingList events={upcoming} />}

      {n === 0 && (
        <div style={{
          marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.45)', borderRadius: 12, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4, flex: '1 1 220px' }}>
            {!hasTeams
              ? '🏈 Add a team or two — games plus shows is where trips line up.'
              : !hasShows
                ? '🎵 Add an artist or comedian to find more trips around your games.'
                : '➕ Add a few more teams or artists to find more trips.'}
          </div>
          <button
            onClick={!hasTeams || hasShows ? onAddTeams : onAddShows}
            style={{
              background: 'var(--orange)', color: '#0F0F0F', border: 'none', borderRadius: 10, padding: '10px 16px',
              fontFamily: 'var(--head)', fontWeight: 700, fontSize: 14, letterSpacing: 0.3, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {!hasTeams ? 'Add teams →' : !hasShows ? 'Add artists →' : 'Add more →'}
          </button>
        </div>
      )}

      {top.map(c => <TripCard key={c.id} combo={c} />)}
      {n > top.length && (
        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--text2)', margin: '4px 0 0' }}>
          + {n - top.length} more {n - top.length === 1 ? 'trip' : 'trips'}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        {isGuest
          ? <SaveTrips source="payoff" />
          : null}
      </div>

      <button
        onClick={() => goToTrips(true)}
        style={{
          display: 'block', width: '100%', marginTop: 14, padding: '13px 18px', borderRadius: 10,
          background: isGuest ? 'transparent' : 'var(--orange)', color: isGuest ? 'var(--text2)' : '#0F0F0F',
          border: isGuest ? '1px solid var(--border)' : 'none', fontFamily: 'var(--head)', fontWeight: 700,
          fontSize: 15, letterSpacing: 0.3, cursor: 'pointer',
        }}
      >
        {n > 0 ? `See all ${n} ${n === 1 ? 'trip' : 'trips'} →` : 'Go to my trips →'}
      </button>
      {isGuest && (
        <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', margin: '10px 0 0' }}>
          You can add your email later — your trips stay on this device until you do.
        </p>
      )}
    </div>
  )
}

export default function Onboarding({ session }) {
  const [step, setStep] = useState(1)
  const [selectedTeams, setSelectedTeams] = useState([])
  const [selectedShows, setSelectedShows] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { isGuest, combos }
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    trackStep('start')
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [step])

  async function ensureUser() {
    const { data: { session: current } } = await supabase.auth.getSession()
    if (current) return current.user
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return data.user
  }

  async function handleFinish(shows) {
    setSaving(true)
    setError('')
    const allShows = shows || selectedShows
    trackStep('shows_done', { teams: selectedTeams.length, shows: allShows.length })

    let user
    try {
      user = await ensureUser()
    } catch (e) {
      console.error('Guest sign-in failed:', e)
      setSaving(false)
      setError('signin')
      return
    }
    const userId = user.id

    const leaguesFromTeams = Array.from(new Set(selectedTeams.map(t => t.league)))
    await supabase.from('user_leagues').delete().eq('user_id', userId)
    if (leaguesFromTeams.length > 0) {
      await supabase.from('user_leagues').insert(leaguesFromTeams.map(k => ({ user_id: userId, league_key: k })))
    }

    await supabase.from('user_teams').delete().eq('user_id', userId)
    if (selectedTeams.length > 0) {
      const teams = selectedTeams.map(t => ({ user_id: userId, league_key: t.league, team_name: t.name }))
      for (let i = 0; i < teams.length; i += 10) {
        await supabase.from('user_teams').insert(teams.slice(i, i + 10))
      }
    }

    await supabase.from('user_shows').delete().eq('user_id', userId)
    if (allShows.length > 0) {
      const showRows = allShows.map(s => {
        const name = typeof s === 'string' ? s : s.name
        const attractionId = typeof s === 'string' ? null : (s.attractionId || null)
        return { user_id: userId, artist_name: name, attraction_id: attractionId }
      })
      await supabase.from('user_shows').insert(showRows)
    }

    // The real "finished onboarding" flag. (Old accounts used home_city = 'set'.)
    await supabase.from('users').update({ onboarded_at: new Date().toISOString() }).eq('id', userId)

    try {
      await supabase.functions.invoke('rebuild-combos', { body: { user_id: userId } })
    } catch (e) {
      console.error('Initial combo build error:', e)
    }

    // Load what we found for the payoff screen.
    const EVENT_COLS = 'id, away_team, home_team, away_school, home_school, league_key, artist_name, type, event_date, parent_event, neutral_site, city, state, season_type'
    let combos = []
    let top = []
    let upcoming = []
    const { data: comboData } = await supabase
      .from('trip_combos')
      .select('id, city, cities, start_date, end_date, score, event_ids')
      .eq('user_id', userId)
      .gte('end_date', todayStr())
      .order('score', { ascending: false })
      .order('start_date', { ascending: true })
    if (comboData && comboData.length) {
      // Events for the best ~40 trips are enough to choose and draw the top 3.
      const ids = [...new Set(comboData.slice(0, 40).flatMap(c => c.event_ids || []))].slice(0, 300)
      const { data: evs } = await supabase.from('events').select(EVENT_COLS).in('id', ids)
      const byId = {}
      for (const e of evs || []) byId[e.id] = e
      combos = comboData.map(c => ({
        ...c,
        events: (c.event_ids || []).map(id => byId[id]).filter(Boolean).sort((a, b) => a.event_date.localeCompare(b.event_date)),
      }))
      top = pickTop(combos.filter(c => c.events.length), selectedTeams)
    } else {
      // No trips: show their artists' next shows and their teams' next road games instead.
      const today = todayStr()
      const showNames = allShows.map(x => (typeof x === 'string' ? x : x.name)).filter(Boolean)
      const pro = selectedTeams.filter(t => !COLLEGE.includes(t.league)).map(t => t.name)
      const schools = selectedTeams.filter(t => COLLEGE.includes(t.league))
        .flatMap(t => [t.name, t.name.replace(/ St\.$/, ' State')])
      const queries = []
      if (showNames.length) queries.push(supabase.from('events').select(EVENT_COLS).in('artist_name', showNames).gte('event_date', today).order('event_date').limit(8))
      if (pro.length) queries.push(supabase.from('events').select(EVENT_COLS).in('away_team', pro).gte('event_date', today).order('event_date').limit(8))
      if (schools.length) queries.push(supabase.from('events').select(EVENT_COLS).in('away_school', schools).gte('event_date', today).order('event_date').limit(8))
      const results = await Promise.all(queries)
      const seen = new Set()
      upcoming = results.flatMap(r => r.data || [])
        .filter(e => !seen.has(e.id) && seen.add(e.id))
        .sort((a, b) => a.event_date.localeCompare(b.event_date))
        .slice(0, 6)
    }

    trackStep('saw_trips', { trips: combos.length })
    setSaving(false)
    setResult({ isGuest: !!user.is_anonymous, combos, top, upcoming })
    setStep(3)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <a href="/" className={styles.logo} style={{ textDecoration: 'none' }}>Road<span>Dog</span></a>
        <div className={styles.steps} aria-label="Progress">
          {['Teams', 'Shows', 'Trips'].map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className={styles.stepLine} />}
              <div className={`${styles.stepLabel} ${step === i + 1 ? styles.labelCurrent : step > i + 1 ? styles.labelDone : ''}`}>
                {step > i + 1 ? '✓ ' : ''}{label}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {step === 1 && (
        <StepTeams
          stepNumber={1}
          totalSteps={2}
          selected={selectedTeams}
          setSelected={setSelectedTeams}
          onNext={() => { trackStep('teams_done', { teams: selectedTeams.length }); setStep(2) }}
          onSkip={() => { trackStep('teams_done', { teams: 0, skipped: true }); setStep(2) }}
        />
      )}
      {step === 2 && (
        <>
          {error === 'signin' && (
            <div style={{ maxWidth: 800, margin: '16px auto 0', padding: '0 24px', width: '100%' }}>
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.5)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text)' }}>
                We couldn't start your trip search just now. Try again in a minute, or{' '}
                <a href="/login" style={{ color: 'var(--orange)', fontWeight: 600 }}>sign in with your email</a>.
              </div>
            </div>
          )}
          <StepShows
            stepNumber={2}
            totalSteps={2}
            selected={selectedShows}
            setSelected={setSelectedShows}
            onBack={() => setStep(1)}
            onFinish={handleFinish}
            saving={saving}
            requireOne={selectedTeams.length === 0}
          />
        </>
      )}
      {step === 3 && result && (
        <Payoff
          isGuest={result.isGuest}
          combos={result.combos}
          top={result.top}
          upcoming={result.upcoming}
          hasTeams={selectedTeams.length > 0}
          hasShows={selectedShows.length > 0}
          onAddTeams={() => setStep(1)}
          onAddShows={() => setStep(2)}
        />
      )}
    </div>
  )
}

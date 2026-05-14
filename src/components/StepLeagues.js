import React from 'react'
import styles from './Step.module.css'
const LEAGUES = [
  { key: 'nfl',    label: 'NFL',              sub: 'Football',                   color: '#013369', solo: false },
  { key: 'mlb',    label: 'MLB',              sub: 'Baseball',                   color: '#002D72', solo: false },
  { key: 'nba',    label: 'NBA',              sub: 'Basketball',                 color: '#C9082A', solo: false },
  { key: 'nhl',    label: 'NHL',              sub: 'Hockey',                     color: '#0033A0', solo: false },
  { key: 'cfb',    label: 'College Football', sub: 'CFB',                        color: '#5C0A10', solo: false },
  { key: 'mcbb',   label: "Men's CBB",        sub: "Men's College Basketball",   color: '#003087', solo: false },
  { key: 'wcbb',   label: "Women's CBB",      sub: "Women's College Basketball", color: '#8B0000', solo: false },
  { key: 'mls',    label: 'MLS',              sub: 'Soccer',                     color: '#002F6C', solo: false },
  { key: 'nwsl',   label: 'NWSL',             sub: "Women's Soccer",             color: '#003087', solo: false },
  { key: 'wnba',   label: 'WNBA',             sub: 'Basketball',                 color: '#C9082A', solo: false },
  { key: 'pga',    label: 'PGA Tour',         sub: 'Golf · no teams',            color: '#00563F', solo: true  },
  { key: 'nascar', label: 'NASCAR',           sub: 'Racing · no teams',          color: '#FFB612', solo: true  },
]
const icon = key => {
  if (key === 'nfl' || key === 'cfb') return '🏈'
  if (key === 'mlb') return '⚾'
  if (key === 'nba' || key === 'mcbb' || key === 'wcbb' || key === 'wnba') return '🏀'
  if (key === 'nhl') return '🏒'
  if (key === 'mls' || key === 'nwsl') return '⚽'
  if (key === 'pga') return '⛳'
  if (key === 'nascar') return '🏁'
  return '🏆'
}
export default function StepLeagues({ selected, setSelected, onNext, stepNumber, totalSteps, hideFooter }) {
  function toggle(key) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }
  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        {stepNumber && totalSteps && (
          <div style={{
            fontSize: 11,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: 'var(--head)',
            marginBottom: 6,
          }}>
            Step {stepNumber} of {totalSteps}
          </div>
        )}
        <h1 className={styles.title}>Pick your leagues</h1>
        <p className={styles.sub}>Select the sports you follow. Pick more leagues for better trip combos.</p>
      </div>
      <div className={styles.grid}>
        {LEAGUES.map(l => (
          <div
            key={l.key}
            className={`${styles.tile} ${selected.includes(l.key) ? styles.sel : ''}`}
            onClick={() => toggle(l.key)}
          >
            <div className={styles.tileIcon} style={{ background: l.color }}>
              <span style={{ fontSize: 22 }}>{icon(l.key)}</span>
            </div>
            <div className={styles.tileName}>{l.label}</div>
            <div className={styles.tileSub}>{l.sub}</div>
            {selected.includes(l.key) && <div className={styles.tileCheck}>✓</div>}
          </div>
        ))}
      </div>
      {selected.length > 0 && selected.length < 3 && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--orange)', padding: '8px 0', fontWeight: 600 }}>
          💡 Pick more leagues to find more trip combos
        </div>
      )}
      {!hideFooter && (
        <div className={styles.footer}>
          <div className={styles.count}><b>{selected.length}</b> selected</div>
          <button
            className={styles.nextBtn}
            onClick={onNext}
            disabled={selected.length === 0}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
}

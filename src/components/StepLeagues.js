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
  { key: 'wnba',   label: 'WNBA',             sub: 'Basketball',                 color: '#C9082A', solo: false },
  { key: 'pga',    label: 'PGA Tour',         sub: 'Golf · no teams',            color: '#00563F', solo: true  },
  { key: 'f1',     label: 'Formula 1',        sub: 'Racing · no teams',          color: '#E8002D', solo: true  },
  { key: 'nascar', label: 'NASCAR',           sub: 'Racing · no teams',          color: '#FFB612', solo: true  },
]

export default function StepLeagues({ selected, setSelected, onNext }) {
  function toggle(key) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Pick your leagues</h1>
        <p className={styles.sub}>Select the sports you follow.</p>
      </div>

      <div className={styles.grid}>
        {LEAGUES.map(l => (
          <div
            key={l.key}
            className={`${styles.tile} ${selected.includes(l.key) ? styles.sel : ''}`}
            onClick={() => toggle(l.key)}
          >
            <div className={styles.tileIcon} style={{ background: l.color }}>
              <span style={{ fontSize: 22 }}>
                {l.key === 'nfl' || l.key === 'cfb' ? '🏈' :
                 l.key === 'mlb' ? '⚾' :
                 l.key === 'nba' || l.key === 'mcbb' || l.key === 'wcbb' || l.key === 'wnba' ? '🏀' :
                 l.key === 'nhl' ? '🏒' :
                 l.key === 'mls' ? '⚽' :
                 l.key === 'pga' ? '⛳' :
                 l.key === 'f1' || l.key === 'nascar' ? '🏁' : '🏆'}
              </span>
            </div>
            <div className={styles.tileName}>{l.label}</div>
            <div className={styles.tileSub}>{l.sub}</div>
            {selected.includes(l.key) && <div className={styles.tileCheck}>✓</div>}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.count}><b>{selected.length}</b> selected</div>
        <button
          className={styles.nextBtn}
          onClick={onNext}
          disabled={selected.length === 0}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

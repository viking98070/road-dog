import React from 'react'
import styles from './Step.module.css'

const OPTIONS = [
  {
    key: 'sports_plus_shows',
    icon: '🎯',
    title: 'Sports + Shows',
    desc: 'A team game and a concert or comedy show nearby in the same week. The classic Road Dog trip.',
    recommended: true,
  },
  {
    key: 'sports_only',
    icon: '🏟️',
    title: 'Sports Only',
    desc: 'Multiple of your favorite teams playing in the same area within a week.',
  },
  {
    key: 'shows_only',
    icon: '🎤',
    title: 'Shows Only',
    desc: 'Multiple of your favorite artists or comedians performing in the same area within a week.',
  },
]

export default function StepPreference({ selected, setSelected, onNext }) {
  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Pick your trip style</h1>
        <p className={styles.sub}>How should we line up your combos? You can change this later.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {OPTIONS.map(opt => {
          const isSelected = selected === opt.key
          return (
            <div
              key={opt.key}
              onClick={() => setSelected(opt.key)}
              style={{
                padding: '16px 18px',
                background: isSelected ? '#1f0f00' : 'var(--surface)',
                border: `1px solid ${isSelected ? 'var(--orange)' : 'var(--border)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {opt.recommended && (
                <span style={{
                  position: 'absolute',
                  top: -8,
                  right: 12,
                  background: 'var(--orange)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Recommended
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 4,
                  }}>
                    {opt.title}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--text2)',
                    lineHeight: 1.4,
                  }}>
                    {opt.desc}
                  </div>
                </div>
                {isSelected && (
                  <div style={{ color: 'var(--orange)', fontSize: 20, fontWeight: 700 }}>✓</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <div />
        <div className={styles.count}>
          {selected
            ? <span style={{ color: 'var(--text)' }}>Selected</span>
            : <span>Pick one</span>}
        </div>
        <button
          className={styles.nextBtn}
          onClick={onNext}
          disabled={!selected}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import styles from './Step.module.css'

const SUGGESTIONS = {
  music: ['Radiohead','Bon Iver','Arcade Fire','The National','LCD Soundsystem','Tame Impala','Phoebe Bridgers','Mitski','Boygenius','Taylor Swift','Kendrick Lamar','Billie Eilish','The Weeknd','Bad Bunny','Drake','Post Malone','Harry Styles','Olivia Rodrigo','SZA','Morgan Wallen'],
  comedy: ['Nate Bargatze','John Mulaney','Dave Chappelle','Nikki Glaser','Bert Kreischer','Taylor Tomlinson','Shane Gillis','Hannah Gadsby','Bill Burr','Kevin Hart','Jerry Seinfeld','Jim Gaffigan','Ali Wong','Trevor Noah','Sebastian Maniscalco'],
}

export default function StepShows({ selected, setSelected, onBack, onFinish, saving }) {
  const [tab, setTab] = useState('music')

  function toggle(name) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Shows</h1>
        <p className={styles.sub}>Artists and comedians you want to catch live.</p>
      </div>

      <div className={styles.tabs}>
        <div
          className={`${styles.tab} ${tab === 'music' ? styles.tabActive : ''}`}
          onClick={() => setTab('music')}
        >
          🎵 Music
        </div>
        <div
          className={`${styles.tab} ${tab === 'comedy' ? styles.tabActive : ''}`}
          onClick={() => setTab('comedy')}
        >
          🎤 Comedy
        </div>
      </div>

      <div className={styles.showList}>
        {SUGGESTIONS[tab].map(name => {
          const sel = selected.includes(name)
          return (
            <div
              key={name}
              className={`${styles.showRow} ${sel ? styles.sel : ''}`}
              onClick={() => toggle(name)}
            >
              <span>{name}</span>
              <div className={`${styles.showCheck} ${sel ? styles.checked : ''}`}>
                {sel && '✓'}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.count}><b>{selected.length}</b> selected</div>
        <button
          className={styles.nextBtn}
          onClick={() => onFinish(selected)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Done →'}
        </button>
      </div>
    </div>
  )
}

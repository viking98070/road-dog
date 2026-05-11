import React, { useState } from 'react'
import styles from './Step.module.css'

const ARTISTS = {
  rock: [
    'Foo Fighters', 'Red Hot Chili Peppers', 'Pearl Jam', 'Radiohead', 'The Black Keys',
    'Queens of the Stone Age', 'Muse', 'Arctic Monkeys', 'Arcade Fire', 'The National',
    'Tame Impala', 'Vampire Weekend', 'LCD Soundsystem', 'Interpol', 'The Strokes',
    'Jack White', 'Beck', 'Weezer', 'Green Day', 'Blink-182',
  ],
  pop: [
    'Taylor Swift', 'Beyoncé', 'Billie Eilish', 'Olivia Rodrigo', 'Harry Styles',
    'Dua Lipa', 'The Weeknd', 'Post Malone', 'Ed Sheeran', 'Adele',
    'Bruno Mars', 'Lizzo', 'SZA', 'Sabrina Carpenter', 'Chappell Roan',
    'Charlie XCX', 'Gracie Abrams', 'Noah Kahan', 'Hozier', 'Coldplay',
  ],
  hiphop: [
    'Kendrick Lamar', 'Drake', 'J. Cole', 'Tyler the Creator', 'Bad Bunny',
    'Childish Gambino', 'Mac Miller', 'Lil Wayne', 'Eminem', 'Jay-Z',
    'Kanye West', 'Travis Scott', 'Future', '21 Savage', 'Lil Baby',
    'Gunna', 'Pusha T', 'Vince Staples', 'JPEGMAFIA', 'Joey Bada$$',
  ],
  country: [
    'Morgan Wallen', 'Zach Bryan', 'Luke Combs', 'Chris Stapleton', 'Kacey Musgraves',
    'Lainey Wilson', 'Tyler Childers', 'Jason Isbell', 'Sturgill Simpson', 'Cody Johnson',
    'Eric Church', 'Miranda Lambert', 'Megan Moroney', 'Hardy', 'Jelly Roll',
    'Post Malone', 'Shaboozey', 'Thomas Rhett', 'Kane Brown', 'Dierks Bentley',
  ],
  indie: [
    'Bon Iver', 'Phoebe Bridgers', 'Mitski', 'Boygenius', 'Big Thief',
    'Sufjan Stevens', 'Fleet Foxes', 'Iron & Wine', 'Death Cab for Cutie', 'The War on Drugs',
    'Waxahatchee', 'Angel Olsen', 'Sharon Van Etten', 'Japanese Breakfast', 'Soccer Mommy',
    'Snail Mail', 'Julien Baker', 'Hand Habits', 'Weyes Blood', 'Faye Webster',
  ],
  comedy: [
    'Nate Bargatze', 'John Mulaney', 'Dave Chappelle', 'Nikki Glaser', 'Bert Kreischer',
    'Taylor Tomlinson', 'Shane Gillis', 'Bill Burr', 'Kevin Hart', 'Jerry Seinfeld',
    'Jim Gaffigan', 'Ali Wong', 'Sebastian Maniscalco', 'Andrew Schulz', 'Neal Brennan',
    'Mark Normand', 'Tom Segura', 'Theo Von', 'Matt Rife', 'Hannah Gadsby',
  ],
}

const GENRE_LABELS = {
  rock: '🎸 Rock & Alternative',
  pop: '🎤 Pop',
  hiphop: '🎧 Hip-Hop & Rap',
  country: '🤠 Country',
  indie: '🌿 Indie & Folk',
  comedy: '😂 Comedy',
}

export default function StepShows({ selected, setSelected, onBack, onFinish, saving }) {
  const [genre, setGenre] = useState('rock')

  function toggle(name) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Shows</h1>
        <p className={styles.sub}>Pick artists and comedians you want to catch live.</p>
      </div>

      <div className={styles.tabs} style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {Object.entries(GENRE_LABELS).map(([key, label]) => (
          <div
            key={key}
            className={`${styles.tab} ${genre === key ? styles.tabActive : ''}`}
            onClick={() => setGenre(key)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className={styles.showList}>
        {ARTISTS[genre].map(name => {
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
          {saving ? 'Saving...' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

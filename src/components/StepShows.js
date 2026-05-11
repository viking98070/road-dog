import React, { useState } from 'react'
import styles from './Step.module.css'

const ARTISTS = {
  rock: [
    'Foo Fighters', 'Green Day', 'Blink-182', 'Weezer', 'Muse',
    'Arctic Monkeys', 'Queens of the Stone Age', 'Jack White', 'Beck', 'Interpol',
    'My Chemical Romance', 'Rush', 'Guns N\'Roses', 'Metallica', 'Pearl Jam',
    'Red Hot Chili Peppers', 'The Black Keys', 'Tame Impala', 'Radiohead', 'The Strokes',
  ],
  pop: [
    'Taylor Swift', 'Ariana Grande', 'The Weeknd', 'Ed Sheeran', 'Coldplay',
    'Billie Eilish', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Chappell Roan', 'Dua Lipa',
    'Bruno Mars', 'Post Malone', 'Lady Gaga', 'Doja Cat', 'Cardi B',
    'SZA', 'Lizzo', 'Harry Styles', 'Noah Kahan', 'Hozier',
  ],
  hiphop: [
    'Kendrick Lamar', 'Bad Bunny', 'Drake', 'Tyler the Creator', 'J. Cole',
    'Eminem', 'Travis Scott', 'Lil Wayne', 'Future', '21 Savage',
    'Childish Gambino', 'Lil Baby', 'Gunna', 'Vince Staples', 'Joey Bada$$',
    'Pusha T', 'JPEGMAFIA', 'Ice Spice', 'GloRilla', 'Doechii',
  ],
  country: [
    'Morgan Wallen', 'Zach Bryan', 'Luke Combs', 'Chris Stapleton', 'Kacey Musgraves',
    'Lainey Wilson', 'Tyler Childers', 'Jason Isbell', 'Cody Johnson', 'Eric Church',
    'Miranda Lambert', 'Megan Moroney', 'Hardy', 'Jelly Roll', 'Shaboozey',
    'Thomas Rhett', 'Kane Brown', 'Dierks Bentley', 'Blake Shelton', 'Carrie Underwood',
  ],
  indie: [
    'Bon Iver', 'Phoebe Bridgers', 'Boygenius', 'Mitski', 'Big Thief',
    'The National', 'Vampire Weekend', 'LCD Soundsystem', 'Arcade Fire', 'Waxahatchee',
    'Angel Olsen', 'Sharon Van Etten', 'Japanese Breakfast', 'Soccer Mommy', 'Snail Mail',
    'Weyes Blood', 'Faye Webster', 'Gracie Abrams', 'Fleet Foxes', 'Death Cab for Cutie',
  ],
  comedy: [
    'Nate Bargatze', 'John Mulaney', 'Dave Chappelle', 'Nikki Glaser', 'Bert Kreischer',
    'Taylor Tomlinson', 'Shane Gillis', 'Bill Burr', 'Kevin Hart', 'Jerry Seinfeld',
    'Jim Gaffigan', 'Ali Wong', 'Sebastian Maniscalco', 'Andrew Schulz', 'Tom Segura',
    'Theo Von', 'Matt Rife', 'Neal Brennan', 'Mark Normand', 'Hannah Gadsby',
  ],
}

const GENRE_LABELS = {
  rock: '🎸 Rock',
  pop: '🎤 Pop',
  hiphop: '🎧 Hip-Hop',
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

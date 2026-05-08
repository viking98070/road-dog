import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>Introducing</div>
        <h1 className={styles.headline}>
          Your game.<br /><span>Their city.</span>
        </h1>
        <p className={styles.sub}>
          Follow your teams and artists. Road Dog finds the weekends when
          everything lines up — and builds the trip around it.
        </p>
        <div className={styles.pills}>
          <span>🏈 Away games & must-see events</span>
          <span>🎵 Live shows</span>
          <span>🎤 Comedy</span>
          <span>✈️ Trip planning</span>
        </div>
        <button className={styles.cta} onClick={() => navigate('/login')}>
          Get started free
        </button>
        <p className={styles.hint}>No credit card required</p>
      </div>
    </div>
  )
}

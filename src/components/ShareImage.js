import React, { useEffect, useMemo, useState } from 'react'
import styles from './ShareImage.module.css'

// "📸 Share image" pop-up for a shared trip: an Instagram Story (9:16) or
// post (4:5) picture of the trip, drawn by /api/trip-image. On phones it goes
// to the share sheet as a file (Instagram, Messages, Photos…); elsewhere it
// downloads. Both images are fetched as soon as the pop-up opens, because
// phones only allow the share sheet straight from a tap.

const FORMATS = [
  { key: 'story', label: 'Story', hint: '9:16' },
  { key: 'post', label: 'Post', hint: '4:5' },
]

function imageUrl(code, format) {
  return `/api/trip-image?code=${encodeURIComponent(code)}&format=${format}`
}

function canShareFiles() {
  try {
    if (!navigator.canShare) return false
    const probe = new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

// Link for an Instagram link sticker, tagged so Vercel Analytics shows Story taps.
const igLink = code => `https://roaddogapp.com/trip/${code}?utm_source=instagram&utm_medium=social&utm_campaign=trip-share`

export default function ShareImage({ code, onClose }) {
  const [format, setFormat] = useState('story')
  const [files, setFiles] = useState({})
  const [failed, setFailed] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareFiles = canShareFiles()

  useEffect(() => {
    let alive = true
    for (const f of FORMATS) {
      fetch(imageUrl(code, f.key))
        .then(r => (r.ok && (r.headers.get('content-type') || '').startsWith('image/png') ? r.blob() : Promise.reject()))
        .then(blob => {
          if (alive) setFiles(prev => ({ ...prev, [f.key]: new File([blob], `road-dog-trip-${f.key}.png`, { type: 'image/png' }) }))
        })
        .catch(() => { if (alive) setFailed(true) })
    }
    return () => { alive = false }
  }, [code])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const file = files[format]
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  async function handleShare() {
    if (!file) return
    if (shareFiles) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch (err) {
        if (err && err.name === 'AbortError') return
      }
    }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(igLink(code))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Share trip image">
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.head}>
          <div className={styles.title}>Share as an image</div>
          <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.toggle}>
          {FORMATS.map(f => (
            <button
              key={f.key}
              className={`${styles.toggleBtn} ${format === f.key ? styles.on : ''}`}
              onClick={() => setFormat(f.key)}
            >
              {f.label} <span>{f.hint}</span>
            </button>
          ))}
        </div>

        <div className={`${styles.preview} ${format === 'story' ? styles.previewStory : styles.previewPost}`}>
          {failed && !file
            ? <div className={styles.wait}>Couldn't make the image. Try again in a minute.</div>
            : file
              ? <img src={previewUrl} alt="Trip image preview" />
              : <div className={styles.wait}><div className={styles.spinner} />Making your image…</div>}
        </div>

        <button className={styles.primary} onClick={handleShare} disabled={!file}>
          {shareFiles ? 'Share image' : 'Download image'}
        </button>

        <div className={styles.tip}>
          On Instagram, add a <b>link sticker</b> to your Story with the trip link:
          <button className={styles.link} onClick={copyLink}>{copied ? 'Copied ✓' : `roaddogapp.com/trip/${code}`}</button>
        </div>
      </div>
    </div>
  )
}

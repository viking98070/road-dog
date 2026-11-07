// Trip image for a shared trip: /api/trip-image?code=<code>&format=og|post|story
//   og    1200×630   link-preview card (iMessage, X, Facebook…)
//   post  1080×1350  Instagram feed post
//   story 1080×1920  Instagram Story
// Snapshots never change, so images are cached for a day at the edge.
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'node:fs'
import { tripCard, FORMATS } from './_lib/tripCard.mjs'

const font = name => readFileSync(new URL(`./_fonts/${name}`, import.meta.url))
const FONTS = [
  { name: 'Oswald', data: font('oswald-latin-700-normal.woff'), weight: 700, style: 'normal' },
  { name: 'Oswald', data: font('oswald-latin-600-normal.woff'), weight: 600, style: 'normal' },
  { name: 'Barlow', data: font('barlow-latin-500-normal.woff'), weight: 500, style: 'normal' },
  { name: 'Barlow', data: font('barlow-latin-700-normal.woff'), weight: 700, style: 'normal' },
]

export async function renderTripPng(trip, format) {
  const f = FORMATS[format] || FORMATS.og
  const svg = await satori(tripCard(trip, format), { width: f.w, height: f.h, fonts: FONTS })
  return new Resvg(svg, { fitTo: { mode: 'width', value: f.w } }).render().asPng()
}

async function loadTrip(code) {
  const base = process.env.REACT_APP_SUPABASE_URL
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY
  if (!code || !base || !key) return null
  const r = await fetch(`${base}/rest/v1/rpc/get_shared_trip`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_code: code, p_count_view: false }),
  })
  return r.ok ? r.json() : null
}

export default async function handler(req, res) {
  const code = String(req.query?.code || '').replace(/[^a-z0-9]/gi, '').slice(0, 32)
  const format = FORMATS[req.query?.format] ? req.query.format : 'og'
  try {
    const trip = await loadTrip(code)
    if (!trip || !trip.start_date) {
      res.statusCode = 302
      res.setHeader('Location', '/og-image.png')
      return res.end()
    }
    const png = await renderTripPng(trip, format)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
    if (req.query?.download) res.setHeader('Content-Disposition', `attachment; filename="road-dog-trip-${code}-${format}.png"`)
    res.statusCode = 200
    res.end(png)
  } catch (e) {
    console.error('trip-image failed', e)
    res.statusCode = 302
    res.setHeader('Location', '/og-image.png')
    res.end()
  }
}

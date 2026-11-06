import { supabase } from './supabase'

// Onboarding drop-off tracking (#21). Each browser gets a random visitor id so
// we can count how many people reach each step: start → teams_done →
// shows_done → saw_trips → email_submitted. Rows go through the
// log_onboarding_step() database function; nobody can read them from the site.

function safeGet(store, key) {
  try { return store.getItem(key) } catch (_) { return null }
}
function safeSet(store, key, value) {
  try { store.setItem(key, value) } catch (_) { /* private mode etc. */ }
}

export function visitorId() {
  let id = safeGet(window.localStorage, 'rd_visitor')
  if (!id) {
    id = (window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(36).slice(2)
    safeSet(window.localStorage, 'rd_visitor', id)
  }
  return id
}

// Remember where this visit came from (?utm_source=x&utm_campaign=<post id>)
// so the funnel can be split by social post or ad. Call once on page load.
export function captureUtm() {
  try {
    const p = new URLSearchParams(window.location.search)
    const source = p.get('utm_source')
    if (source) {
      safeSet(window.sessionStorage, 'rd_utm_source', source)
      safeSet(window.sessionStorage, 'rd_utm_campaign', p.get('utm_campaign') || '')
    }
  } catch (_) { /* ignore */ }
}

export function trackStep(step, detail) {
  try {
    supabase.rpc('log_onboarding_step', {
      p_visitor: visitorId(),
      p_step: step,
      p_utm_source: safeGet(window.sessionStorage, 'rd_utm_source'),
      p_utm_campaign: safeGet(window.sessionStorage, 'rd_utm_campaign'),
      p_detail: detail || null,
    }).then(() => {}, () => {})
  } catch (_) { /* tracking must never break the app */ }
}

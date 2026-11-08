// #22: game start times (sports only — concert times are too unreliable:
// doors vs. openers vs. headliner). Saved by the ESPN / college football sync
// as events.start_at (null = not set yet) and events.start_tz (the venue's
// time zone). Shown in the venue's local time, e.g. "7:05 PM CDT".

const fmtCache = {}

export function startTimeLabel(event) {
  if (!event || event.type !== 'sport' || event.league_key === 'marquee') return null
  // No zone = a row the updated sync hasn't reached yet (or a venue outside
  // the zones we know): show nothing rather than a wrong time.
  if (!event.start_tz) return null
  if (!event.start_at) return 'Time TBD'
  try {
    let f = fmtCache[event.start_tz]
    if (!f) {
      f = new Intl.DateTimeFormat('en-US', {
        timeZone: event.start_tz, hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
      })
      fmtCache[event.start_tz] = f
    }
    return f.format(new Date(event.start_at))
  } catch {
    return null
  }
}

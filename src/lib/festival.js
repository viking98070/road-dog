// Festivals (Ticketmaster festival listings and the curated major festivals
// from #37) get their own FESTIVAL pill color, so they stand apart from
// regular concerts (purple) at a glance.
export const FESTIVAL_COLOR = '#C026D3'

export function isFestival(e) {
  return !!e && (e.league_key === 'festival' || !!e.parent_event)
}

// Festivals (Ticketmaster festival listings and the curated major festivals
// from #37) get their own FESTIVAL pill: a purple-to-orange "sunset" gradient
// (music purple into the brand orange), so they stand apart from regular
// concerts at a glance. Used only as a CSS `background` value.
export const FESTIVAL_COLOR = 'linear-gradient(90deg, #7B2D8B 0%, #F97316 100%)'

export function isFestival(e) {
  return !!e && (e.league_key === 'festival' || !!e.parent_event)
}

// #23: MLB spring training games (ESPN season type 1 = preseason). They show a
// SPRING TRAINING label instead of MLB, and the trip builder treats them as a
// bonus, never the anchor of a trip.
export const SPRING_LABEL = 'SPRING TRAINING'
export const SPRING_COLOR = '#3F7D20'

export function isSpring(e) {
  return !!e && e.type === 'sport' && e.league_key === 'mlb' && e.season_type === 1
}

// "+2 more spring games nearby" — other spring games of the trip's teams
// during the trip (counted by the trip builder in trip_combos.spring_more).
export function springMoreText(n) {
  if (!n || n < 1) return null
  return `+${n} more spring training ${n === 1 ? 'game' : 'games'} nearby`
}

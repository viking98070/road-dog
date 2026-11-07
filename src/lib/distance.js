// Miles between events (#18 / #13). Venues only have coordinates, so this is
// the straight-line distance padded by ~15% to approximate driving miles
// (Chicago → Indianapolis: 165 straight, ~183 by road → shows "~190 mi").

export function straightMiles(a, b) {
  if (a?.latitude == null || a?.longitude == null || b?.latitude == null || b?.longitude == null) return null
  const R = 3959
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Same metro (under ~25 straight-line miles, e.g. Dallas ↔ Arlington) isn't
// worth a line; otherwise an approximate road distance, rounded to 10.
const SAME_AREA_MILES = 25

export function legMiles(a, b) {
  const m = straightMiles(a, b)
  if (m == null || m < SAME_AREA_MILES) return null
  return Math.max(10, Math.round((m * 1.15) / 10) * 10)
}

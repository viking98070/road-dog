// Airports for "Plan your trip" (#17): the nearest one to a point gives the
// code shown on the Flights card ("SAN → LAS") and used in the Google Flights
// search. Multi-airport metros use the metro code Google Flights understands
// (NYC, CHI, WAS) so the search covers every airport there.
// [code, lat, lng]
const AIRPORTS = [
  ['ABQ', 35.04, -106.61], ['ANC', 61.17, -150.0], ['ATL', 33.64, -84.43],
  ['AUS', 30.19, -97.67], ['BDL', 41.94, -72.68], ['BHM', 33.56, -86.75],
  ['BNA', 36.12, -86.68], ['BOI', 43.56, -116.22], ['BOS', 42.36, -71.01],
  ['BTV', 44.47, -73.15], ['BUF', 42.94, -78.73], ['BWI', 39.18, -76.67],
  ['CHS', 32.9, -80.04], ['CLE', 41.41, -81.85], ['CLT', 35.21, -80.94],
  ['CMH', 39.998, -82.89], ['COS', 38.81, -104.7], ['CVG', 39.05, -84.67],
  ['DAY', 39.9, -84.22], ['DEN', 39.86, -104.67], ['DFW', 32.9, -97.04],
  ['DSM', 41.53, -93.66], ['DTW', 42.21, -83.35], ['ELP', 31.81, -106.38],
  ['FAT', 36.78, -119.72], ['FLL', 26.07, -80.15], ['GRB', 44.49, -88.13],
  ['GRR', 42.88, -85.52], ['GSO', 36.1, -79.94], ['GSP', 34.9, -82.22],
  ['HNL', 21.32, -157.92], ['HOU', 29.65, -95.28], ['IAH', 29.98, -95.34],
  ['IND', 39.72, -86.29], ['JAX', 30.49, -81.69], ['LAS', 36.08, -115.15],
  ['LAX', 33.94, -118.41], ['LEX', 38.04, -84.61], ['LIT', 34.73, -92.22],
  ['MCI', 39.3, -94.71], ['MCO', 28.43, -81.31], ['MEM', 35.04, -89.98],
  ['MIA', 25.79, -80.29], ['MKE', 42.95, -87.9], ['MSN', 43.14, -89.34],
  ['MSP', 44.88, -93.22], ['MSY', 29.99, -90.26], ['OAK', 37.72, -122.22],
  ['OKC', 35.39, -97.6], ['OMA', 41.3, -95.89],
  ['ORF', 36.89, -76.2], ['PBI', 26.68, -80.1], ['PDX', 45.59, -122.6],
  ['PHL', 39.87, -75.24], ['PHX', 33.43, -112.01], ['PIT', 40.49, -80.23],
  ['PVD', 41.72, -71.43], ['RDU', 35.88, -78.79], ['RIC', 37.51, -77.32],
  ['RNO', 39.5, -119.77], ['ROC', 43.12, -77.67], ['RSW', 26.54, -81.76],
  ['SAN', 32.73, -117.19], ['SAT', 29.53, -98.47], ['SAV', 32.13, -81.2],
  ['SDF', 38.17, -85.74], ['SEA', 47.45, -122.31], ['SFO', 37.62, -122.38],
  ['SJC', 37.36, -121.93], ['SLC', 40.79, -111.98], ['SMF', 38.7, -121.59],
  ['SNA', 33.68, -117.87], ['STL', 38.75, -90.37], ['SYR', 43.11, -76.11],
  ['TPA', 27.98, -82.53], ['TUL', 36.2, -95.89], ['TUS', 32.12, -110.94],
  ['TYS', 35.81, -83.99], ['GEG', 47.62, -117.53], ['SGF', 37.25, -93.39],
  ['ICT', 37.65, -97.43], ['TOL', 41.59, -83.81], ['MOB', 30.69, -88.24],
  ['CHA', 35.04, -85.2], ['LAN', 42.78, -84.59],
  ['AVL', 35.44, -82.54], ['PNS', 30.47, -87.19],
  ['GNV', 29.69, -82.27], ['TLH', 30.4, -84.35], ['BTR', 30.53, -91.15],
  ['CAE', 33.94, -81.12], ['SBN', 41.71, -86.32], ['CID', 41.88, -91.71],
  ['LNK', 40.85, -96.76], ['FSD', 43.58, -96.74], ['FAR', 46.92, -96.82],
  ['BIL', 45.81, -108.54], ['MSO', 46.92, -114.09], ['JAN', 32.31, -90.08],
  ['HSV', 34.64, -86.77], ['SHV', 32.45, -93.83], ['LBB', 33.66, -101.82],
  ['CRP', 27.77, -97.5], ['ALB', 42.75, -73.8], ['PWM', 43.65, -70.31],
  ['MHT', 42.93, -71.44], ['EUG', 44.12, -123.22], ['ACY', 39.46, -74.58],
  ['SBA', 34.43, -119.84], ['PSP', 33.83, -116.51], ['SRQ', 27.4, -82.55],
  // Multi-airport metros (Google Flights metro codes)
  ['NYC', 40.71, -73.9], ['CHI', 41.88, -87.75], ['WAS', 38.9, -77.2],
  // Canada (NHL/NBA/MLB away games)
  ['YYZ', 43.68, -79.63], ['YUL', 45.47, -73.74], ['YVR', 49.19, -123.18],
  ['YYC', 51.13, -114.01], ['YEG', 53.31, -113.58], ['YWG', 49.91, -97.24],
  ['YOW', 45.32, -75.67],
]

function milesBetween(lat1, lng1, lat2, lng2) {
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 3959 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Nearest airport code within maxMiles of the point, or null.
export function nearestAirport(lat, lng, maxMiles = 100) {
  if (lat == null || lng == null) return null
  let best = null
  for (const [code, aLat, aLng] of AIRPORTS) {
    const d = milesBetween(lat, lng, aLat, aLng)
    if (d <= maxMiles && (!best || d < best.miles)) best = { code, miles: d }
  }
  return best ? best.code : null
}

export { milesBetween }

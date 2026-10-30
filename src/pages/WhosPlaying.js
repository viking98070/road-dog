import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './Dashboard.module.css'

// Where the "Follow my teams" button goes. Change this if your team picker lives elsewhere.
const FOLLOW_TEAMS_PATH = '/hub'

const ALL_LEAGUES = ['nfl', 'mlb', 'nba', 'nhl', 'mls', 'nwsl', 'wnba', 'cfb', 'mcbb', 'wcbb']

const LEAGUE_OPTIONS = [
  { key: 'nfl',  label: 'NFL' },
  { key: 'mlb',  label: 'MLB' },
  { key: 'nba',  label: 'NBA' },
  { key: 'nhl',  label: 'NHL' },
  { key: 'mls',  label: 'MLS' },
  { key: 'nwsl', label: 'NWSL' },
  { key: 'wnba', label: 'WNBA' },
  { key: 'cfb',  label: 'College football' },
  { key: 'mcbb', label: "Men's college hoops" },
  { key: 'wcbb', label: "Women's college hoops" },
]

const GENRE_OPTIONS = [
  'Rock', 'Pop', 'Country', 'Hip-Hop/Rap', 'R&B', 'Alternative',
  'Metal', 'Folk', 'Jazz', 'Latin', 'World', 'Dance/Electronic',
]

const POPULAR_CITIES = ['New York', 'Chicago', 'Los Angeles', 'Dallas', 'Boston', 'Las Vegas', 'Nashville', 'Denver']

const CITIES = [
  'Atlanta, GA', 'Austin, TX', 'Baltimore, MD', 'Boston, MA', 'Buffalo, NY',
  'Charlotte, NC', 'Chicago, IL', 'Cincinnati, OH', 'Cleveland, OH', 'Columbus, OH',
  'Dallas, TX', 'Denver, CO', 'Detroit, MI', 'Green Bay, WI', 'Houston, TX',
  'Indianapolis, IN', 'Jacksonville, FL', 'Kansas City, MO', 'Las Vegas, NV',
  'Los Angeles, CA', 'Louisville, KY', 'Memphis, TN', 'Miami, FL', 'Milwaukee, WI',
  'Minneapolis, MN', 'Nashville, TN', 'New Orleans, LA', 'New York, NY',
  'Oakland, CA', 'Oklahoma City, OK', 'Orlando, FL', 'Philadelphia, PA',
  'Phoenix, AZ', 'Pittsburgh, PA', 'Portland, OR', 'Raleigh, NC',
  'Sacramento, CA', 'Salt Lake City, UT', 'San Antonio, TX', 'San Diego, CA',
  'San Francisco, CA', 'San Jose, CA', 'Seattle, WA', 'St. Louis, MO',
  'Tampa, FL', 'Washington, DC',
  'Athens, GA', 'Auburn, AL', 'Tuscaloosa, AL', 'Baton Rouge, LA',
  'Oxford, MS', 'Starkville, MS', 'Fayetteville, AR', 'Knoxville, TN',
  'Columbia, SC', 'Gainesville, FL', 'Lexington, KY',
  'College Station, TX', 'Chapel Hill, NC', 'Durham, NC', 'Clemson, SC',
  'Tallahassee, FL', 'Blacksburg, VA', 'Charlottesville, VA',
  'Winston-Salem, NC', 'South Bend, IN', 'East Lansing, MI', 'Ann Arbor, MI',
  'State College, PA', 'Madison, WI', 'Iowa City, IA', 'Lincoln, NE',
  'Champaign, IL', 'West Lafayette, IN', 'Bloomington, IN', 'Evanston, IL',
  'Norman, OK', 'Stillwater, OK', 'Lubbock, TX', 'Waco, TX', 'Manhattan, KS',
  'Lawrence, KS', 'Boulder, CO', 'Provo, UT', 'Logan, UT', 'Tucson, AZ',
  'Tempe, AZ', 'Berkeley, CA', 'Palo Alto, CA', 'Eugene, OR', 'Corvallis, OR',
  'Pullman, WA', 'Boise, ID',
  'Albuquerque, NM', 'Anaheim, CA', 'Anchorage, AK', 'Arlington, TX',
  'Birmingham, AL', 'Bridgeport, CT', 'Burlington, VT',
  'Charleston, SC', 'Charleston, WV', 'Chattanooga, TN', 'Colorado Springs, CO',
  'Des Moines, IA', 'El Paso, TX', 'Fort Lauderdale, FL', 'Fort Worth, TX',
  'Fresno, CA', 'Grand Rapids, MI', 'Hartford, CT', 'Honolulu, HI',
  'Lansing, MI', 'Little Rock, AR', 'Long Beach, CA',
  'Mesa, AZ', 'Mobile, AL', 'Newark, NJ', 'Omaha, NE',
  'Providence, RI', 'Reno, NV', 'Richmond, VA', 'Rochester, NY',
  'San Bernardino, CA', 'Santa Ana, CA', 'Savannah, GA', 'Scottsdale, AZ',
  'Spokane, WA', 'Springfield, MO', 'Stockton, CA', 'Syracuse, NY',
  'Toledo, OH', 'Tulsa, OK', 'Virginia Beach, VA', 'Wichita, KS',
]

// ---------- dates ----------
// Local-date YYYY-MM-DD (toISOString shifts to UTC, which can turn tonight into tomorrow).
function toYMD(d) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function today() { const d = new Date(); d.setHours(12, 0, 0, 0); return d }

const PRESETS = [
  { key: 'thisWeekend', label: 'This weekend' },
  { key: 'nextWeekend', label: 'Next weekend' },
  { key: 'next7', label: 'Next 7 days' },
  { key: 'next30', label: 'Next 30 days' },
]

function presetRange(key) {
  const t = today()
  const dow = t.getDay() // 0 Sun … 6 Sat
  // Upcoming Friday; if it's already Fri/Sat/Sun, this weekend started.
  const daysToFri = dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow
  const fri = addDays(t, daysToFri)
  if (key === 'thisWeekend') return [dow === 0 || dow === 6 || dow === 5 ? t : fri, addDays(fri, 2)]
  if (key === 'nextWeekend') return [addDays(fri, 7), addDays(fri, 9)]
  if (key === 'next7') return [t, addDays(t, 6)]
  return [t, addDays(t, 29)]
}

function rangeLabel(start, end) {
  if (!start || !end) return 'Pick dates'
  const o = { month: 'short', day: 'numeric' }
  const s = start.toLocaleDateString('en-US', o)
  if (toYMD(start) === toYMD(end)) return s
  const e = start.getMonth() === end.getMonth() ? String(end.getDate()) : end.toLocaleDateString('en-US', o)
  return `${s} – ${e}`
}

function dayLabel(ymd) {
  return new Date(ymd + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ---------- event helpers ----------
const PRO = new Set(['nfl', 'nba', 'nhl', 'mlb', 'mls', 'nwsl', 'wnba', 'marquee'])
const COLLEGE = new Set(['cfb', 'mcbb', 'wcbb'])

function kindOf(e) {
  if (e.type === 'music') return 'music'
  if (e.type === 'comedy') return 'comedy'
  return 'sports'
}
function isCollege(e) { return e.type === 'sport' && COLLEGE.has(e.league_key) }

// Bigger events first within a day: marquee, pro sports, shows, then college.
function weight(e) {
  if (e.league_key === 'marquee') return 0
  if (e.type === 'sport' && PRO.has(e.league_key)) return 1
  if (e.parent_event) return 2
  if (e.type === 'music') return 3
  if (e.type === 'comedy') return 4
  return 5
}

function categoryColor(e) {
  if (e.league_key === 'marquee') return '#B8860B'
  if (e.parent_event || e.type === 'music') return '#7B2D8B'
  if (e.type === 'comedy') return '#BE185D'
  const c = {
    nfl: '#1D4ED8', mlb: '#B91C1C', nba: '#C2410C', nhl: '#0E7490', wnba: '#C2410C',
    mls: '#4D7C0F', nwsl: '#4D7C0F', cfb: '#B45309', mcbb: '#15803D', wcbb: '#15803D',
  }
  return c[e.league_key] || '#525252'
}
function categoryLabel(e) {
  if (e.league_key === 'marquee') return 'MARQUEE'
  if (e.parent_event) return 'FESTIVAL'
  if (e.type === 'music') return 'MUSIC'
  if (e.type === 'comedy') return 'COMEDY'
  const l = { mcbb: 'CBB', wcbb: 'WCBB', cfb: 'CFB' }
  return l[e.league_key] || (e.league_key || 'EVENT').toUpperCase()
}
function eventTitle(e) {
  if (e.league_key === 'marquee') return e.artist_name || 'Marquee event'
  if (e.type === 'sport') return `${e.away_team || 'TBD'} @ ${e.home_team || 'TBD'}`
  return e.artist_name || 'Untitled event'
}
function ticketsUrl(e) {
  return e.url || `https://www.ticketmaster.com/event/${encodeURIComponent(e.id)}`
}

function readLastCity() { try { return localStorage.getItem('rd_wp_city') || '' } catch { return '' } }
function saveLastCity(c) { try { localStorage.setItem('rd_wp_city', c) } catch { /* ignore */ } }

export default function WhosPlaying({ session }) {
  const navigate = useNavigate()

  const [city, setCity] = useState(readLastCity)
  const [cityDraft, setCityDraft] = useState(readLastCity)
  const [editingCity, setEditingCity] = useState(!readLastCity())
  const [showSuggest, setShowSuggest] = useState(false)

  const [preset, setPreset] = useState('thisWeekend')
  const [customRange, setCustomRange] = useState([null, null])
  const [showPicker, setShowPicker] = useState(false)

  const [kind, setKind] = useState('all')            // all | sports | music | comedy
  const [showFilters, setShowFilters] = useState(false)
  const [leagues, setLeagues] = useState([])          // empty = all leagues
  const [genres, setGenres] = useState([])            // empty = all genres
  const [openCollege, setOpenCollege] = useState({})  // day -> expanded

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cache = useRef({})
  const reqId = useRef(0)

  const [startDate, endDate] = preset === 'custom' ? customRange : presetRange(preset)
  const rangeReady = !!(startDate && endDate)

  // One search per city + dates, always for everything. Type and league/genre
  // filters run on the results in the browser, so switching them is instant.
  useEffect(() => {
    if (!city || !rangeReady) return
    const key = `${city.toLowerCase()}|${toYMD(startDate)}|${toYMD(endDate)}`
    if (cache.current[key]) { setResults(cache.current[key]); setError(''); return }
    const id = ++reqId.current
    setLoading(true); setError('')
    supabase.functions.invoke('whos-playing-search', {
      body: {
        city,
        startDate: toYMD(startDate),
        endDate: toYMD(endDate),
        leagues: ALL_LEAGUES,
        musicSelected: true,
        includeComedy: true,
      },
    }).then(({ data, error: err }) => {
      if (id !== reqId.current) return
      if (err) { console.error('Search error:', err); setError("Couldn't load events. Try again in a moment."); setResults([]); return }
      const list = data?.results || []
      cache.current[key] = list
      setResults(list)
    }).catch(e => {
      if (id !== reqId.current) return
      console.error('Search error:', e); setError("Couldn't load events. Try again in a moment."); setResults([])
    }).finally(() => { if (id === reqId.current) setLoading(false) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, rangeReady && toYMD(startDate), rangeReady && toYMD(endDate)])

  function chooseCity(c) {
    const name = c.split(',')[0].trim()
    if (!name) return
    setCity(name); setCityDraft(name); setEditingCity(false); setShowSuggest(false)
    setOpenCollege({}); saveLastCity(name)
  }

  function choosePreset(k) {
    setPreset(k); setShowPicker(false); setOpenCollege({})
  }

  const counts = useMemo(() => {
    const c = { all: 0, sports: 0, music: 0, comedy: 0 }
    for (const e of results || []) { c.all++; c[kindOf(e)]++ }
    return c
  }, [results])

  const filtered = useMemo(() => {
    let list = results || []
    if (kind !== 'all') list = list.filter(e => kindOf(e) === kind)
    if (leagues.length) list = list.filter(e => e.type !== 'sport' || leagues.includes(e.league_key))
    if (genres.length) {
      list = list.filter(e => {
        if (e.type !== 'music') return true
        if (!e.genre) return false
        const g0 = e.genre.toLowerCase()
        return genres.some(g => g0.includes(g.toLowerCase()) || g.toLowerCase().includes(g0))
      })
    }
    return list
  }, [results, kind, leagues, genres])

  const days = useMemo(() => {
    const byDay = {}
    for (const e of filtered) (byDay[e.event_date] ||= []).push(e)
    return Object.keys(byDay).sort().map(d => {
      const items = byDay[d].sort((a, b) => weight(a) - weight(b))
      const main = items.filter(e => !isCollege(e))
      const college = items.filter(isCollege)
      return { day: d, main, college }
    })
  }, [filtered])

  const filterCount = leagues.length + genres.length
  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter(x => x !== v) : [...list, v])

  const suggestions = cityDraft.trim()
    ? CITIES.filter(c => c.toLowerCase().includes(cityDraft.trim().toLowerCase())).slice(0, 8)
    : []

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className={styles.signOut} onClick={() => navigate('/hub')} style={{ background: 'transparent' }}>
            ← Hub
          </button>
          <div className={styles.logo}>Road<span>Dog</span></div>
        </div>
      </header>

      <main className={styles.main}>
        {/* ---------- Search as a sentence ---------- */}
        <section className="wp-hero">
          <div className="wp-eyebrow">What's on</div>
          <h1 className="wp-q">
            <span>Everything in </span>
            {editingCity ? (
              <span className="wp-cityedit">
                <input
                  autoFocus
                  aria-label="City"
                  value={cityDraft}
                  placeholder="Pick a city"
                  onChange={e => { setCityDraft(e.target.value); setShowSuggest(true) }}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => { setShowSuggest(false); if (city) { setEditingCity(false); setCityDraft(city) } }, 150)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') chooseCity(suggestions[0] || cityDraft)
                    if (e.key === 'Escape' && city) { setEditingCity(false); setCityDraft(city) }
                  }}
                />
                {showSuggest && suggestions.length > 0 && (
                  <div className="wp-suggest" role="listbox">
                    {suggestions.map(c => (
                      <div key={c} role="option" aria-selected="false" className="wp-sugg" onMouseDown={() => chooseCity(c)}>{c}</div>
                    ))}
                  </div>
                )}
              </span>
            ) : (
              <button type="button" className="wp-tok" onClick={() => { setEditingCity(true); setCityDraft('') }}>
                {city}<i>▾</i>
              </button>
            )}
            <br />
            <button type="button" className="wp-tok" onClick={() => { setPreset('custom'); setShowPicker(true) }}>
              {rangeLabel(startDate, endDate)}<i>▾</i>
            </button>
          </h1>

          {!city && (
            <div className="wp-row">
              <span className="wp-lbl">Popular</span>
              {POPULAR_CITIES.map(c => (
                <button type="button" key={c} className="wp-chip" onClick={() => chooseCity(c)}>{c}</button>
              ))}
            </div>
          )}

          <div className="wp-row">
            <span className="wp-lbl">When</span>
            {PRESETS.map(p => (
              <button type="button" key={p.key} className={`wp-chip${preset === p.key ? ' on' : ''}`} onClick={() => choosePreset(p.key)}>{p.label}</button>
            ))}
            <button type="button" className={`wp-chip${preset === 'custom' ? ' on' : ''}`} onClick={() => { setPreset('custom'); setShowPicker(v => !v) }}>Pick dates</button>
          </div>

          {showPicker && preset === 'custom' && (
            <div className="wp-picker">
              <DatePicker
                inline
                selectsRange
                monthsShown={window.innerWidth > 700 ? 2 : 1}
                startDate={customRange[0]}
                endDate={customRange[1]}
                minDate={new Date()}
                onChange={(r) => { setCustomRange(r); if (r[0] && r[1]) setShowPicker(false) }}
              />
            </div>
          )}

          <div className="wp-row">
            <span className="wp-lbl">Show</span>
            {[['all', 'Everything'], ['sports', 'Sports'], ['music', 'Music'], ['comedy', 'Comedy']].map(([k, label]) => (
              <button type="button" key={k} className={`wp-chip${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>
                {label}{results && <small>{counts[k]}</small>}
              </button>
            ))}
            <button type="button" className={`wp-chip ghost${filterCount ? ' on-ghost' : ''}`} onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters}>
              {showFilters ? '− Hide filters' : `+ Leagues & genres${filterCount ? ` (${filterCount})` : ''}`}
            </button>
          </div>

          {showFilters && (
            <div className="wp-filters">
              {kind !== 'music' && kind !== 'comedy' && (
                <div>
                  <div className="wp-flabel">Leagues <span>{leagues.length ? '' : '· all'}</span></div>
                  <div className="wp-chips">
                    {LEAGUE_OPTIONS.map(l => (
                      <button type="button" key={l.key} className={`wp-chip sm${leagues.includes(l.key) ? ' on' : ''}`} onClick={() => toggle(leagues, setLeagues, l.key)}>{l.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {kind !== 'sports' && kind !== 'comedy' && (
                <div>
                  <div className="wp-flabel">Music genres <span>{genres.length ? '' : '· all'}</span></div>
                  <div className="wp-chips">
                    {GENRE_OPTIONS.map(g => (
                      <button type="button" key={g} className={`wp-chip sm${genres.includes(g) ? ' on' : ''}`} onClick={() => toggle(genres, setGenres, g)}>{g}</button>
                    ))}
                  </div>
                </div>
              )}
              {filterCount > 0 && (
                <button type="button" className="wp-clear" onClick={() => { setLeagues([]); setGenres([]) }}>Clear filters</button>
              )}
            </div>
          )}
        </section>

        {/* ---------- Results ---------- */}
        <div className="wp-layout">
          <section className="wp-results" aria-live="polite">
            {!city && (
              <div className="wp-empty">Pick a city above to see every game, concert and comedy show there.</div>
            )}

            {city && rangeReady && loading && (
              <div className="wp-loading">
                <div className="wp-sum"><b>Finding what's on in {city}…</b></div>
                {[0, 1, 2, 3].map(i => <div key={i} className="wp-skel" />)}
              </div>
            )}

            {city && !rangeReady && !loading && (
              <div className="wp-empty">Pick a start and end date.</div>
            )}

            {city && rangeReady && !loading && results && (
              <>
                {error && <div className="wp-error">{error}</div>}
                {!error && (
                  <div className="wp-sum">
                    <b>{filtered.length === 0 ? 'Nothing found' : `${filtered.length} event${filtered.length === 1 ? '' : 's'} · ${days.length} day${days.length === 1 ? '' : 's'}`}</b>
                    {filtered.length > 0 && <span>By day · biggest first</span>}
                  </div>
                )}
                {!error && filtered.length === 0 && (
                  <div className="wp-empty">
                    Nothing matches in {city} for {rangeLabel(startDate, endDate)}.
                    {(kind !== 'all' || filterCount > 0)
                      ? <> <button type="button" className="wp-link" onClick={() => { setKind('all'); setLeagues([]); setGenres([]) }}>Show everything</button></>
                      : <> <button type="button" className="wp-link" onClick={() => choosePreset('next30')}>Try the next 30 days</button></>}
                  </div>
                )}

                {days.map(({ day, main, college }) => {
                  const open = openCollege[day] || main.length === 0
                  const shown = open ? [...main, ...college] : main
                  return (
                    <div key={day} className="wp-day">
                      <div className="wp-dh">{dayLabel(day)}</div>
                      {shown.map(e => (
                        <div key={e.id} className={`wp-ev${weight(e) <= 1 ? ' big' : ''}`}>
                          <span className="wp-bd" style={{ background: categoryColor(e) }}>{categoryLabel(e)}</span>
                          <div className="wp-evm">
                            <div className="wp-t">{eventTitle(e)}</div>
                            {e.parent_event && <div className="wp-fest">{e.parent_event}</div>}
                            <div className="wp-v">{e.venue}{e.city ? ` · ${e.city}` : ''}</div>
                          </div>
                          <a className="wp-tk" href={ticketsUrl(e)} target="_blank" rel="noopener noreferrer">Tickets ↗</a>
                        </div>
                      ))}
                      {!open && college.length > 0 && (
                        <button type="button" className="wp-more" onClick={() => setOpenCollege(o => ({ ...o, [day]: true }))}>
                          + {college.length} college game{college.length === 1 ? '' : 's'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </section>

          <aside className="wp-side">
            <div className="wp-card">
              <h3>Make it a road trip</h3>
              <p>Follow your teams and Road Dog finds weekends where they're playing away, then emails you when one pops up.</p>
              <button type="button" className="wp-btn" onClick={() => navigate(FOLLOW_TEAMS_PATH)}>Follow my teams</button>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .wp-hero{padding:8px 0 18px;margin-bottom:8px}
        .wp-eyebrow{font-family:var(--head);font-weight:600;color:var(--orange);letter-spacing:2px;font-size:13px;text-transform:uppercase}
        .wp-q{font-family:var(--head);font-weight:700;font-size:clamp(32px,6vw,54px);line-height:1.2;margin:8px 0 18px;text-transform:uppercase;color:var(--text)}
        .wp-tok{font:inherit;text-transform:inherit;color:var(--orange);background:none;border:0;border-bottom:4px solid var(--orange);padding:0 4px;cursor:pointer;white-space:nowrap;line-height:1.1}
        .wp-tok i{font-style:normal;font-size:.45em;vertical-align:middle;margin-left:6px;opacity:.85}
        .wp-tok:focus-visible,.wp-chip:focus-visible,.wp-btn:focus-visible,.wp-tk:focus-visible{outline:2px solid var(--text);outline-offset:2px}
        .wp-cityedit{position:relative;display:inline-block}
        .wp-cityedit input{font:inherit;text-transform:uppercase;color:var(--orange);background:transparent;border:0;border-bottom:4px solid var(--orange);width:8.5em;max-width:70vw;padding:0 4px;outline:none}
        .wp-cityedit input::placeholder{color:var(--text3)}
        .wp-suggest{position:absolute;top:calc(100% + 6px);left:0;min-width:260px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;z-index:20;box-shadow:0 8px 24px rgba(0,0,0,.45);font-family:var(--body);text-transform:none;font-size:15px;font-weight:500;letter-spacing:0;line-height:1.3;overflow:hidden}
        .wp-sugg{padding:10px 14px;color:var(--text);cursor:pointer;border-bottom:1px solid var(--border)}
        .wp-sugg:hover{background:var(--surface)}
        .wp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}
        .wp-lbl{font-family:var(--head);font-weight:600;font-size:12px;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;width:64px}
        .wp-chip{white-space:nowrap;border:1.5px solid var(--border);border-radius:999px;padding:8px 15px;font-family:var(--body);font-weight:600;font-size:14px;color:var(--text2);background:var(--surface);cursor:pointer}
        .wp-chip:hover{border-color:var(--text3);color:var(--text)}
        .wp-chip.on{background:var(--orange);border-color:var(--orange);color:#111}
        .wp-chip small{font-weight:500;opacity:.7;margin-left:6px}
        .wp-chip.ghost{background:transparent;border-style:dashed}
        .wp-chip.on-ghost{border-color:var(--orange);color:var(--orange)}
        .wp-chip.sm{padding:6px 12px;font-size:13px}
        .wp-picker{margin-top:12px}
        .wp-filters{margin-top:14px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:14px}
        .wp-flabel{font-family:var(--head);font-weight:600;font-size:12px;letter-spacing:1.2px;color:var(--text3);text-transform:uppercase;margin-bottom:8px}
        .wp-flabel span{text-transform:none;letter-spacing:0}
        .wp-chips{display:flex;flex-wrap:wrap;gap:6px}
        .wp-clear,.wp-link{align-self:flex-start;background:none;border:0;color:var(--orange);font-weight:600;font-size:14px;cursor:pointer;padding:0;font-family:var(--body)}
        .wp-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:28px;align-items:start}
        .wp-results{min-width:0}
        .wp-sum{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:6px 0 4px}
        .wp-sum b{font-family:var(--head);font-size:21px;font-weight:700;color:var(--text)}
        .wp-sum span{color:var(--text3);font-size:13px}
        .wp-day{margin-top:18px}
        .wp-dh{font-family:var(--head);font-weight:600;color:var(--orange);letter-spacing:1px;font-size:14px;text-transform:uppercase;margin-bottom:8px}
        .wp-ev{display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:8px}
        .wp-ev.big{border-color:#7a3a10;background:linear-gradient(90deg,rgba(249,115,22,.10),var(--surface) 60%)}
        .wp-bd{font-family:var(--head);font-weight:700;font-size:11px;letter-spacing:.8px;color:#fff;border-radius:6px;padding:4px 8px;min-width:62px;text-align:center;flex-shrink:0}
        .wp-evm{flex:1;min-width:0}
        .wp-t{font-weight:700;font-size:16px;color:var(--text)}
        .wp-fest{font-size:12px;color:var(--orange);font-weight:600;margin-top:2px}
        .wp-v{color:var(--text3);font-size:13px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .wp-tk{color:var(--orange);font-weight:600;font-size:13px;white-space:nowrap;text-decoration:none}
        .wp-more{background:none;border:0;color:var(--text2);font-size:13px;font-weight:600;padding:2px 4px;cursor:pointer;font-family:var(--body)}
        .wp-more:hover{color:var(--orange)}
        .wp-empty{color:var(--text2);font-size:15px;padding:28px 0}
        .wp-error{color:#FCA5A5;font-size:14px;padding:12px 0}
        .wp-skel{height:62px;border-radius:12px;background:linear-gradient(90deg,var(--surface),var(--surface2),var(--surface));background-size:200% 100%;animation:wpsh 1.2s infinite linear;margin-top:8px}
        @keyframes wpsh{to{background-position:-200% 0}}
        @media (prefers-reduced-motion:reduce){.wp-skel{animation:none}}
        .wp-side{position:sticky;top:16px;margin-top:44px}
        .wp-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px}
        .wp-card h3{font-family:var(--head);font-weight:700;font-size:19px;text-transform:uppercase;margin:0;color:var(--text)}
        .wp-card p{color:var(--text2);font-size:14px;margin:8px 0 0;line-height:1.45}
        .wp-btn{margin-top:14px;background:var(--orange);color:#111;font-weight:700;border:0;border-radius:999px;padding:10px 18px;font-size:14px;cursor:pointer;font-family:var(--body)}
        @media (max-width:760px){
          .wp-layout{grid-template-columns:minmax(0,1fr)}
          .wp-side{position:static;margin-top:20px}
          .wp-lbl{display:none}
          .wp-row{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-right:-16px;padding-right:16px}
          .wp-row::-webkit-scrollbar{display:none}
          .wp-ev{padding:11px 12px;gap:10px}
          .wp-bd{min-width:50px}
          .wp-tk{font-size:12px}
        }
        .react-datepicker{background:#1a1a1a;border:1px solid var(--border);font-family:var(--body)}
        .react-datepicker__header{background:#222;border-bottom:1px solid var(--border)}
        .react-datepicker__current-month,.react-datepicker__day-name{color:var(--text)}
        .react-datepicker__day{color:var(--text2)}
        .react-datepicker__day:hover{background:var(--orange);color:#000}
        .react-datepicker__day--selected,.react-datepicker__day--range-start,.react-datepicker__day--range-end{background:var(--orange)!important;color:#000!important}
        .react-datepicker__day--in-range,.react-datepicker__day--in-selecting-range{background:#1f0f00;color:var(--orange)}
        .react-datepicker__navigation-icon::before{border-color:var(--text2)}
        .react-datepicker__day--disabled{color:var(--text3)}
      `}</style>
    </div>
  )
}

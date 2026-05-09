import React, { useState } from 'react'
import styles from './Step.module.css'

const TEAM_SPORTS = ['nfl', 'mlb', 'nba', 'nhl', 'cfb', 'mcbb', 'wcbb', 'mls', 'nwsl', 'wnba']

const TEAMS = {
  nfl: ['49ers','Bears','Bengals','Bills','Broncos','Browns','Buccaneers','Cardinals','Chargers','Chiefs','Colts','Cowboys','Dolphins','Eagles','Falcons','Giants','Jaguars','Jets','Lions','Packers','Panthers','Patriots','Raiders','Rams','Ravens','Saints','Seahawks','Steelers','Texans','Titans','Vikings','Washington'],
  mlb: ['Angels','Astros','Athletics','Blue Jays','Braves','Brewers','Cardinals','Cubs','Dodgers','Giants','Guardians','Mariners','Mets','Nationals','Orioles','Padres','Phillies','Pirates','Rangers','Rays','Red Sox','Reds','Rockies','Royals','Tigers','Twins','White Sox','Yankees'],
  nba: ['76ers','Bucks','Bulls','Cavaliers','Celtics','Clippers','Grizzlies','Hawks','Heat','Hornets','Jazz','Kings','Knicks','Lakers','Magic','Mavericks','Nets','Nuggets','Pacers','Pelicans','Pistons','Raptors','Rockets','Spurs','Suns','Thunder','Timberwolves','Trail Blazers','Warriors','Wizards'],
  nhl: ['Blackhawks','Blue Jackets','Blues','Bruins','Canucks','Capitals','Devils','Ducks','Flames','Flyers','Golden Knights','Hurricanes','Islanders','Jets','Kings','Kraken','Lightning','Maple Leafs','Oilers','Panthers','Penguins','Predators','Rangers','Red Wings','Sabres','Senators','Sharks','Stars','Wild'],
  cfb: ['Alabama','Arkansas','Auburn','Baylor','BYU','Clemson','Colorado','Duke','Florida','Florida St.','Georgia','Georgia Tech','Houston','Illinois','Indiana','Iowa','Iowa St.','Kansas','Kansas St.','Kentucky','LSU','Louisville','Maryland','Miami','Michigan','Michigan St.','Minnesota','Mississippi St.','Missouri','Nebraska','North Carolina','North Carolina St.','Northwestern','Notre Dame','Ohio State','Oklahoma','Oklahoma St.','Ole Miss','Oregon','Oregon St.','Penn State','Pittsburgh','Purdue','Rutgers','SMU','South Carolina','Stanford','Syracuse','TCU','Tennessee','Texas','Texas A&M','Texas Tech','UCLA','USC','Utah','Vanderbilt','Virginia','Virginia Tech','Wake Forest','Washington','Washington St.','West Virginia','Wisconsin'],
  mcbb: ['Alabama','Arizona','Arizona St.','Arkansas','Auburn','Baylor','BYU','Cincinnati','Clemson','Colorado','Connecticut','Duke','Florida','Florida St.','Gonzaga','Georgia','Georgia Tech','Houston','Illinois','Indiana','Iowa','Iowa St.','Kansas','Kansas St.','Kentucky','Louisville','LSU','Marquette','Maryland','Memphis','Michigan','Michigan St.','Minnesota','Missouri','North Carolina','North Carolina St.','Northwestern','Notre Dame','Ohio State','Oklahoma','Oklahoma St.','Oregon','Penn State','Pittsburgh','Purdue','Rutgers','San Diego St.','South Carolina','Stanford','Syracuse','TCU','Tennessee','Texas','Texas A&M','Texas Tech','UCLA','USC','Utah','Vanderbilt','Villanova','Virginia','Virginia Tech','Wake Forest','Washington','West Virginia','Wisconsin','Xavier'],
  wcbb: ['Baylor','Connecticut','Duke','Florida St.','Georgia','Iowa','Iowa St.','LSU','Louisville','Maryland','Michigan','NC State','North Carolina','Notre Dame','Ohio State','Oklahoma','Oregon','South Carolina','Stanford','Tennessee','Texas','Texas A&M','UCLA','USC','Utah','Virginia Tech','Washington','Wisconsin'],
  mls: ['Atlanta United','Austin FC','Charlotte FC','Chicago Fire','Colorado Rapids','Columbus Crew','D.C. United','FC Dallas','Inter Miami','LA Galaxy','LAFC','Minnesota United','Nashville SC','New England Revolution','NYCFC','NY Red Bulls','Orlando City','Philadelphia Union','Portland Timbers','Real Salt Lake','San Jose Earthquakes','Seattle Sounders','Sporting KC','St. Louis City','Toronto FC','Vancouver Whitecaps'],
  nwsl: ['Angel City','Bay FC','Chicago Red Stars','Houston Dash','Kansas City Current','NJ/NY Gotham','North Carolina Courage','Orlando Pride','Portland Thorns','Racing Louisville','San Diego Wave','Seattle Reign','Utah Royals','Washington Spirit'],
  wnba: ['Aces','Dream','Fever','Liberty','Lynx','Mercury','Mystics','Sky','Sparks','Storm','Sun','Wings'],
}

const LABELS = { nfl:'NFL', mlb:'MLB', nba:'NBA', nhl:'NHL', cfb:'College Football', mcbb:"Men's CBB", wcbb:"Women's CBB", mls:'MLS', nwsl:'NWSL', wnba:'WNBA' }

const TEAM_COLORS = {
  '49ers':'#AA0000',Bears:'#0B162A',Bengals:'#FB4F14',Bills:'#00338D',Broncos:'#FB4F14',
  Browns:'#311D00',Buccaneers:'#D50A0A',Cardinals:'#97233F',Chargers:'#0080C6',
  Chiefs:'#E31837',Colts:'#002C5F',Cowboys:'#003594',Dolphins:'#008E97',Eagles:'#004C54',
  Falcons:'#A71930',Giants:'#0B2265',Jaguars:'#006778',Jets:'#125740',Lions:'#0076B6',
  Packers:'#203731',Panthers:'#0085CA',Patriots:'#002244',Raiders:'#000000',Rams:'#003594',
  Ravens:'#241773',Saints:'#9B8A5A',Seahawks:'#002244',Steelers:'#101820',Texans:'#03202F',
  Titans:'#0C2340',Vikings:'#4F2683',Washington:'#773141',
  Angels:'#BA0021',Astros:'#EB6E1F',Athletics:'#003831','Blue Jays':'#134A8E',Braves:'#CE1141',
  Brewers:'#FFC52F',Cardinals:'#C41E3A',Cubs:'#0E3386',Dodgers:'#005A9C',
  Giants:'#FD5A1E',Guardians:'#E31937',Mariners:'#0C2C56',Mets:'#002D72',Nationals:'#AB0003',
  Orioles:'#DF4601',Padres:'#2F241D',Phillies:'#E81828',Pirates:'#27251F',Rangers:'#003278',
  Rays:'#092C5C','Red Sox':'#BD3039',Reds:'#C6011F',Rockies:'#33006F',Royals:'#004687',
  Tigers:'#0C2340',Twins:'#002B5C','White Sox':'#27251F',Yankees:'#003087',
  '76ers':'#006BB6',Bucks:'#00471B',Bulls:'#CE1141',Cavaliers:'#860038',Celtics:'#007A33',
  Clippers:'#C8102E',Grizzlies:'#5D76A9',Hawks:'#E03A3E',Heat:'#98002E',Hornets:'#1D1160',
  Jazz:'#002B5C',Kings:'#5A2D81',Knicks:'#006BB6',Lakers:'#552583',Magic:'#0077C0',
  Mavericks:'#00538C',Nets:'#000000',Nuggets:'#0E2240',Pacers:'#002D62',Pelicans:'#0C2340',
  Pistons:'#C8102E',Raptors:'#CE1141',Rockets:'#CE1141',Spurs:'#C4CED4',Suns:'#1D1160',
  Thunder:'#007AC1',Timberwolves:'#0C2340','Trail Blazers':'#E03A3E',Warriors:'#1D428A',Wizards:'#002B5C',
  Blackhawks:'#CF0A2C','Blue Jackets':'#002654',Blues:'#002F87',Bruins:'#FCB514',
  Canucks:'#00843D',Capitals:'#041E42',Devils:'#CE1126',Ducks:'#F47A38',Flames:'#C8102E',
  Flyers:'#F74902','Golden Knights':'#B4975A',Hurricanes:'#CC0000',Islanders:'#00539B',
  Kings:'#111111',Kraken:'#001628',Lightning:'#002868','Maple Leafs':'#00205B',
  Oilers:'#FF4C00',Panthers:'#C8102E',Penguins:'#CFC493',Predators:'#FFB81C',
  Rangers:'#0038A8','Red Wings':'#CE1126',Sabres:'#003087',Senators:'#C8102E',
  Sharks:'#006D75',Stars:'#006847',Wild:'#154734',
  Aces:'#000000',Dream:'#C8102E',Fever:'#FFC72C',Liberty:'#6ECEB2',Lynx:'#236192',
  Mercury:'#CB6015',Mystics:'#002B5C',Sky:'#418FDE',Sparks:'#702F8A',Storm:'#2C5234',
  Sun:'#F05023',Wings:'#C4D600',
  'Angel City':'#1B0C3A','Bay FC':'#1D4289','Chicago Red Stars':'#CB333B',
  'Houston Dash':'#F4911E','Kansas City Current':'#00529B','NJ/NY Gotham':'#1A1A1A',
  'North Carolina Courage':'#CE1126','Orlando Pride':'#633492','Portland Thorns':'#A40A14',
  'Racing Louisville':'#01426A','San Diego Wave':'#F7A800','Seattle Reign':'#005695',
  'Utah Royals':'#7B2D8B','Washington Spirit':'#003865',
}

const TEAM_TRICODES = {
  '49ers':'SF',Bears:'CHI',Bengals:'CIN',Bills:'BUF',Broncos:'DEN',Browns:'CLE',
  Buccaneers:'TB',Cardinals:'ARI',Chargers:'LAC',Chiefs:'KC',Colts:'IND',
  Cowboys:'DAL',Dolphins:'MIA',Eagles:'PHI',Falcons:'ATL',Giants:'NYG',
  Jaguars:'JAX',Jets:'NYJ',Lions:'DET',Packers:'GB',Panthers:'CAR',
  Patriots:'NE',Raiders:'LV',Rams:'LAR',Ravens:'BAL',Saints:'NO',
  Seahawks:'SEA',Steelers:'PIT',Texans:'HOU',Titans:'TEN',Vikings:'MIN',Washington:'WAS',
  Angels:'LAA',Astros:'HOU',Athletics:'OAK','Blue Jays':'TOR',Braves:'ATL',
  Brewers:'MIL',Cardinals:'STL',Cubs:'CHC',Dodgers:'LAD',Giants:'SF',
  Guardians:'CLE',Mariners:'SEA',Mets:'NYM',Nationals:'WSH',Orioles:'BAL',
  Padres:'SD',Phillies:'PHI',Pirates:'PIT',Rangers:'TEX',Rays:'TB',
  'Red Sox':'BOS',Reds:'CIN',Rockies:'COL',Royals:'KC',Tigers:'DET',
  Twins:'MIN','White Sox':'CWS',Yankees:'NYY',
  '76ers':'PHI',Bucks:'MIL',Bulls:'CHI',Cavaliers:'CLE',Celtics:'BOS',
  Clippers:'LAC',Grizzlies:'MEM',Hawks:'ATL',Heat:'MIA',Hornets:'CHA',
  Jazz:'UTA',Kings:'SAC',Knicks:'NYK',Lakers:'LAL',Magic:'ORL',
  Mavericks:'DAL',Nets:'BKN',Nuggets:'DEN',Pacers:'IND',Pelicans:'NO',
  Pistons:'DET',Raptors:'TOR',Rockets:'HOU',Spurs:'SA',Suns:'PHX',
  Thunder:'OKC',Timberwolves:'MIN','Trail Blazers':'POR',Warriors:'GS',Wizards:'WAS',
  Blackhawks:'CHI','Blue Jackets':'CBJ',Blues:'STL',Bruins:'BOS',Canucks:'VAN',
  Capitals:'WSH',Devils:'NJ',Ducks:'ANA',Flames:'CGY',Flyers:'PHI',
  'Golden Knights':'VGK',Hurricanes:'CAR',Islanders:'NYI',Jets:'WPG',Kings:'LAK',
  Kraken:'SEA',Lightning:'TB','Maple Leafs':'TOR',Oilers:'EDM',Panthers:'FLA',
  Penguins:'PIT',Predators:'NSH',Rangers:'NYR','Red Wings':'DET',Sabres:'BUF',
  Senators:'OTT',Sharks:'SJ',Stars:'DAL',Wild:'MIN',
  Aces:'LV',Dream:'ATL',Fever:'IND',Liberty:'NY',Lynx:'MIN',Mercury:'PHX',
  Mystics:'WAS',Sky:'CHI',Sparks:'LA',Storm:'SEA',Sun:'CON',Wings:'DAL',
  'Angel City':'LA','Bay FC':'SJ','Chicago Red Stars':'CHI','Houston Dash':'HOU',
  'Kansas City Current':'KC','NJ/NY Gotham':'NY','North Carolina Courage':'NC',
  'Orlando Pride':'ORL','Portland Thorns':'POR','Racing Louisville':'LOU',
  'San Diego Wave':'SD','Seattle Reign':'SEA','Utah Royals':'UTA','Washington Spirit':'WAS',
}

const TEAM_CITIES = {
  '49ers':'San Francisco',Bears:'Chicago',Bengals:'Cincinnati',Bills:'Buffalo',
  Broncos:'Denver',Browns:'Cleveland',Buccaneers:'Tampa Bay',Cardinals:'Arizona',
  Chargers:'Los Angeles C',Chiefs:'Kansas City',Colts:'Indianapolis',Cowboys:'Dallas',
  Dolphins:'Miami',Eagles:'Philadelphia',Falcons:'Atlanta',Giants:'New York G',
  Jaguars:'Jacksonville',Jets:'New York J',Lions:'Detroit',Packers:'Green Bay',
  Panthers:'Carolina',Patriots:'New England',Raiders:'Las Vegas',Rams:'Los Angeles R',
  Ravens:'Baltimore',Saints:'New Orleans',Seahawks:'Seattle',Steelers:'Pittsburgh',
  Texans:'Houston',Titans:'Tennessee',Vikings:'Minnesota',Washington:'Washington',
  Angels:'Los Angeles A',Astros:'Houston',Athletics:'Oakland','Blue Jays':'Toronto',
  Braves:'Atlanta',Brewers:'Milwaukee',Cardinals:'St. Louis',Cubs:'Chicago C',
  Dodgers:'Los Angeles D',Giants:'San Francisco',Guardians:'Cleveland',Mariners:'Seattle',
  Mets:'New York M',Nationals:'Washington',Orioles:'Baltimore',Padres:'San Diego',
  Phillies:'Philadelphia',Pirates:'Pittsburgh',Rangers:'Texas',Rays:'Tampa Bay',
  'Red Sox':'Boston',Reds:'Cincinnati',Rockies:'Colorado',Royals:'Kansas City',
  Tigers:'Detroit',Twins:'Minnesota','White Sox':'Chicago W',Yankees:'New York Y',
  '76ers':'Philadelphia',Bucks:'Milwaukee',Bulls:'Chicago',Cavaliers:'Cleveland',
  Celtics:'Boston',Clippers:'Los Angeles C',Grizzlies:'Memphis',Hawks:'Atlanta',
  Heat:'Miami',Hornets:'Charlotte',Jazz:'Utah',Kings:'Sacramento',Knicks:'New York',
  Lakers:'Los Angeles L',Magic:'Orlando',Mavericks:'Dallas',Nets:'Brooklyn',
  Nuggets:'Denver',Pacers:'Indiana',Pelicans:'New Orleans',Pistons:'Detroit',
  Raptors:'Toronto',Rockets:'Houston',Spurs:'San Antonio',Suns:'Phoenix',
  Thunder:'Oklahoma City',Timberwolves:'Minnesota','Trail Blazers':'Portland',
  Warriors:'Golden State',Wizards:'Washington',
  Blackhawks:'Chicago','Blue Jackets':'Columbus',Blues:'St. Louis',Bruins:'Boston',
  Canucks:'Vancouver',Capitals:'Washington',Devils:'New Jersey',Ducks:'Anaheim',
  Flames:'Calgary',Flyers:'Philadelphia','Golden Knights':'Vegas',Hurricanes:'Carolina',
  Islanders:'New York',Jets:'Winnipeg',Kings:'Los Angeles',Kraken:'Seattle',
  Lightning:'Tampa Bay','Maple Leafs':'Toronto',Oilers:'Edmonton',Panthers:'Florida',
  Penguins:'Pittsburgh',Predators:'Nashville',Rangers:'New York R','Red Wings':'Detroit',
  Sabres:'Buffalo',Senators:'Ottawa',Sharks:'San Jose',Stars:'Dallas',Wild:'Minnesota',
  Aces:'Las Vegas',Dream:'Atlanta',Fever:'Indiana',Liberty:'New York',Lynx:'Minnesota',
  Mercury:'Phoenix',Mystics:'Washington',Sky:'Chicago',Sparks:'Los Angeles',
  Storm:'Seattle',Sun:'Connecticut',Wings:'Dallas',
  'Atlanta United':'Atlanta','Austin FC':'Austin','Charlotte FC':'Charlotte',
  'Chicago Fire':'Chicago','Colorado Rapids':'Denver','Columbus Crew':'Columbus',
  'D.C. United':'Washington','FC Dallas':'Dallas','Inter Miami':'Miami',
  'LA Galaxy':'Los Angeles G','LAFC':'Los Angeles L','Minnesota United':'Minneapolis',
  'Nashville SC':'Nashville','New England Revolution':'Boston','NYCFC':'New York C',
  'NY Red Bulls':'New York R','Orlando City':'Orlando','Philadelphia Union':'Philadelphia',
  'Portland Timbers':'Portland','Real Salt Lake':'Salt Lake City',
  'San Jose Earthquakes':'San Jose','Seattle Sounders':'Seattle',
  'Sporting KC':'Kansas City','St. Louis City':'St. Louis',
  'Toronto FC':'Toronto','Vancouver Whitecaps':'Vancouver',
  'Angel City':'Los Angeles','Bay FC':'San Jose','Chicago Red Stars':'Chicago',
  'Houston Dash':'Houston','Kansas City Current':'Kansas City',
  'NJ/NY Gotham':'New York','North Carolina Courage':'Raleigh',
  'Orlando Pride':'Orlando','Portland Thorns':'Portland',
  'Racing Louisville':'Louisville','San Diego Wave':'San Diego',
  'Seattle Reign':'Seattle','Utah Royals':'Salt Lake City','Washington Spirit':'Washington',
}

export default function StepTeams({ leagues, selected, setSelected, onBack, onNext }) {
  const teamLeagues = leagues.filter(k => TEAM_SPORTS.includes(k))
  const [activeTab, setActiveTab] = useState(teamLeagues[0] || '')
  const [visitedTabs, setVisitedTabs] = useState(new Set([teamLeagues[0] || '']))

  if (teamLeagues.length === 0) { onNext(); return null }

  function toggle(league, name) {
    const id = `${league}:${name}`
    setSelected(prev =>
      prev.find(t => t.id === id)
        ? prev.filter(t => t.id !== id)
        : [...prev, { id, league, name }]
    )
  }

  function isSelected(league, name) {
    return selected.some(t => t.id === `${league}:${name}`)
  }

  function switchTab(k) {
    setActiveTab(k)
    setVisitedTabs(prev => new Set([...prev, k]))
  }

  const allTabsVisited = teamLeagues.every(k => visitedTabs.has(k))
  const isCollege = ['cfb', 'mcbb', 'wcbb'].includes(activeTab)

  const teams = [...(TEAMS[activeTab] || [])].sort((a, b) => {
    const ca = isCollege ? a : (TEAM_CITIES[a] || a)
    const cb = isCollege ? b : (TEAM_CITIES[b] || b)
    return ca.localeCompare(cb)
  })

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Pick your teams</h1>
        <p className={styles.sub}>Choose teams to follow for away games. Browse all tabs before continuing.</p>
      </div>

      <div className={styles.tabs}>
        {teamLeagues.map(k => (
          <div
            key={k}
            className={`${styles.tab} ${activeTab === k ? styles.tabActive : ''}`}
            onClick={() => switchTab(k)}
            style={{ position: 'relative' }}
          >
            {LABELS[k]}
            {!visitedTabs.has(k) && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--orange)', display: 'block'
              }} />
            )}
          </div>
        ))}
      </div>

      {!allTabsVisited && (
        <div style={{ fontSize: 11, color: 'var(--orange)', marginBottom: 8, fontWeight: 600 }}>
          💡 Tap each tab to browse all your leagues before continuing
        </div>
      )}

      <div className={styles.teamGrid}>
        {teams.map(name => {
          const sel = isSelected(activeTab, name)
          const color = TEAM_COLORS[name] || '#1a1a1a'
          const tricodeKey = `${activeTab}:${name}`
const tricode = ({
  'mlb:Rangers': 'TEX',
  'nhl:Rangers': 'NYR',
  'mlb:Cardinals': 'STL',
  'nfl:Cardinals': 'ARI',
  'nfl:Giants': 'NYG',
  'mlb:Giants': 'SF',
  'nba:Kings': 'SAC',
  'nhl:Kings': 'LAK',
  'nhl:Jets': 'WPG',
  'nfl:Jets': 'NYJ',
  'nfl:Panthers': 'CAR',
  'nhl:Panthers': 'FLA',
})[tricodeKey] || TEAM_TRICODES[name] || name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
          return (
            <div
              key={name}
              className={`${styles.teamCard} ${sel ? styles.sel : ''}`}
              onClick={() => toggle(activeTab, name)}
            >
              <div className={styles.teamCircle} style={{ background: color }}>{tricode}</div>
              <div className={styles.teamName}>{name}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.count}><b>{selected.length}</b> teams</div>
        <button
          className={styles.nextBtn}
          onClick={onNext}
          disabled={!allTabsVisited}
          title={!allTabsVisited ? 'Please browse all league tabs first' : ''}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import styles from './Step.module.css'

const TEAM_SPORTS = ['nfl', 'mlb', 'nba', 'nhl', 'cfb', 'mcbb', 'wcbb', 'mls', 'wnba']

const TEAMS = {
  nfl: ['Bears','Bengals','Bills','Broncos','Browns','Buccaneers','Cardinals','Chargers','Chiefs','Colts','Cowboys','Dolphins','Eagles','Falcons','Giants','Jaguars','Jets','Lions','Packers','Panthers','Patriots','Raiders','Rams','Ravens','Saints','Seahawks','Steelers','Texans','Titans','Vikings','49ers','Washington'],
  mlb: ['Angels','Astros','Athletics','Blue Jays','Braves','Brewers','Cardinals','Cubs','Dodgers','Giants','Guardians','Mariners','Mets','Nationals','Orioles','Padres','Phillies','Pirates','Rangers','Rays','Red Sox','Reds','Rockies','Royals','Tigers','Twins','White Sox','Yankees'],
  nba: ['76ers','Bucks','Bulls','Cavaliers','Celtics','Clippers','Grizzlies','Hawks','Heat','Hornets','Jazz','Kings','Knicks','Lakers','Magic','Mavericks','Nets','Nuggets','Pacers','Pelicans','Pistons','Raptors','Rockets','Spurs','Suns','Thunder','Timberwolves','Trail Blazers','Warriors','Wizards'],
  nhl: ['Blackhawks','Blue Jackets','Blues','Bruins','Canucks','Capitals','Devils','Ducks','Flames','Flyers','Golden Knights','Hurricanes','Islanders','Jets','Kings','Kraken','Lightning','Maple Leafs','Oilers','Panthers','Penguins','Predators','Rangers','Red Wings','Sabres','Senators','Sharks','Stars','Wild'],
  cfb: ['Alabama','Arkansas','Auburn','Baylor','BYU','Clemson','Colorado','Duke','Florida','Florida St.','Georgia','Georgia Tech','Houston','Illinois','Indiana','Iowa','Iowa St.','Kansas','Kansas St.','Kentucky','LSU','Louisville','Maryland','Miami','Michigan','Michigan St.','Minnesota','Mississippi St.','Missouri','Nebraska','North Carolina','North Carolina St.','Northwestern','Notre Dame','Ohio State','Oklahoma','Oklahoma St.','Ole Miss','Oregon','Oregon St.','Penn State','Pittsburgh','Purdue','Rutgers','SMU','South Carolina','Stanford','Syracuse','TCU','Tennessee','Texas','Texas A&M','Texas Tech','UCLA','USC','Utah','Vanderbilt','Virginia','Virginia Tech','Wake Forest','Washington','Washington St.','West Virginia','Wisconsin'],
  mcbb: ['Alabama','Arizona','Arizona St.','Arkansas','Auburn','Baylor','BYU','Cincinnati','Clemson','Colorado','Connecticut','Duke','Florida','Florida St.','Gonzaga','Georgia','Georgia Tech','Houston','Illinois','Indiana','Iowa','Iowa St.','Kansas','Kansas St.','Kentucky','Louisville','LSU','Marquette','Maryland','Memphis','Michigan','Michigan St.','Minnesota','Missouri','North Carolina','North Carolina St.','Northwestern','Notre Dame','Ohio State','Oklahoma','Oklahoma St.','Oregon','Penn State','Pittsburgh','Purdue','Rutgers','San Diego St.','South Carolina','Stanford','Syracuse','TCU','Tennessee','Texas','Texas A&M','Texas Tech','UCLA','USC','Utah','Vanderbilt','Villanova','Virginia','Virginia Tech','Wake Forest','Washington','West Virginia','Wisconsin','Xavier'],
  wcbb: ['Baylor','Connecticut','Duke','Florida St.','Georgia','Iowa','Iowa St.','LSU','Louisville','Maryland','Michigan','NC State','North Carolina','Notre Dame','Ohio State','Oklahoma','Oregon','South Carolina','Stanford','Tennessee','Texas','Texas A&M','UCLA','USC','Utah','Virginia Tech','Washington','Wisconsin'],
  mls: ['Atlanta United','Austin FC','Charlotte FC','Chicago Fire','Colorado Rapids','Columbus Crew','D.C. United','FC Dallas','Inter Miami','LA Galaxy','LAFC','Minnesota United','Nashville SC','New England Revolution','NYCFC','NY Red Bulls','Orlando City','Philadelphia Union','Portland Timbers','Real Salt Lake','San Jose Earthquakes','Seattle Sounders','Sporting KC','St. Louis City','Toronto FC','Vancouver Whitecaps'],
  wnba: ['Aces','Dream','Fever','Liberty','Lynx','Mercury','Mystics','Sky','Sparks','Storm','Sun','Wings'],
}

const LABELS = { nfl:'NFL', mlb:'MLB', nba:'NBA', nhl:'NHL', cfb:'College Football', mcbb:"Men's CBB", wcbb:"Women's CBB", mls:'MLS', wnba:'WNBA' }

const TEAM_COLORS = {
  Bears:'#0B162A',Bengals:'#FB4F14',Bills:'#00338D',Broncos:'#FB4F14',Browns:'#311D00',
  Buccaneers:'#D50A0A',Cardinals:'#97233F',Chargers:'#0080C6',Chiefs:'#E31837',Colts:'#002C5F',
  Cowboys:'#003594',Dolphins:'#008E97',Eagles:'#004C54',Falcons:'#A71930',Giants:'#0B2265',
  Jaguars:'#006778',Jets:'#125740',Lions:'#0076B6',Packers:'#203731',Panthers:'#0085CA',
  Patriots:'#002244',Raiders:'#000000',Rams:'#003594',Ravens:'#241773',Saints:'#9B8A5A',
  Seahawks:'#002244',Steelers:'#101820',Texans:'#03202F',Titans:'#0C2340',Vikings:'#4F2683',
  '49ers':'#AA0000',Washington:'#5A1414',
  Angels:'#BA0021',Astros:'#EB6E1F',Athletics:'#003831','Blue Jays':'#134A8E',Braves:'#CE1141',
  Brewers:'#FFC52F',Cubs:'#0E3386',Dodgers:'#005A9C',Guardians:'#E31937',Mariners:'#0C2C56',
  Mets:'#002D72',Nationals:'#AB0003',Orioles:'#DF4601',Padres:'#2F241D',Phillies:'#E81828',
  Pirates:'#27251F',Rangers:'#003278',Rays:'#092C5C','Red Sox':'#BD3039',Reds:'#C6011F',
  Rockies:'#33006F',Royals:'#004687',Tigers:'#0C2340',Twins:'#002B5C','White Sox':'#27251F',
  Yankees:'#003087',
  '76ers':'#006BB6',Bucks:'#00471B',Bulls:'#CE1141',Cavaliers:'#860038',Celtics:'#007A33',
  Clippers:'#C8102E',Grizzlies:'#5D76A9',Hawks:'#E03A3E',Heat:'#98002E',Hornets:'#1D1160',
  Jazz:'#002B5C',Kings:'#5A2D81',Knicks:'#006BB6',Lakers:'#552583',Magic:'#0077C0',
  Mavericks:'#00538C',Nets:'#000000',Nuggets:'#0E2240',Pacers:'#002D62',Pelicans:'#0C2340',
  Pistons:'#C8102E',Raptors:'#CE1141',Rockets:'#CE1141',Spurs:'#C4CED4',Suns:'#1D1160',
  Thunder:'#007AC1',Timberwolves:'#0C2340','Trail Blazers':'#E03A3E',Warriors:'#1D428A',Wizards:'#002B5C',
  Blackhawks:'#CF0A2C','Blue Jackets':'#002654',Blues:'#002F87',Bruins:'#FCB514',Canucks:'#00843D',
  Capitals:'#041E42',Devils:'#CE1126',Ducks:'#F47A38',Flames:'#C8102E',Flyers:'#F74902',
  'Golden Knights':'#B4975A',Hurricanes:'#CC0000',Islanders:'#00539B',Kings:'#111111',
  Kraken:'#001628',Lightning:'#002868','Maple Leafs':'#00205B',Oilers:'#FF4C00',
  Penguins:'#CFC493',Predators:'#FFB81C',Rangers:'#0038A8','Red Wings':'#CE1126',
  Sabres:'#003087',Senators:'#C8102E',Sharks:'#006D75',Stars:'#006847',Wild:'#154734',
  Aces:'#000000',Dream:'#C8102E',Fever:'#FFC72C',Liberty:'#6ECEB2',Lynx:'#236192',
  Mercury:'#CB6015',Mystics:'#002B5C',Sky:'#418FDE',Sparks:'#702F8A',Storm:'#2C5234',
  Sun:'#F05023',Wings:'#C4D600',
}

export default function StepTeams({ leagues, selected, setSelected, onBack, onNext }) {
  const teamLeagues = leagues.filter(k => TEAM_SPORTS.includes(k))
  const [activeTab, setActiveTab] = useState(teamLeagues[0] || '')

  if (teamLeagues.length === 0) {
    onNext()
    return null
  }

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

  const teams = (TEAMS[activeTab] || []).sort((a, b) => a.localeCompare(b))

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Pick your teams</h1>
        <p className={styles.sub}>Choose teams to follow for away games.</p>
      </div>

      <div className={styles.tabs}>
        {teamLeagues.map(k => (
          <div
            key={k}
            className={`${styles.tab} ${activeTab === k ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(k)}
          >
            {LABELS[k]}
          </div>
        ))}
      </div>

      <div className={styles.teamGrid}>
        {teams.map(name => {
          const sel = isSelected(activeTab, name)
          const color = TEAM_COLORS[name] || '#333'
          const initials = name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
          return (
            <div
              key={name}
              className={`${styles.teamCard} ${sel ? styles.sel : ''}`}
              onClick={() => toggle(activeTab, name)}
            >
              <div className={styles.teamCircle} style={{ background: color }}>{initials}</div>
              <div className={styles.teamName}>{name}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <div className={styles.count}><b>{selected.length}</b> teams</div>
        <button className={styles.nextBtn} onClick={onNext}>Next →</button>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import styles from './Step.module.css'

const TEAM_SPORTS = ['nfl', 'mlb', 'nba', 'nhl', 'cfb', 'mcbb', 'wcbb', 'mls', 'nwsl', 'wnba']

// Each team: { short: display name, full: name saved to DB }
// For colleges, full is the same as short (matched smartly in backend)
const TEAMS = {
  nfl: [
    { short: '49ers', full: 'San Francisco 49ers' },
    { short: 'Bears', full: 'Chicago Bears' },
    { short: 'Bengals', full: 'Cincinnati Bengals' },
    { short: 'Bills', full: 'Buffalo Bills' },
    { short: 'Broncos', full: 'Denver Broncos' },
    { short: 'Browns', full: 'Cleveland Browns' },
    { short: 'Buccaneers', full: 'Tampa Bay Buccaneers' },
    { short: 'Cardinals', full: 'Arizona Cardinals' },
    { short: 'Chargers', full: 'Los Angeles Chargers' },
    { short: 'Chiefs', full: 'Kansas City Chiefs' },
    { short: 'Colts', full: 'Indianapolis Colts' },
    { short: 'Cowboys', full: 'Dallas Cowboys' },
    { short: 'Dolphins', full: 'Miami Dolphins' },
    { short: 'Eagles', full: 'Philadelphia Eagles' },
    { short: 'Falcons', full: 'Atlanta Falcons' },
    { short: 'Giants', full: 'New York Giants' },
    { short: 'Jaguars', full: 'Jacksonville Jaguars' },
    { short: 'Jets', full: 'New York Jets' },
    { short: 'Lions', full: 'Detroit Lions' },
    { short: 'Packers', full: 'Green Bay Packers' },
    { short: 'Panthers', full: 'Carolina Panthers' },
    { short: 'Patriots', full: 'New England Patriots' },
    { short: 'Raiders', full: 'Las Vegas Raiders' },
    { short: 'Rams', full: 'Los Angeles Rams' },
    { short: 'Ravens', full: 'Baltimore Ravens' },
    { short: 'Saints', full: 'New Orleans Saints' },
    { short: 'Seahawks', full: 'Seattle Seahawks' },
    { short: 'Steelers', full: 'Pittsburgh Steelers' },
    { short: 'Texans', full: 'Houston Texans' },
    { short: 'Titans', full: 'Tennessee Titans' },
    { short: 'Vikings', full: 'Minnesota Vikings' },
    { short: 'Washington', full: 'Washington Commanders' },
  ],
  mlb: [
    { short: 'Angels', full: 'Los Angeles Angels' },
    { short: 'Astros', full: 'Houston Astros' },
    { short: 'Athletics', full: 'Athletics' },
    { short: 'Blue Jays', full: 'Toronto Blue Jays' },
    { short: 'Braves', full: 'Atlanta Braves' },
    { short: 'Brewers', full: 'Milwaukee Brewers' },
    { short: 'Cardinals', full: 'St. Louis Cardinals' },
    { short: 'Cubs', full: 'Chicago Cubs' },
    { short: 'Diamondbacks', full: 'Arizona Diamondbacks' },
    { short: 'Dodgers', full: 'Los Angeles Dodgers' },
    { short: 'Giants', full: 'San Francisco Giants' },
    { short: 'Guardians', full: 'Cleveland Guardians' },
    { short: 'Mariners', full: 'Seattle Mariners' },
    { short: 'Marlins', full: 'Miami Marlins' },
    { short: 'Mets', full: 'New York Mets' },
    { short: 'Nationals', full: 'Washington Nationals' },
    { short: 'Orioles', full: 'Baltimore Orioles' },
    { short: 'Padres', full: 'San Diego Padres' },
    { short: 'Phillies', full: 'Philadelphia Phillies' },
    { short: 'Pirates', full: 'Pittsburgh Pirates' },
    { short: 'Rangers', full: 'Texas Rangers' },
    { short: 'Rays', full: 'Tampa Bay Rays' },
    { short: 'Red Sox', full: 'Boston Red Sox' },
    { short: 'Reds', full: 'Cincinnati Reds' },
    { short: 'Rockies', full: 'Colorado Rockies' },
    { short: 'Royals', full: 'Kansas City Royals' },
    { short: 'Tigers', full: 'Detroit Tigers' },
    { short: 'Twins', full: 'Minnesota Twins' },
    { short: 'White Sox', full: 'Chicago White Sox' },
    { short: 'Yankees', full: 'New York Yankees' },
  ],
  nba: [
    { short: '76ers', full: 'Philadelphia 76ers' },
    { short: 'Bucks', full: 'Milwaukee Bucks' },
    { short: 'Bulls', full: 'Chicago Bulls' },
    { short: 'Cavaliers', full: 'Cleveland Cavaliers' },
    { short: 'Celtics', full: 'Boston Celtics' },
    { short: 'Clippers', full: 'LA Clippers' },
    { short: 'Grizzlies', full: 'Memphis Grizzlies' },
    { short: 'Hawks', full: 'Atlanta Hawks' },
    { short: 'Heat', full: 'Miami Heat' },
    { short: 'Hornets', full: 'Charlotte Hornets' },
    { short: 'Jazz', full: 'Utah Jazz' },
    { short: 'Kings', full: 'Sacramento Kings' },
    { short: 'Knicks', full: 'New York Knicks' },
    { short: 'Lakers', full: 'Los Angeles Lakers' },
    { short: 'Magic', full: 'Orlando Magic' },
    { short: 'Mavericks', full: 'Dallas Mavericks' },
    { short: 'Nets', full: 'Brooklyn Nets' },
    { short: 'Nuggets', full: 'Denver Nuggets' },
    { short: 'Pacers', full: 'Indiana Pacers' },
    { short: 'Pelicans', full: 'New Orleans Pelicans' },
    { short: 'Pistons', full: 'Detroit Pistons' },
    { short: 'Raptors', full: 'Toronto Raptors' },
    { short: 'Rockets', full: 'Houston Rockets' },
    { short: 'Spurs', full: 'San Antonio Spurs' },
    { short: 'Suns', full: 'Phoenix Suns' },
    { short: 'Thunder', full: 'Oklahoma City Thunder' },
    { short: 'Timberwolves', full: 'Minnesota Timberwolves' },
    { short: 'Trail Blazers', full: 'Portland Trail Blazers' },
    { short: 'Warriors', full: 'Golden State Warriors' },
    { short: 'Wizards', full: 'Washington Wizards' },
  ],
  nhl: [
    { short: 'Blackhawks', full: 'Chicago Blackhawks' },
    { short: 'Blue Jackets', full: 'Columbus Blue Jackets' },
    { short: 'Blues', full: 'St. Louis Blues' },
    { short: 'Bruins', full: 'Boston Bruins' },
    { short: 'Canucks', full: 'Vancouver Canucks' },
    { short: 'Capitals', full: 'Washington Capitals' },
    { short: 'Devils', full: 'New Jersey Devils' },
    { short: 'Ducks', full: 'Anaheim Ducks' },
    { short: 'Flames', full: 'Calgary Flames' },
    { short: 'Flyers', full: 'Philadelphia Flyers' },
    { short: 'Golden Knights', full: 'Vegas Golden Knights' },
    { short: 'Hurricanes', full: 'Carolina Hurricanes' },
    { short: 'Islanders', full: 'New York Islanders' },
    { short: 'Jets', full: 'Winnipeg Jets' },
    { short: 'Kings', full: 'Los Angeles Kings' },
    { short: 'Kraken', full: 'Seattle Kraken' },
    { short: 'Lightning', full: 'Tampa Bay Lightning' },
    { short: 'Mammoth', full: 'Utah Mammoth' },
    { short: 'Maple Leafs', full: 'Toronto Maple Leafs' },
    { short: 'Oilers', full: 'Edmonton Oilers' },
    { short: 'Panthers', full: 'Florida Panthers' },
    { short: 'Penguins', full: 'Pittsburgh Penguins' },
    { short: 'Predators', full: 'Nashville Predators' },
    { short: 'Rangers', full: 'New York Rangers' },
    { short: 'Red Wings', full: 'Detroit Red Wings' },
    { short: 'Sabres', full: 'Buffalo Sabres' },
    { short: 'Senators', full: 'Ottawa Senators' },
    { short: 'Sharks', full: 'San Jose Sharks' },
    { short: 'Stars', full: 'Dallas Stars' },
    { short: 'Wild', full: 'Minnesota Wild' },
  ],
  cfb: ['Air Force','Akron','Alabama','Appalachian State','Arizona','Arizona St.','Arkansas','Arkansas St.','Army','Auburn','Ball State','Baylor','Boise St.','Boston College','Bowling Green','Buffalo','BYU','California','Central Michigan','Charlotte','Cincinnati','Clemson','Coastal Carolina','Colorado','Colorado St.','Connecticut','Delaware','Duke','East Carolina','Eastern Michigan','Florida','Florida Atlantic','Florida International','Florida St.','Fresno St.','Georgia','Georgia Southern','Georgia St.','Georgia Tech','Hawaii','Houston','Illinois','Indiana','Iowa','Iowa St.','Jacksonville St.','James Madison','Kansas','Kansas St.','Kennesaw St.','Kent State','Kentucky','Liberty','Louisiana','Louisiana Monroe','Louisiana Tech','Louisville','LSU','Marshall','Maryland','Memphis','Miami','Miami (OH)','Michigan','Michigan St.','Middle Tennessee','Minnesota','Mississippi St.','Missouri','Missouri St.','Navy','NC State','Nebraska','Nevada','New Mexico','New Mexico St.','North Carolina','North Texas','Northern Illinois','Northwestern','Notre Dame','Ohio','Ohio State','Oklahoma','Oklahoma St.','Ole Miss','Old Dominion','Oregon','Oregon St.','Penn State','Pittsburgh','Purdue','Rice','Rutgers','Sam Houston','San Diego St.','San José St.','SMU','South Alabama','South Carolina','South Florida','Southern Miss','Stanford','Syracuse','TCU','Temple','Tennessee','Texas','Texas A&M','Texas State','Texas Tech','Toledo','Troy','Tulane','Tulsa','UAB','UCF','UCLA','UMass','UNLV','USC','UTEP','UTSA','Utah','Utah State','Vanderbilt','Virginia','Virginia Tech','Wake Forest','Washington','Washington St.','West Virginia','Western Kentucky','Western Michigan','Wisconsin','Wyoming'].map(n => ({ short: n, full: n })),
  mcbb: ['Alabama','Arizona','Arizona St.','Arkansas','Auburn','Baylor','Boise St.','Boston College','BYU','California','Charleston','Cincinnati','Clemson','Colorado','Colorado St.','Connecticut','Creighton','Dayton','DePaul','Drake','Duke','Florida','Florida Atlantic','Florida St.','Fordham','Georgetown','Georgia','Georgia Tech','Gonzaga','Grand Canyon','Hofstra','Houston','Illinois','Indiana','Iona','Iowa','Iowa St.','Kansas','Kansas St.','Kent State','Kentucky','Louisville','Loyola Chicago','LSU','Marquette','Maryland','Memphis','Miami','Michigan','Michigan St.','Minnesota','Mississippi St.','Missouri','Murray St.','Nebraska','Nevada','New Mexico','North Carolina','NC State','North Texas','Northwestern','Notre Dame','Ohio State','Oklahoma','Oklahoma St.','Ole Miss','Oregon','Penn State','Pittsburgh','Princeton','Providence','Purdue','Richmond','Rutgers','Saint Joseph’s','Saint Louis','Saint Mary’s','Samford','San Diego St.','San Francisco','Seton Hall','SMU','South Carolina','Stanford','Syracuse','TCU','Temple','Tennessee','Texas','Texas A&M','Texas Tech','UAB','UCF','UCLA','UNLV','USC','Utah','Utah St.','Vanderbilt','VCU','Vermont','Villanova','Virginia','Virginia Tech','Wake Forest','Washington','Washington St.','West Virginia','Wichita St.','Wisconsin','Wofford','Wyoming','Xavier','Yale'].map(n => ({ short: n, full: n })),
  wcbb: ['Alabama','Arizona','Arkansas','Auburn','Baylor','Belmont','Boston College','BYU','California','Cincinnati','Clemson','Colorado','Columbia','Connecticut','Creighton','Dayton','DePaul','Drake','Duke','East Carolina','Florida','Florida Atlantic','Florida Gulf Coast','Florida St.','Fordham','Georgetown','Georgia','Georgia Tech','Gonzaga','Harvard','Houston','Illinois','Illinois St.','Indiana','Iowa','Iowa St.','Kansas','Kansas St.','Kentucky','Liberty','Louisville','LSU','Marquette','Maryland','Memphis','Miami','Michigan','Michigan St.','Middle Tennessee','Minnesota','Mississippi St.','Missouri','Missouri St.','Nebraska','New Mexico','North Carolina','NC State','Northwestern','Notre Dame','Ohio State','Oklahoma','Oklahoma St.','Ole Miss','Oregon','Penn State','Pittsburgh','Princeton','Purdue','Richmond','Rutgers','South Carolina','South Dakota St.','South Florida','Stanford','Syracuse','TCU','Tennessee','Texas','Texas A&M','Texas Tech','UCF','UCLA','USC','Utah','Vanderbilt','Vermont','Villanova','Virginia','Virginia Tech','Wake Forest','Washington','Washington St.','West Virginia','Wisconsin','Xavier'].map(n => ({ short: n, full: n })),
  mls: [
    { short: 'Atlanta United', full: 'Atlanta United FC' },
    { short: 'Austin FC', full: 'Austin FC' },
    { short: 'CF Montréal', full: 'CF Montréal' },
    { short: 'Charlotte FC', full: 'Charlotte FC' },
    { short: 'Chicago Fire', full: 'Chicago Fire FC' },
    { short: 'Colorado Rapids', full: 'Colorado Rapids' },
    { short: 'Columbus Crew', full: 'Columbus Crew' },
    { short: 'D.C. United', full: 'D.C. United' },
    { short: 'FC Cincinnati', full: 'FC Cincinnati' },
    { short: 'FC Dallas', full: 'FC Dallas' },
    { short: 'Houston Dynamo', full: 'Houston Dynamo FC' },
    { short: 'Inter Miami', full: 'Inter Miami CF' },
    { short: 'LA Galaxy', full: 'LA Galaxy' },
    { short: 'LAFC', full: 'LAFC' },
    { short: 'Minnesota United', full: 'Minnesota United FC' },
    { short: 'Nashville SC', full: 'Nashville SC' },
    { short: 'New England Revolution', full: 'New England Revolution' },
    { short: 'NYCFC', full: 'New York City FC' },
    { short: 'NY Red Bulls', full: 'Red Bull New York' },
    { short: 'Orlando City', full: 'Orlando City SC' },
    { short: 'Philadelphia Union', full: 'Philadelphia Union' },
    { short: 'Portland Timbers', full: 'Portland Timbers' },
    { short: 'Real Salt Lake', full: 'Real Salt Lake' },
    { short: 'San Diego FC', full: 'San Diego FC' },
    { short: 'San Jose Earthquakes', full: 'San Jose Earthquakes' },
    { short: 'Seattle Sounders', full: 'Seattle Sounders FC' },
    { short: 'Sporting KC', full: 'Sporting Kansas City' },
    { short: 'St. Louis City', full: 'St. Louis CITY SC' },
    { short: 'Toronto FC', full: 'Toronto FC' },
    { short: 'Vancouver Whitecaps', full: 'Vancouver Whitecaps' },
  ],
  nwsl: [
    { short: 'Angel City', full: 'Angel City FC' },
    { short: 'Bay FC', full: 'Bay FC' },
    { short: 'Boston Legacy', full: 'Boston Legacy FC' },
    { short: 'Chicago Stars', full: 'Chicago Stars FC' },
    { short: 'Denver Summit', full: 'Denver Summit FC' },
    { short: 'Houston Dash', full: 'Houston Dash' },
    { short: 'Kansas City Current', full: 'Kansas City Current' },
    { short: 'NJ/NY Gotham', full: 'Gotham FC' },
    { short: 'North Carolina Courage', full: 'North Carolina Courage' },
    { short: 'Orlando Pride', full: 'Orlando Pride' },
    { short: 'Portland Thorns', full: 'Portland Thorns FC' },
    { short: 'Racing Louisville', full: 'Racing Louisville FC' },
    { short: 'San Diego Wave', full: 'San Diego Wave FC' },
    { short: 'Seattle Reign', full: 'Seattle Reign FC' },
    { short: 'Utah Royals', full: 'Utah Royals' },
    { short: 'Washington Spirit', full: 'Washington Spirit' },
  ],
  wnba: [
    { short: 'Aces', full: 'Las Vegas Aces' },
    { short: 'Dream', full: 'Atlanta Dream' },
    { short: 'Fever', full: 'Indiana Fever' },
    { short: 'Liberty', full: 'New York Liberty' },
    { short: 'Lynx', full: 'Minnesota Lynx' },
    { short: 'Mercury', full: 'Phoenix Mercury' },
    { short: 'Mystics', full: 'Washington Mystics' },
    { short: 'Sky', full: 'Chicago Sky' },
    { short: 'Sparks', full: 'Los Angeles Sparks' },
    { short: 'Storm', full: 'Seattle Storm' },
    { short: 'Sun', full: 'Connecticut Sun' },
    { short: 'Valkyries', full: 'Golden State Valkyries' },
    { short: 'Wings', full: 'Dallas Wings' },
  ],
}

const LABELS = { nfl:'NFL', mlb:'MLB', nba:'NBA', nhl:'NHL', cfb:'College Football', mcbb:"Men's CBB", wcbb:"Women's CBB", mls:'MLS', nwsl:'NWSL', wnba:'WNBA' }

const TEAM_COLORS = {
  'nfl:Cardinals':'#97233F',
  'mlb:Cardinals':'#C41E3A',
  'nfl:Giants':'#0B2265',
  'mlb:Giants':'#FD5A1E',
  'mlb:Rangers':'#003278',
  'nhl:Rangers':'#0038A8',
  'nba:Kings':'#5A2D81',
  'nhl:Kings':'#111111',
  'nfl:Jets':'#125740',
  'nhl:Jets':'#041E42',
  'nfl:Panthers':'#0085CA',
  'nhl:Panthers':'#C8102E',
  '49ers':'#AA0000',Bears:'#0B162A',Bengals:'#FB4F14',Bills:'#00338D',Broncos:'#FB4F14',
  Browns:'#311D00',Buccaneers:'#D50A0A',Cardinals:'#97233F',Chargers:'#0080C6',
  Chiefs:'#E31837',Colts:'#002C5F',Cowboys:'#003594',Dolphins:'#008E97',Eagles:'#004C54',
  Falcons:'#A71930',Giants:'#0B2265',Jaguars:'#006778',Jets:'#125740',Lions:'#0076B6',
  Packers:'#203731',Panthers:'#0085CA',Patriots:'#002244',Raiders:'#000000',Rams:'#003594',
  Ravens:'#241773',Saints:'#9B8A5A',Seahawks:'#002244',Steelers:'#101820',Texans:'#03202F',
  Titans:'#0C2340',Vikings:'#4F2683',Washington:'#773141',
  Angels:'#BA0021',Astros:'#EB6E1F',Athletics:'#003831','Blue Jays':'#134A8E',Braves:'#CE1141',
  Brewers:'#FFC52F',Cubs:'#0E3386',Diamondbacks:'#A71930',Dodgers:'#005A9C',
  Guardians:'#E31937',Mariners:'#0C2C56',Marlins:'#00A3E0',Mets:'#002D72',Nationals:'#AB0003',
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
  Kings:'#111111',Kraken:'#001628',Lightning:'#002868',Mammoth:'#69B3E7','Maple Leafs':'#00205B',
  Oilers:'#FF4C00',Panthers:'#C8102E',Penguins:'#CFC493',Predators:'#FFB81C',
  Rangers:'#0038A8','Red Wings':'#CE1126',Sabres:'#003087',Senators:'#C8102E',
  Sharks:'#006D75',Stars:'#006847',Wild:'#154734',
  Aces:'#000000',Dream:'#C8102E',Fever:'#FFC72C',Liberty:'#6ECEB2',Lynx:'#236192',
  Mercury:'#CB6015',Mystics:'#002B5C',Sky:'#418FDE',Sparks:'#702F8A',Storm:'#2C5234',
  Sun:'#F05023',Valkyries:'#005FA0',Wings:'#C4D600',
  'Angel City':'#1B0C3A','Bay FC':'#1D4289','Boston Legacy':'#0B2545','Chicago Stars':'#CB333B',
  'Denver Summit':'#FCC10F','Houston Dash':'#F4911E','Kansas City Current':'#00529B','NJ/NY Gotham':'#1A1A1A',
  'North Carolina Courage':'#CE1126','Orlando Pride':'#633492','Portland Thorns':'#A40A14',
  'Racing Louisville':'#01426A','San Diego Wave':'#F7A800','Seattle Reign':'#005695',
  'Utah Royals':'#7B2D8B','Washington Spirit':'#003865',
  'Atlanta United':'#80000A','Austin FC':'#00B140','CF Montréal':'#0033A0','Charlotte FC':'#1A85C8',
  'Chicago Fire':'#9A1B2E','Colorado Rapids':'#862633','Columbus Crew':'#FEDD00',
  'D.C. United':'#000000','FC Cincinnati':'#003594','FC Dallas':'#BF1B23','Houston Dynamo':'#F5631A',
  'Inter Miami':'#F7B5CD','LA Galaxy':'#00245D',
  'LAFC':'#C39E6D','Minnesota United':'#8CD2F4','Nashville SC':'#ECE83A',
  'New England Revolution':'#0A2141','NYCFC':'#6CACE4','NY Red Bulls':'#ED1E36',
  'Orlando City':'#633492','Philadelphia Union':'#071B2C','Portland Timbers':'#004812',
  'Real Salt Lake':'#B30838','San Diego FC':'#00245D','San Jose Earthquakes':'#0D4C92',
  'Seattle Sounders':'#5D9741','Sporting KC':'#002F65','St. Louis City':'#DC1B34',
  'Toronto FC':'#B81137','Vancouver Whitecaps':'#009BC8',
}

const TEAM_TRICODES = {
  '49ers':'SF',Bears:'CHI',Bengals:'CIN',Bills:'BUF',Broncos:'DEN',Browns:'CLE',
  Buccaneers:'TB',Cardinals:'ARI',Chargers:'LAC',Chiefs:'KC',Colts:'IND',
  Cowboys:'DAL',Dolphins:'MIA',Eagles:'PHI',Falcons:'ATL',Giants:'NYG',
  Jaguars:'JAX',Jets:'NYJ',Lions:'DET',Packers:'GB',Panthers:'CAR',
  Patriots:'NE',Raiders:'LV',Rams:'LAR',Ravens:'BAL',Saints:'NO',
  Seahawks:'SEA',Steelers:'PIT',Texans:'HOU',Titans:'TEN',Vikings:'MIN',Washington:'WAS',
  Angels:'LAA',Astros:'HOU',Athletics:'OAK','Blue Jays':'TOR',Braves:'ATL',
  Brewers:'MIL',Cubs:'CHC',Diamondbacks:'ARI',Dodgers:'LAD',
  Guardians:'CLE',Mariners:'SEA',Marlins:'MIA',Mets:'NYM',Nationals:'WSH',Orioles:'BAL',
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
  'Golden Knights':'VGK',Hurricanes:'CAR',Islanders:'NYI',Kraken:'SEA',Lightning:'TB',
  Mammoth:'UTA','Maple Leafs':'TOR',Oilers:'EDM',Penguins:'PIT',Predators:'NSH',
  'Red Wings':'DET',Sabres:'BUF',Senators:'OTT',Sharks:'SJ',Stars:'DAL',Wild:'MIN',
  Aces:'LV',Dream:'ATL',Fever:'IND',Liberty:'NY',Lynx:'MIN',Mercury:'PHX',
  Mystics:'WAS',Sky:'CHI',Sparks:'LA',Storm:'SEA',Sun:'CON',Valkyries:'GSV',Wings:'DAL',
  'Angel City':'LA','Bay FC':'SJ','Boston Legacy':'BOS','Chicago Stars':'CHI',
  'Denver Summit':'DEN','Houston Dash':'HOU',
  'Kansas City Current':'KC','NJ/NY Gotham':'NY','North Carolina Courage':'NC',
  'Orlando Pride':'ORL','Portland Thorns':'POR','Racing Louisville':'LOU',
  'San Diego Wave':'SD','Seattle Reign':'SEA','Utah Royals':'UTA','Washington Spirit':'WAS',
  'Atlanta United':'ATL','Austin FC':'ATX','CF Montréal':'MTL','Charlotte FC':'CLT','Chicago Fire':'CHI',
  'Colorado Rapids':'COL','Columbus Crew':'CLB','D.C. United':'DC','FC Cincinnati':'CIN','FC Dallas':'DAL',
  'Houston Dynamo':'HOU','Inter Miami':'MIA','LA Galaxy':'LA','LAFC':'LAFC','Minnesota United':'MIN',
  'Nashville SC':'NSH','New England Revolution':'NE','NYCFC':'NYC','NY Red Bulls':'NY',
  'Orlando City':'ORL','Philadelphia Union':'PHI','Portland Timbers':'POR',
  'Real Salt Lake':'RSL','San Diego FC':'SD','San Jose Earthquakes':'SJ',
  'Seattle Sounders':'SEA','Sporting KC':'SKC','St. Louis City':'STL',
  'Toronto FC':'TOR','Vancouver Whitecaps':'VAN',
}

const TEAM_CITIES = {
  'mlb:Cardinals':'St. Louis',
  'nfl:Cardinals':'Arizona',
  'mlb:Giants':'San Francisco',
  'nfl:Giants':'New York G',
  'mlb:Rangers':'Texas',
  'nhl:Rangers':'New York R',
  'nba:Kings':'Sacramento',
  'nhl:Kings':'Los Angeles',
  'nfl:Jets':'New York J',
  'nhl:Jets':'Winnipeg',
  'nfl:Panthers':'Carolina',
  'nhl:Panthers':'Florida',
  '49ers':'San Francisco',Bears:'Chicago',Bengals:'Cincinnati',Bills:'Buffalo',
  Broncos:'Denver',Browns:'Cleveland',Buccaneers:'Tampa Bay',Cardinals:'Arizona',
  Chargers:'Los Angeles C',Chiefs:'Kansas City',Colts:'Indianapolis',Cowboys:'Dallas',
  Dolphins:'Miami',Eagles:'Philadelphia',Falcons:'Atlanta',Giants:'New York G',
  Jaguars:'Jacksonville',Jets:'New York J',Lions:'Detroit',Packers:'Green Bay',
  Panthers:'Carolina',Patriots:'New England',Raiders:'Las Vegas',Rams:'Los Angeles R',
  Ravens:'Baltimore',Saints:'New Orleans',Seahawks:'Seattle',Steelers:'Pittsburgh',
  Texans:'Houston',Titans:'Tennessee',Vikings:'Minnesota',Washington:'Washington',
  Angels:'Los Angeles A',Astros:'Houston',Athletics:'Oakland','Blue Jays':'Toronto',
  Braves:'Atlanta',Brewers:'Milwaukee',Cubs:'Chicago C',Diamondbacks:'Arizona',
  Dodgers:'Los Angeles D',Giants:'San Francisco',Guardians:'Cleveland',Mariners:'Seattle',
  Marlins:'Miami',Mets:'New York M',Nationals:'Washington',Orioles:'Baltimore',Padres:'San Diego',
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
  Lightning:'Tampa Bay',Mammoth:'Utah','Maple Leafs':'Toronto',Oilers:'Edmonton',Panthers:'Florida',
  Penguins:'Pittsburgh',Predators:'Nashville',Rangers:'New York R','Red Wings':'Detroit',
  Sabres:'Buffalo',Senators:'Ottawa',Sharks:'San Jose',Stars:'Dallas',Wild:'Minnesota',
  Aces:'Las Vegas',Dream:'Atlanta',Fever:'Indiana',Liberty:'New York',Lynx:'Minnesota',
  Mercury:'Phoenix',Mystics:'Washington',Sky:'Chicago',Sparks:'Los Angeles',
  Storm:'Seattle',Sun:'Connecticut',Valkyries:'Golden State',Wings:'Dallas',
  'Atlanta United':'Atlanta','Austin FC':'Austin','CF Montréal':'Montreal','Charlotte FC':'Charlotte',
  'Chicago Fire':'Chicago','Colorado Rapids':'Denver','Columbus Crew':'Columbus',
  'D.C. United':'Washington','FC Cincinnati':'Cincinnati','FC Dallas':'Dallas','Houston Dynamo':'Houston',
  'Inter Miami':'Miami','LA Galaxy':'Los Angeles G','LAFC':'Los Angeles L',
  'Minnesota United':'Minneapolis','Nashville SC':'Nashville','New England Revolution':'Boston',
  'NYCFC':'New York C','NY Red Bulls':'New York R','Orlando City':'Orlando',
  'Philadelphia Union':'Philadelphia','Portland Timbers':'Portland','Real Salt Lake':'Salt Lake City',
  'San Diego FC':'San Diego','San Jose Earthquakes':'San Jose','Seattle Sounders':'Seattle',
  'Sporting KC':'Kansas City','St. Louis City':'St. Louis',
  'Toronto FC':'Toronto','Vancouver Whitecaps':'Vancouver',
  'Angel City':'Los Angeles','Bay FC':'San Jose','Boston Legacy':'Boston','Chicago Stars':'Chicago',
  'Denver Summit':'Denver','Houston Dash':'Houston','Kansas City Current':'Kansas City',
  'NJ/NY Gotham':'New York','North Carolina Courage':'Raleigh',
  'Orlando Pride':'Orlando','Portland Thorns':'Portland',
  'Racing Louisville':'Louisville','San Diego Wave':'San Diego',
  'Seattle Reign':'Seattle','Utah Royals':'Salt Lake City','Washington Spirit':'Washington',
}

const COLLEGE_COLORS = {'Air Force':'#003594','Appalachian State':'#000000','Army':'#000000','Ball State':'#BA0C2F',
  'Boise St.':'#0033A0','Bowling Green':'#FE5000','Charlotte':'#046A38','Coastal Carolina':'#006F71',
  'Colorado St.':'#1E4D2B','East Carolina':'#592A8A','Florida Atlantic':'#003366','Florida International':'#081E3F',
  'Fresno St.':'#DB0032','Georgia Southern':'#011E41','Hawaii':'#024731','James Madison':'#450084',
  'Jacksonville St.':'#D71721','Kennesaw St.':'#FFB81C','Liberty':'#0A2240','Louisiana':'#CE2842',
  'Louisiana Monroe':'#800000','Louisiana Tech':'#002F8B','Marshall':'#00A651','Memphis':'#003087',
  'Miami (OH)':'#B61E2E','Middle Tennessee':'#0066CC','Navy':'#00205B','NC State':'#CC0000',
  'New Mexico':'#BA0C2F','New Mexico St.':'#8C0B42','North Texas':'#00853E','Northern Illinois':'#C8102E',
  Ohio:'#00694E','Old Dominion':'#003057','Rice':'#00205B','Sam Houston':'#FF6900',
  'San Diego St.':'#A6192E','San José St.':'#0055A2','South Alabama':'#00205B','South Florida':'#006747',
  'Southern Miss':'#000000','Stanford':'#8C1515','Temple':'#9D162E','Texas State':'#501214',
  Toledo:'#15397F','Troy':'#7B0F0F','Tulane':'#006747',Tulsa:'#002D72',UAB:'#1E6B52',
  UCF:'#000000',UMass:'#881C1C',UNLV:'#CF0A2C',UTEP:'#FF7300',UTSA:'#0C2340',
  'Utah State':'#003366','Western Kentucky':'#C8102E','Western Michigan':'#6F2D91','Wyoming':'#492F24',
  Creighton:'#003594',Dayton:'#CE1141',DePaul:'#005DAA',Drake:'#0067A8',
  Fordham:'#7C0432',Georgetown:'#041E42','Grand Canyon':'#522398',Hofstra:'#003366',
  Iona:'#6E0F25','Kent State':'#003366','Loyola Chicago':'#700038','Murray St.':'#003D7C',
  Princeton:'#FF8F1C',Providence:'#000000',Richmond:'#990000','Saint Joseph’s':'#7E0303',
  'Saint Louis':'#003DA5','Saint Mary’s':'#06315B','Samford':'#003C71','San Francisco':'#005C2E',
  'Seton Hall':'#0C2340',VCU:'#000000',Vermont:'#003B5C','Wichita St.':'#000000',
  Wofford:'#866D4B',Yale:'#0F4D92',Akron:'#00285E','Buffalo':'#0042A6','California':'#003262','Central Michigan':'#6A0032',
  Delaware:'#00539F','Eastern Michigan':'#006633',Nevada:'#003366','Army':'#D4BF91',
  Belmont:'#040068',Columbia:'#0050A0','East Carolina':'#592A8A','Florida Gulf Coast':'#00427A',
  Harvard:'#A41034','Illinois St.':'#CE0E2D','South Dakota St.':'#003DA5',
  Alabama:'#9E1B32',Arkansas:'#9D2235',Auburn:'#03244D',Baylor:'#154734',BYU:'#002E5D',
  Clemson:'#F66733',Colorado:'#CFB87C',Duke:'#001A57',Florida:'#0021A5','Florida St.':'#782F40',
  Georgia:'#BA0C2F','Georgia Tech':'#B3A369',Houston:'#C8102E',Illinois:'#E84A27',
  Indiana:'#990000',Iowa:'#FFCD00','Iowa St.':'#C8102E',Kansas:'#0051A5','Kansas St.':'#512888',
  Kentucky:'#0033A0',Louisville:'#AD0000',LSU:'#461D7C',Maryland:'#E03A3E',Miami:'#005030',
  Michigan:'#00274C','Michigan St.':'#18453B',Minnesota:'#7A0019','Mississippi St.':'#5D1F1A',
  Missouri:'#F1B82D',Nebraska:'#E41C38','North Carolina':'#7BAFD4','North Carolina St.':'#CC0000',
  Northwestern:'#4E2A84','Notre Dame':'#0C2340','Ohio State':'#BB0000',Oklahoma:'#841617',
  'Oklahoma St.':'#FF7300','Ole Miss':'#CE1126',Oregon:'#154733','Oregon St.':'#DC4405',
  'Penn State':'#041E42',Pittsburgh:'#003594',Purdue:'#CEB888',Rutgers:'#CC0033',
  SMU:'#0033A0','South Carolina':'#73000A',Stanford:'#8C1515',Syracuse:'#D44500',
  TCU:'#4D1979',Tennessee:'#FF8200',Texas:'#BF5700','Texas A&M':'#500000',
  'Texas Tech':'#CC0000',UCLA:'#2D68C4',USC:'#990000',Utah:'#CC0000',Vanderbilt:'#866D4B',
  Virginia:'#232D4B','Virginia Tech':'#630031','Wake Forest':'#9E7E38',
  Washington:'#4B2E83','Washington St.':'#981E32','West Virginia':'#002855',Wisconsin:'#C5050C',
  Connecticut:'#000E2F',Gonzaga:'#002469',Marquette:'#003366',Villanova:'#003366',
  Xavier:'#002883','San Diego St.':'#C41230',Memphis:'#003087','NC State':'#CC0000',
  Arizona:'#CC0033','Arizona St.':'#8C1D40',Cincinnati:'#E00122',
}

const COLLEGE_ABBREVS = {
  Alabama:'ALA',Arkansas:'ARK',Auburn:'AUB',Baylor:'BAY',BYU:'BYU',
  Clemson:'CLEM',Colorado:'COL',Duke:'DUKE',Florida:'UF','Florida St.':'FSU',
  Georgia:'UGA','Georgia Tech':'GT',Houston:'HOU',Illinois:'ILL',
  Indiana:'IU',Iowa:'IOWA','Iowa St.':'ISU',Kansas:'KU','Kansas St.':'KSU',
  Kentucky:'UK',Louisville:'LOU',LSU:'LSU',Maryland:'MD',Miami:'UM',
  Michigan:'MICH','Michigan St.':'MSU',Minnesota:'MINN','Mississippi St.':'MSST',
  Missouri:'MIZ',Nebraska:'NEB','North Carolina':'UNC','North Carolina St.':'NCSU',
  Northwestern:'NU','Notre Dame':'ND','Ohio State':'OSU',Oklahoma:'OU',
  'Oklahoma St.':'OKST','Ole Miss':'MISS',Oregon:'ORE','Oregon St.':'ORST',
  'Penn State':'PSU',Pittsburgh:'PITT',Purdue:'PUR',Rutgers:'RU',
  SMU:'SMU','South Carolina':'SC',Stanford:'STAN',Syracuse:'SYR',
  TCU:'TCU',Tennessee:'TENN',Texas:'TEX','Texas A&M':'TAMU',
  'Texas Tech':'TTU',UCLA:'UCLA',USC:'USC',Utah:'UTAH',Vanderbilt:'VU',
  Virginia:'UVA','Virginia Tech':'VT','Wake Forest':'WAKE',
  Washington:'UW','Washington St.':'WSU','West Virginia':'WVU',Wisconsin:'WIS',
  Connecticut:'UCONN',Gonzaga:'GONZ',Marquette:'MU',Villanova:'NOVA',
  Xavier:'XU','San Diego St.':'SDSU',Memphis:'MEM','NC State':'NCST',
  Arizona:'ARIZ','Arizona St.':'ASU',Cincinnati:'CIN',
}

export default function StepTeams({ leagues, selected, setSelected, onBack, onNext, stepNumber, totalSteps, hideFooter }) {
  const teamLeagues = leagues.filter(k => TEAM_SPORTS.includes(k))
  const [activeTab, setActiveTab] = useState(teamLeagues[0] || '')
  const [visitedTabs, setVisitedTabs] = useState(new Set([teamLeagues[0] || '']))

  if (teamLeagues.length === 0) { onNext(); return null }

  function toggle(league, team) {
    const id = `${league}:${team.full}`
    setSelected(prev =>
      prev.find(t => t.id === id)
        ? prev.filter(t => t.id !== id)
        : [...prev, { id, league, name: team.full, short: team.short }]
    )
  }

  function isSelected(league, team) {
    return selected.some(t => t.id === `${league}:${team.full}`)
  }

  function switchTab(k) {
    setActiveTab(k)
    setVisitedTabs(prev => new Set([...prev, k]))
  }

  const allTabsVisited = teamLeagues.every(k => visitedTabs.has(k))
  const leaguesWithoutTeams = leagues.filter(l => 
    !selected.some(t => t.league === l)
  )
  const hasAtLeastOneTeamPerLeague = leaguesWithoutTeams.length === 0
  const isCollege = ['cfb', 'mcbb', 'wcbb'].includes(activeTab)

  const teams = [...(TEAMS[activeTab] || [])].sort((a, b) => {
    const ca = isCollege ? a.short : (TEAM_CITIES[`${activeTab}:${a.short}`] || TEAM_CITIES[a.short] || a.short)
    const cb = isCollege ? b.short : (TEAM_CITIES[`${activeTab}:${b.short}`] || TEAM_CITIES[b.short] || b.short)
    return ca.localeCompare(cb)
  })

  return (
    <div className={styles.container}>
      <div className={styles.titleArea}>
        {stepNumber && totalSteps && (
          <div style={{
            fontSize: 11,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: 'var(--head)',
            marginBottom: 6,
          }}>
            Step {stepNumber} of {totalSteps}
          </div>
        )}
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
        {teams.map(team => {
          const sel = isSelected(activeTab, team)
          const color = isCollege 
            ? (COLLEGE_COLORS[team.short] || '#1a1a1a') 
            : (TEAM_COLORS[`${activeTab}:${team.short}`] || TEAM_COLORS[team.short] || '#1a1a1a')
          const tricode = isCollege
            ? (COLLEGE_ABBREVS[team.short] || team.short.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase())
            : (({'mlb:Rangers':'TEX','nhl:Rangers':'NYR','mlb:Cardinals':'STL','nfl:Cardinals':'ARI',
                'nfl:Giants':'NYG','mlb:Giants':'SF','nba:Kings':'SAC','nhl:Kings':'LAK',
                'nhl:Jets':'WPG','nfl:Jets':'NYJ','nfl:Panthers':'CAR','nhl:Panthers':'FLA',
              })[`${activeTab}:${team.short}`] || TEAM_TRICODES[team.short] || team.short.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase())
          return (
            <div
              key={team.full}
              className={`${styles.teamCard} ${sel ? styles.sel : ''}`}
              onClick={() => toggle(activeTab, team)}
            >
              <div className={styles.teamCircle} style={{ background: color }}>{tricode}</div>
              <div className={styles.teamName}>{isCollege ? team.short : team.full}</div>
            </div>
          )
        })}
      </div>

      {!hideFooter && (
        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={onBack}>← Back</button>
          <div className={styles.count}><b>{selected.length}</b> teams</div>
          <button
            className={styles.nextBtn}
            onClick={onNext}
            disabled={!hasAtLeastOneTeamPerLeague}
            title={!hasAtLeastOneTeamPerLeague ? `Pick at least one team from: ${leaguesWithoutTeams.join(', ').toUpperCase()}` : ''}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

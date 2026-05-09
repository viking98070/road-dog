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
  Buccaneers:'#D50A0A',Cardinals:'#97233F',Chargers:'#0080C6',Chie

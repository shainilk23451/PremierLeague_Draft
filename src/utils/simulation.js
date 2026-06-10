// Poisson random variable
function poisson(lambda) {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= Math.random()
  } while (p > L)
  return k - 1
}

// Each current PL club represented by their best-ever PL season
const AI_TEAMS = [
  { name: 'Manchester City',   abbr: 'MCI', season: "'17/18", achievement: '100 pts · 106 GF',            attackRating: 92, defenseRating: 87 },
  { name: 'Liverpool',         abbr: 'LIV', season: "'19/20", achievement: '99 pts · 26W 3D 1L',          attackRating: 90, defenseRating: 87 },
  { name: 'Arsenal',           abbr: 'ARS', season: "'03/04", achievement: 'The Invincibles · 90 pts',    attackRating: 89, defenseRating: 88 },
  { name: 'Chelsea',           abbr: 'CHE', season: "'04/05", achievement: '95 pts · 15 GA',              attackRating: 85, defenseRating: 91 },
  { name: 'Manchester United', abbr: 'MUN', season: "'99/00", achievement: '91 pts · 97 GF',              attackRating: 88, defenseRating: 82 },
  { name: 'Tottenham Hotspur', abbr: 'TOT', season: "'16/17", achievement: '86 pts · 86 GF',              attackRating: 83, defenseRating: 82 },
  { name: 'Newcastle United',  abbr: 'NEW', season: "'95/96", achievement: 'Runners-up · 78 pts',         attackRating: 83, defenseRating: 75 },
  { name: 'Aston Villa',       abbr: 'AVL', season: "'92/93", achievement: 'Runners-up · 74 pts',         attackRating: 74, defenseRating: 73 },
  { name: 'Everton',           abbr: 'EVE', season: "'13/14", achievement: '5th · 72 pts',                attackRating: 73, defenseRating: 71 },
  { name: 'Brighton',          abbr: 'BHA', season: "'22/23", achievement: '6th · 62 pts',                attackRating: 73, defenseRating: 71 },
  { name: 'West Ham United',   abbr: 'WHU', season: "'15/16", achievement: '7th · 62 pts',                attackRating: 72, defenseRating: 69 },
  { name: 'Wolverhampton',     abbr: 'WOL', season: "'19/20", achievement: '7th · 59 pts',                attackRating: 70, defenseRating: 71 },
  { name: 'Nottm Forest',      abbr: 'NFO', season: "'94/95", achievement: '5th · 52 pts',                attackRating: 70, defenseRating: 69 },
  { name: 'Brentford',         abbr: 'BRE', season: "'22/23", achievement: '9th · 59 pts',                attackRating: 68, defenseRating: 67 },
  { name: 'Fulham',            abbr: 'FUL', season: "'09/10", achievement: 'Europa Lg final · 46 pts',    attackRating: 67, defenseRating: 67 },
  { name: 'Crystal Palace',    abbr: 'CRY', season: "'14/15", achievement: '10th · 48 pts',               attackRating: 65, defenseRating: 66 },
  { name: 'Sheffield United',  abbr: 'SHU', season: "'19/20", achievement: '9th · 54 pts',                attackRating: 66, defenseRating: 66 },
  { name: 'Burnley',           abbr: 'BUR', season: "'17/18", achievement: '7th · 54 pts',                attackRating: 63, defenseRating: 65 },
  { name: 'Bournemouth',       abbr: 'BOU', season: "'15/16", achievement: 'First top-flight season',     attackRating: 63, defenseRating: 63 },
]

// Map rating (60-99) to 0-1
function norm(rating) {
  return (rating - 60) / 39
}

// Calculate team ratings from 18-slot squad array
// Slots: 0=GK, 1-4=DEF, 5-7=MID, 8-10=FWD, 11=benchGK, 12-17=bench
export function calculateTeamRating(squad) {
  const gk = squad[0]
  const defs = squad.slice(1, 5).filter(Boolean)
  const mids = squad.slice(5, 8).filter(Boolean)
  const fwds = squad.slice(8, 11).filter(Boolean)

  const gkRating = gk ? gk.rating : 70
  const defAvg = defs.length ? defs.reduce((s, p) => s + p.rating, 0) / defs.length : 70
  const midAvg = mids.length ? mids.reduce((s, p) => s + p.rating, 0) / mids.length : 70
  const fwdAvg = fwds.length ? fwds.reduce((s, p) => s + p.rating, 0) / fwds.length : 70

  // Attack: forwards and midfielders drive goals; GK irrelevant
  const attackRating = fwdAvg * 0.60 + midAvg * 0.35 + defAvg * 0.05
  // Defense: GK and defensive line are the cornerstones; mids contribute pressing
  const defenseRating = defAvg * 0.50 + gkRating * 0.40 + midAvg * 0.10

  const bench = squad.slice(11).filter(Boolean)
  const benchAvg = bench.length ? bench.reduce((s, p) => s + p.rating, 0) / bench.length : 70
  // Depth bonus: quality rotation squad provides resilience over 38 games
  const depthBonus = Math.max(0, (benchAvg - 72) * 0.10)

  return {
    attackRating: Math.min(99, attackRating + depthBonus),
    defenseRating: Math.min(99, defenseRating + depthBonus),
    overall: (attackRating + defenseRating) / 2 + depthBonus,
  }
}

// Expected goals — realistic PL range (~0.4–3.0 per team per game)
// Base 1.25 (league average), scaled by attack-vs-defense differential
function xG(attackRating, opponentDefenseRating) {
  const differential = norm(attackRating) - norm(opponentDefenseRating)
  return Math.max(0.4, Math.min(3.0, 1.25 + differential * 1.8))
}

// Per-match form/tactical noise: ±20% variance on xG
// Reflects injuries, tactics, motivation, referee decisions etc.
function formFactor() {
  return 0.80 + Math.random() * 0.40
}

function simulateMatch(homeAttack, homeDefense, awayAttack, awayDefense) {
  const homeXG = xG(homeAttack, awayDefense) * formFactor()
  const awayXG = xG(awayAttack, homeDefense) * formFactor()
  return {
    ourGoals: poisson(Math.max(0.3, homeXG)),
    theirGoals: poisson(Math.max(0.3, awayXG)),
  }
}

function getResult(gf, ga) {
  if (gf > ga) return { result: 'W', pts: 3 }
  if (gf < ga) return { result: 'L', pts: 0 }
  return { result: 'D', pts: 1 }
}

export function simulateSeason(squad) {
  const ourRating = calculateTeamRating(squad)

  const allTeams = [
    { name: 'Dream Squad', abbr: 'YOU', season: '', achievement: '', attackRating: ourRating.attackRating, defenseRating: ourRating.defenseRating, isUs: true },
    ...AI_TEAMS,
  ]

  const standings = allTeams.map(t => ({
    name: t.name, abbr: t.abbr, season: t.season, achievement: t.achievement,
    isUs: !!t.isUs, played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, pts: 0, form: [],
    attackRating: t.attackRating, defenseRating: t.defenseRating,
  }))

  const ourMatches = []

  // Round-robin: every team plays every other team home & away
  for (let i = 0; i < allTeams.length; i++) {
    for (let j = 0; j < allTeams.length; j++) {
      if (i === j) continue
      const home = allTeams[i]
      const away = allTeams[j]

      // +4 home attack advantage (reflects crowd, familiarity, no travel fatigue)
      const { ourGoals: hg, theirGoals: ag } = simulateMatch(
        home.attackRating + 4, home.defenseRating,
        away.attackRating, away.defenseRating,
      )

      const updateTeam = (idx, gf, ga) => {
        const s = standings[idx]
        s.played++; s.gf += gf; s.ga += ga
        const { result, pts } = getResult(gf, ga)
        if (result === 'W') { s.won++; s.pts += pts }
        else if (result === 'L') s.lost++
        else { s.drawn++; s.pts += pts }
        s.form.push(result)
      }

      updateTeam(i, hg, ag)
      updateTeam(j, ag, hg)

      if (i === 0) {
        const { result } = getResult(hg, ag)
        ourMatches.push({ isHome: true, opponent: away.name, opponentSeason: away.season, opponentAbbr: away.abbr, goalsFor: hg, goalsAgainst: ag, result })
      } else if (j === 0) {
        const { result } = getResult(ag, hg)
        ourMatches.push({ isHome: false, opponent: home.name, opponentSeason: home.season, opponentAbbr: home.abbr, goalsFor: ag, goalsAgainst: hg, result })
      }
    }
  }

  standings.forEach(s => { s.gd = s.gf - s.ga })
  standings.sort((a, b) =>
    b.pts !== a.pts ? b.pts - a.pts :
    b.gd !== a.gd ? b.gd - a.gd :
    b.gf - a.gf
  )
  standings.forEach((s, i) => { s.position = i + 1 })

  return {
    ourMatches: ourMatches.slice(0, 38),
    table: standings,
    ourStats: standings.find(s => s.isUs),
  }
}

export function getSeasonVerdict(stats) {
  if (!stats) return { emoji: '', text: 'No data' }
  const { pts, position } = stats
  if (position === 1 && pts >= 90) return { emoji: '🏆', text: 'CHAMPIONS! Record-breaking season!' }
  if (position === 1) return { emoji: '🏆', text: 'PREMIER LEAGUE CHAMPIONS!' }
  if (position === 2) return { emoji: '🥈', text: 'Runners-Up — Agonisingly close!' }
  if (position === 3) return { emoji: '🥉', text: 'Third Place — Champions League football!' }
  if (position <= 4) return { emoji: '✅', text: `${position}th — Champions League secured!` }
  if (position <= 6) return { emoji: '🎯', text: `${position}th — Europa League football!` }
  if (position <= 10) return { emoji: '😐', text: `${position}th — Mid-table finish.` }
  if (position <= 17) return { emoji: '😬', text: `${position}th — Below expectations.` }
  return { emoji: '🚨', text: `${position}th — RELEGATED!` }
}

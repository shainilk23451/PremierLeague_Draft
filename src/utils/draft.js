import { TEAMS, TOTAL_WEIGHT } from '../data/teams.js'

// Slot definitions
// 0=GK, 1=LB, 2=CB, 3=CB, 4=RB, 5=LCM, 6=CM, 7=RCM, 8=LW, 9=ST, 10=RW
// 11=Bench GK, 12-17=Bench outfield
export const SLOT_COUNT = 18

export const SLOT_LABELS = {
  0: 'GK', 1: 'LB', 2: 'CB', 3: 'CB', 4: 'RB',
  5: 'CM', 6: 'CM', 7: 'CM',
  8: 'LW', 9: 'ST', 10: 'RW',
  11: 'GK', 12: 'SUB', 13: 'SUB', 14: 'SUB',
  15: 'SUB', 16: 'SUB', 17: 'SUB',
}

// Which slots each position can fill
const GK_STARTER_SLOTS = [0]
const GK_BENCH_SLOTS = [11]
const DEF_STARTER_SLOTS = [1, 2, 3, 4]
const MID_STARTER_SLOTS = [5, 6, 7]
const FWD_STARTER_SLOTS = [8, 9, 10]
const BENCH_OUTFIELD_SLOTS = [12, 13, 14, 15, 16, 17]

export function getValidSlots(player, squad) {
  const pos = player.position
  const empty = (i) => squad[i] === null

  if (pos === 'GK') {
    return [...GK_STARTER_SLOTS, ...GK_BENCH_SLOTS].filter(empty)
  }

  if (pos === 'DEF') {
    const sp = (player.subPosition || '').toUpperCase()
    let starterSlots
    if (sp === 'LB' || sp === 'LWB') starterSlots = [1]
    else if (sp === 'RB' || sp === 'RWB') starterSlots = [4]
    else if (sp === 'CB') starterSlots = [2, 3]
    else if (sp === 'WB') starterSlots = [1, 4]
    else starterSlots = DEF_STARTER_SLOTS
    return [...starterSlots.filter(empty), ...BENCH_OUTFIELD_SLOTS.filter(empty)]
  }

  const starterSlots = pos === 'MID' ? MID_STARTER_SLOTS : FWD_STARTER_SLOTS
  return [...starterSlots.filter(empty), ...BENCH_OUTFIELD_SLOTS.filter(empty)]
}

// Pick a random team not in usedIds, weighted by team weight
export function pickRandomTeam(usedIds = []) {
  const available = TEAMS.filter(t => !usedIds.includes(t.id))
  if (available.length === 0) return null

  const totalWeight = available.reduce((s, t) => s + t.weight, 0)
  let r = Math.random() * totalWeight
  for (const team of available) {
    r -= team.weight
    if (r <= 0) return team
  }
  return available[available.length - 1]
}

// Filter players that still have valid slots and haven't already been drafted by name
export function getAvailablePlayers(team, squad) {
  const pickedNames = new Set(squad.filter(Boolean).map(p => p.name))
  return team.players.filter(p =>
    !pickedNames.has(p.name) && getValidSlots(p, squad).length > 0
  )
}

// Check if a player can occupy a given slot (used for swap validation)
export function canPlaySlot(player, slotIndex) {
  const pos = player.position
  const sp = (player.subPosition || '').toUpperCase()
  if (slotIndex === 0) return pos === 'GK'
  if (slotIndex === 11) return pos === 'GK'
  if (slotIndex >= 12 && slotIndex <= 17) return pos !== 'GK'
  if (slotIndex === 1) return pos === 'DEF' && (sp === 'LB' || sp === 'LWB' || sp === 'WB')
  if (slotIndex === 2 || slotIndex === 3) return pos === 'DEF' && sp === 'CB'
  if (slotIndex === 4) return pos === 'DEF' && (sp === 'RB' || sp === 'RWB' || sp === 'WB')
  if (slotIndex >= 5 && slotIndex <= 7) return pos === 'MID'
  if (slotIndex >= 8 && slotIndex <= 10) return pos === 'FWD'
  return false
}

// Check if squad is ready to simulate (all 18 slots filled)
export function isSquadComplete(squad) {
  return squad.every(s => s !== null)
}

// Build empty squad
export function emptySquad() {
  return Array(SLOT_COUNT).fill(null)
}

// Count starters vs bench
export function getSquadStats(squad) {
  const starters = squad.slice(0, 11).filter(Boolean).length
  const bench = squad.slice(11).filter(Boolean).length
  return { starters, bench, total: starters + bench }
}

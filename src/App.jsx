import { useState, useCallback } from 'react'
import Landing from './components/Landing.jsx'
import DraftPhase from './components/DraftPhase.jsx'
import SimulationView from './components/SimulationView.jsx'
import ResultsView from './components/ResultsView.jsx'
import HowToPlayModal from './components/HowToPlayModal.jsx'
import { emptySquad, pickRandomTeam, SLOT_COUNT, canPlaySlot } from './utils/draft.js'
import { simulateSeason, DIFFICULTIES } from './utils/simulation.js'

const TOTAL_ROUNDS = 18
const SKIPS_ALLOWED = 2

export default function App() {
  const [phase, setPhase] = useState('landing') // landing | draft | simulating | results
  const [squad, setSquad] = useState(emptySquad())
  const [round, setRound] = useState(0)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [teamsUsed, setTeamsUsed] = useState([])
  const [skipsLeft, setSkipsLeft] = useState(SKIPS_ALLOWED)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [seasonResult, setSeasonResult] = useState(null)
  const [showHowTo, setShowHowTo] = useState(false)
  const [sortKey, setSortKey] = useState('goals')
  const [liftedFromSlot, setLiftedFromSlot] = useState(null)
  const [swapFromSlot, setSwapFromSlot] = useState(null)
  const [difficulty, setDifficulty] = useState('normal')

  const startDraft = useCallback((diff = 'normal') => {
    setDifficulty(diff)
    const team = pickRandomTeam([])
    setCurrentTeam(team)
    setTeamsUsed(team ? [team.id] : [])
    setPhase('draft')
    setRound(0)
    setSquad(emptySquad())
    setSkipsLeft(SKIPS_ALLOWED)
    setSelectedPlayer(null)
    setSortKey('goals')
  }, [])

  const skipTeam = useCallback(() => {
    if (skipsLeft <= 0) return
    const newTeam = pickRandomTeam(teamsUsed)
    if (!newTeam) return
    setCurrentTeam(newTeam)
    setTeamsUsed(prev => [...prev, newTeam.id])
    setSkipsLeft(prev => prev - 1)
    setSelectedPlayer(null)
  }, [skipsLeft, teamsUsed])

  const selectPlayer = useCallback((player) => {
    if (liftedFromSlot !== null) {
      // cancel lift — restore player to original slot
      setSquad(prev => {
        const next = [...prev]
        next[liftedFromSlot] = selectedPlayer
        return next
      })
      setSelectedPlayer(null)
      setLiftedFromSlot(null)
      return
    }
    setSelectedPlayer(prev => prev?.id === player.id ? null : player)
  }, [liftedFromSlot, selectedPlayer])

  const selectForSwap = useCallback((slotIndex) => {
    if (swapFromSlot === slotIndex) {
      setSwapFromSlot(null)
      return
    }
    const playerA = swapFromSlot !== null ? squad[swapFromSlot] : null
    const playerB = squad[slotIndex]
    if (playerA && playerB && canPlaySlot(playerA, slotIndex) && canPlaySlot(playerB, swapFromSlot)) {
      setSquad(prev => {
        const next = [...prev]
        next[swapFromSlot] = playerB
        next[slotIndex] = playerA
        return next
      })
      setSwapFromSlot(null)
    } else {
      setSwapFromSlot(slotIndex)
    }
  }, [swapFromSlot, squad])

  const liftPlayer = useCallback((slotIndex) => {
    if (selectedPlayer) return
    const player = squad[slotIndex]
    if (!player) return
    setSquad(prev => {
      const next = [...prev]
      next[slotIndex] = null
      return next
    })
    setSelectedPlayer(player)
    setLiftedFromSlot(slotIndex)
  }, [selectedPlayer, squad])

  const placePlayer = useCallback((slotIndex) => {
    if (!selectedPlayer) return
    const isMove = liftedFromSlot !== null
    setSquad(prev => {
      const next = [...prev]
      next[slotIndex] = isMove
        ? selectedPlayer
        : { ...selectedPlayer, teamId: currentTeam.id, teamName: currentTeam.name, season: currentTeam.season, primaryColor: currentTeam.primaryColor }
      return next
    })
    setSelectedPlayer(null)
    setLiftedFromSlot(null)

    if (isMove) return

    const newRound = round + 1
    setRound(Math.min(newRound, TOTAL_ROUNDS))
    if (newRound >= TOTAL_ROUNDS) {
      // Squad full — show simulate prompt
      return
    }
    const newTeam = pickRandomTeam([...teamsUsed])
    if (newTeam) {
      setCurrentTeam(newTeam)
      setTeamsUsed(prev => [...prev, newTeam.id])
    }
    setSortKey('goals')
  }, [selectedPlayer, liftedFromSlot, round, currentTeam, teamsUsed])

  const simulate = useCallback(() => {
    setPhase('simulating')
    // Run simulation asynchronously so UI updates first
    setTimeout(() => {
      const result = simulateSeason(squad, difficulty)
      setSeasonResult(result)
    }, 100)
  }, [squad, difficulty])

  const onSimulationComplete = useCallback(() => {
    setPhase('results')
  }, [])

  const restart = useCallback(() => {
    setPhase('landing')
    setSquad(emptySquad())
    setRound(0)
    setCurrentTeam(null)
    setTeamsUsed([])
    setSkipsLeft(SKIPS_ALLOWED)
    setSelectedPlayer(null)
    setSeasonResult(null)
    setSortKey('goals')
    setLiftedFromSlot(null)
    setSwapFromSlot(null)
  }, [])

  const isSquadFull = squad.every(s => s !== null)

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
        <div />
        <h1 className="text-sm font-black tracking-[0.2em] uppercase text-white">
          PL <span className="text-pl-yellow">Draft</span>
        </h1>
        <div className="flex gap-2">
          {phase !== 'landing' && (
            <button
              onClick={restart}
              className="w-8 h-8 border border-zinc-700 rounded-md flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400"
              title="Restart"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowHowTo(true)}
            className="w-8 h-8 border border-zinc-700 rounded-md flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400 font-bold text-sm"
            title="How to play"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main content */}
      {phase === 'landing' && (
        <Landing onStart={startDraft} onHowTo={() => setShowHowTo(true)} />
      )}

      {phase === 'draft' && (
        <DraftPhase
          round={round}
          totalRounds={TOTAL_ROUNDS}
          currentTeam={currentTeam}
          squad={squad}
          skipsLeft={skipsLeft}
          selectedPlayer={selectedPlayer}
          sortKey={sortKey}
          onSortChange={setSortKey}
          onSkip={skipTeam}
          onSelectPlayer={selectPlayer}
          onPlacePlayer={placePlayer}
          onLiftPlayer={liftPlayer}
          swapFromSlot={swapFromSlot}
          onSwapSelect={selectForSwap}
          onSimulate={simulate}
          isSquadFull={isSquadFull}
          hideStats={DIFFICULTIES[difficulty].hideStats}
        />
      )}

      {phase === 'simulating' && (
        <SimulationView
          seasonResult={seasonResult}
          squad={squad}
          onComplete={onSimulationComplete}
        />
      )}

      {phase === 'results' && (
        <ResultsView
          seasonResult={seasonResult}
          squad={squad}
          difficulty={difficulty}
          onRestart={restart}
        />
      )}

      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}
    </div>
  )
}

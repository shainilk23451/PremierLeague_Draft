// Persistent best-result tracking (localStorage). No backend required.
// Stores the single best season per difficulty plus a lifetime drafts counter.

const KEY = 'pldraft.v1'
const DIFFS = ['casual', 'normal', 'elite']

function safeParse(raw) {
  try {
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

function emptyStore() {
  return { bests: {}, drafts: 0 }
}

// Read the full store. Always returns a valid shape, even if storage is
// unavailable (e.g. private mode) or corrupted.
export function loadStore() {
  if (typeof localStorage === 'undefined') return emptyStore()
  try {
    const data = safeParse(localStorage.getItem(KEY))
    if (!data) return emptyStore()
    return { bests: data.bests ?? {}, drafts: data.drafts ?? 0 }
  } catch {
    return emptyStore()
  }
}

function writeStore(store) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // storage full or blocked — fail silently, persistence is best-effort
  }
}

// Lower position is better; ties broken by points, then goal difference.
function isBetter(candidate, current) {
  if (!current) return true
  if (candidate.position !== current.position) return candidate.position < current.position
  if (candidate.pts !== current.pts) return candidate.pts > current.pts
  return candidate.gd > current.gd
}

// Record a completed season. Returns { isNewBest, best } for the difficulty.
export function recordResult(difficulty, ourStats, verdict) {
  const diff = DIFFS.includes(difficulty) ? difficulty : 'normal'
  const store = loadStore()
  store.drafts = (store.drafts ?? 0) + 1

  const candidate = {
    position: ourStats.position,
    pts: ourStats.pts,
    gd: ourStats.gd,
    won: ourStats.won,
    drawn: ourStats.drawn,
    lost: ourStats.lost,
    tier: verdict?.tier ?? '',
    emoji: verdict?.emoji ?? '',
    date: new Date().toISOString(),
  }

  const current = store.bests[diff]
  const isNewBest = isBetter(candidate, current)
  if (isNewBest) store.bests[diff] = candidate

  writeStore(store)
  return { isNewBest, best: store.bests[diff] }
}

// Convenience: best for a single difficulty (or null).
export function getBest(difficulty) {
  return loadStore().bests[difficulty] ?? null
}

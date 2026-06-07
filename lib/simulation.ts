/**
 * Engine de simulação da Copa dos Sonhos.
 *
 * - PRNG determinístico (mulberry32) com sub-streams isolados por domínio (D10)
 * - Toda a campanha é gerada a partir de um SEED único
 * - Roda 100% client-side, sem chamadas ao servidor
 */

import type {
  CupSquad,
  CupPlayer,
  DraftSlot,
  CampaignResult,
  SimulatedMatch,
  SimulatedGoal,
  PenaltyShootout,
  PenaltyKick,
  TournamentPhase,
  Formation,
  DraftMode,
} from '@/lib/types'

// ── PRNG: mulberry32 ──────────────────────────────────────────────────────────

/** Gerador de números pseudo-aleatórios seedado (mulberry32). */
export function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Cria sub-PRNGs independentes por domínio.
 * Adicionar novos domínios (^ 0x05, ^ 0x06...) não afeta os existentes. (D10)
 */
export function buildRngs(seed: number) {
  return {
    adversarios: mulberry32(seed ^ 0x01),
    gols:        mulberry32(seed ^ 0x02),
    minutos:     mulberry32(seed ^ 0x03),
    penaltis:    mulberry32(seed ^ 0x04),
  }
}

/** Converte string SEED (ex: "1YYUVSJ") para número inteiro. */
export function seedToNumber(seedStr: string): number {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

/** Gera um SEED de 7 caracteres alfanuméricos aleatório. */
export function generateSeed(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let seed = ''
  for (let i = 0; i < 7; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)]
  }
  return seed
}

// ── Utilidades de simulação ───────────────────────────────────────────────────

/** Sorteia um item de uma lista usando o RNG fornecido. */
function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)] as T
}

/** Sorteia um inteiro em [min, max] usando o RNG. */
function randInt(min: number, max: number, rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

// ── Cálculo de força dos times ────────────────────────────────────────────────

function avgRating(players: CupPlayer[], positions: string[]): number {
  const filtered = players.filter(p =>
    p.positions.some(pos => positions.includes(pos.toUpperCase()))
  )
  if (filtered.length === 0) return 70
  return filtered.reduce((sum, p) => sum + p.rating, 0) / filtered.length
}

function teamStrength(picks: DraftSlot[]): { attack: number; defense: number } {
  const players = picks.map(p => p.player)
  const attack  = avgRating(players, ['CA', 'PE', 'PD', 'MEI', 'MD', 'ME'])
  const defense = avgRating(players, ['GOL', 'ZAG', 'LD', 'LE'])
  return { attack, defense }
}

// ── Simulação de partida ──────────────────────────────────────────────────────

const BASE_RATE = 1.3  // gols esperados por time (média histórica)

/** Distribui gols esperados (λ) em inteiro usando método de Knuth (Poisson). */
function poissonSample(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > L)
  return k - 1
}

/** Escolhe o marcador de um gol com base em pesos posicionais. */
function chooseScorerFromPicks(picks: DraftSlot[], rng: () => number): string {
  const POSITION_WEIGHTS: Record<string, number> = {
    CA: 3.5, PE: 2.0, PD: 2.0,
    MEI: 1.0, MD: 1.0, ME: 1.0,
    ZAG: 0.3, LD: 0.2, LE: 0.2,
    GOL: 0.0,
  }
  const weights = picks.map(p => {
    const pos = p.position.toUpperCase()
    const posWeight = POSITION_WEIGHTS[pos] ?? 0.5
    // Ponderado também pelo rating individual
    return posWeight * (p.player.rating / 99)
  })
  const total = weights.reduce((s, w) => s + w, 0)
  if (total === 0) return picks[0]?.player.name ?? 'Desconhecido'

  let r = rng() * total
  for (let i = 0; i < picks.length; i++) {
    r -= weights[i] ?? 0
    if (r <= 0) return picks[i]?.player.name ?? 'Desconhecido'
  }
  return picks[picks.length - 1]?.player.name ?? 'Desconhecido'
}

/** Simula uma partida entre o time do usuário e um adversário histórico. */
export function simulateMatch(
  userPicks: DraftSlot[],
  opponent: CupSquad,
  phase: TournamentPhase,
  rngs: ReturnType<typeof buildRngs>
): SimulatedMatch {
  const { attack: userAtk, defense: userDef } = teamStrength(userPicks)
  const oppAtk  = opponent.avg_rating * 0.55  // estimativa: 55% do avg_rating é ataque
  const oppDef  = opponent.avg_rating * 0.45

  // Gols esperados por time
  const lambdaUser = BASE_RATE * (userAtk / Math.max(oppDef, 1)) * 0.85
  const lambdaOpp  = BASE_RATE * (oppAtk / Math.max(userDef, 1)) * 0.85

  const homeGoals = poissonSample(lambdaUser, rngs.gols)
  const awayGoals = poissonSample(lambdaOpp,  rngs.gols)

  // Gerar eventos de gol com minutos
  const goals: SimulatedGoal[] = []

  for (let i = 0; i < homeGoals; i++) {
    goals.push({
      minute:     randInt(1, 90, rngs.minutos),
      scorerName: chooseScorerFromPicks(userPicks, rngs.gols),
      isOpponent: false,
    })
  }

  // Para gols do adversário, usar jogadores fictícios do squad (não temos lista real aqui)
  const oppPlayerNames = getOpponentPlayerNames(opponent)
  for (let i = 0; i < awayGoals; i++) {
    goals.push({
      minute:     randInt(1, 90, rngs.minutos),
      scorerName: pick(oppPlayerNames, rngs.gols),
      isOpponent: true,
    })
  }

  // Ordenar gols por minuto
  goals.sort((a, b) => a.minute - b.minute)

  // Pênaltis em empate no mata-mata (fase de grupos não tem pênaltis)
  let penalties: PenaltyShootout | undefined
  let won = homeGoals > awayGoals

  if (homeGoals === awayGoals && phase !== 'grupos') {
    penalties = simulatePenalties(userPicks, opponent, rngs.penaltis)
    won = penalties.userWon
  }

  return {
    phase,
    opponentSquad: opponent,
    homeGoals,
    awayGoals,
    goals,
    penalties,
    won,
  }
}

// ── Pênaltis ──────────────────────────────────────────────────────────────────

/**
 * P(conversão) = 0.68 + (rating - 60) * (0.24 / 39)
 * ~68% para rating 60, ~92% para rating 99.
 */
function penaltyConversionProb(rating: number, goalkeeperRating: number): number {
  let p = 0.68 + (rating - 60) * (0.24 / 39)
  // Goleiro de elite reduz ligeiramente a probabilidade
  if (goalkeeperRating >= 85) {
    p -= (goalkeeperRating - 84) * 0.004
  }
  return Math.max(0.55, Math.min(0.95, p))
}

function simulatePenalties(
  userPicks: DraftSlot[],
  opponent: CupSquad,
  rng: () => number
): PenaltyShootout {
  // Batedores do usuário: 5 melhores por rating (excluindo GOL)
  const userBatadores = [...userPicks]
    .filter(p => p.position !== 'GOL')
    .sort((a, b) => b.player.rating - a.player.rating)
    .slice(0, 5)

  const goalkeeperRating = userPicks.find(p => p.position === 'GOL')?.player.rating ?? 75
  const oppGoalkeeperRating = opponent.avg_rating * 0.92  // estimativa

  const userKicks:     PenaltyKick[] = []
  const opponentKicks: PenaltyKick[] = []
  const oppNames = getOpponentPlayerNames(opponent)

  let userScore = 0
  let oppScore  = 0

  for (let round = 0; round < 5; round++) {
    // Kick do usuário
    const bater = userBatadores[round]
    if (!bater) break
    const prob      = penaltyConversionProb(bater.player.rating, oppGoalkeeperRating)
    const converted = rng() < prob
    userKicks.push({ takerName: bater.player.name, converted })
    if (converted) userScore++

    // Kick do adversário
    const oppProb   = penaltyConversionProb(opponent.avg_rating * 0.88, goalkeeperRating)
    const oppConv   = rng() < oppProb
    const oppName   = oppNames[round % oppNames.length] ?? `Jogador ${round + 1}`
    opponentKicks.push({ takerName: oppName, converted: oppConv })
    if (oppConv) oppScore++

    // Regra de parada antecipada
    const remaining = 5 - (round + 1)
    if (userScore > oppScore + remaining || oppScore > userScore + remaining) break
  }

  return {
    userKicks,
    opponentKicks,
    userWon: userScore > oppScore,
  }
}

// ── Nomes de jogadores do adversário ─────────────────────────────────────────
// Usados para nomear gols do adversário quando não temos elenco completo carregado

function getOpponentPlayerNames(squad: CupSquad): string[] {
  // Fallback: nomes genéricos baseados na seleção
  // Em produção, isso seria substituído por jogadores reais do squad carregados do banco
  return [
    `Jogador A (${squad.country_code})`,
    `Jogador B (${squad.country_code})`,
    `Jogador C (${squad.country_code})`,
  ]
}

/**
 * Versão melhorada que usa os jogadores reais do adversário.
 * Chamar `enrichMatchesWithOpponentPlayers` após carregar os dados do banco.
 */
export function getTopScorers(players: CupPlayer[]): string[] {
  return players
    .filter(p => !p.positions.includes('GOL'))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 7)
    .map(p => p.name)
}

// ── Geração da campanha completa ─────────────────────────────────────────────

const PHASES_ORDER: TournamentPhase[] = ['grupos', 'grupos', 'grupos', 'oitavas', 'quartas', 'semi', 'final']

/**
 * Gera toda a campanha deterministicamente a partir de um SEED e dos adversários fornecidos.
 *
 * @param userPicks - 11 picks do draft do usuário
 * @param opponents - adversários por fase (7 squads: 3 grupos + oitavas + quartas + semi + final)
 * @param seedStr   - SEED da campanha (ex: "1YYUVSJ")
 * @param formation - formação usada
 * @param mode      - modo de dificuldade
 */
export function generateCampaign(
  userPicks:  DraftSlot[],
  opponents:  CupSquad[],
  seedStr:    string,
  formation:  Formation,
  mode:       DraftMode,
): CampaignResult {
  const seedNum = seedToNumber(seedStr)
  const rngs    = buildRngs(seedNum)

  const matches: SimulatedMatch[] = []
  let eliminated = false

  for (let i = 0; i < Math.min(PHASES_ORDER.length, opponents.length); i++) {
    const phase    = PHASES_ORDER[i]!
    const opponent = opponents[i]
    if (!opponent) break

    const match = simulateMatch(userPicks, opponent, phase, rngs)
    matches.push(match)

    // No mata-mata, eliminação encerra a campanha
    if (phase !== 'grupos' && !match.won) {
      eliminated = true
      break
    }
  }

  // Fase alcançada
  const lastMatch   = matches[matches.length - 1]
  const lastPhase   = lastMatch?.phase ?? 'grupos'
  const phaseReached: CampaignResult['phaseReached'] =
    lastMatch?.won && lastPhase === 'final' ? 'campeao' : lastPhase

  const wins         = matches.filter(m => m.won).length
  const goalsFor     = matches.reduce((s, m) => s + m.homeGoals, 0)
  const goalsAgainst = matches.reduce((s, m) => s + m.awayGoals, 0)

  return {
    seed:         seedStr,
    formation,
    mode,
    picks:        userPicks,
    matches,
    phaseReached,
    wins,
    goalsFor,
    goalsAgainst,
  }
}

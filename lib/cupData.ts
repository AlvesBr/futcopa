/**
 * Funções de acesso aos dados da Copa dos Sonhos.
 * NUNCA chama APIs externas em runtime — somente lê do Supabase (populado offline).
 */

import { createBrowserClient } from '@/lib/supabase'
import type { CupEdition, CupSquad, CupPlayer, TournamentPhase } from '@/lib/types'

// ── Mapa de compatibilidade de posições ──────────────────────────────────────
// Posição do jogador → slots de formação onde pode jogar (D11)
export const POSITION_COMPATIBILITY: Record<string, string[]> = {
  GOL: ['GOL'],
  LD:  ['LD', 'ZAG'],
  LE:  ['LE', 'ZAG'],
  // Wikipedia só tem DF genérico → todos os defensores chegam como ZAG.
  // ZAG pode cobrir LD e LE pois não há como distinguir laterais de zagueiros
  // centrais a partir dos dados coletados.
  ZAG: ['ZAG', 'LD', 'LE'],
  MEI: ['MEI'],
  MD:  ['MEI', 'PD'],
  ME:  ['MEI', 'PE'],
  PD:  ['PD', 'CA'],
  PE:  ['PE', 'CA'],
  CA:  ['CA', 'PE', 'PD'],
}

/** Retorna todos os slots compatíveis com as posições de um jogador. */
export function getCompatibleSlots(
  playerPositions: string[],
  emptySlotTypes: string[]
): string[] {
  const compatible = new Set<string>()
  for (const pos of playerPositions) {
    const slots = POSITION_COMPATIBILITY[pos.toUpperCase()] ?? []
    for (const slot of slots) {
      if (emptySlotTypes.includes(slot)) compatible.add(slot)
    }
  }
  return [...compatible]
}

// ── Layouts de formação ───────────────────────────────────────────────────────
// Define os slots de cada formação como array de TacticalPosition
export const FORMATION_SLOTS: Record<string, string[]> = {
  '4-3-3':   ['GOL', 'LD', 'ZAG', 'ZAG', 'LE', 'MEI', 'MEI', 'MEI', 'PD', 'CA', 'PE'],
  '4-4-2':   ['GOL', 'LD', 'ZAG', 'ZAG', 'LE', 'MD',  'MEI', 'MEI', 'ME', 'CA', 'CA'],
  '4-2-3-1': ['GOL', 'LD', 'ZAG', 'ZAG', 'LE', 'MEI', 'MEI', 'PD',  'MEI','PE', 'CA'],
  '4-2-4':   ['GOL', 'LD', 'ZAG', 'ZAG', 'LE', 'MEI', 'MEI', 'PD',  'CA', 'CA', 'PE'],
  '3-5-2':   ['GOL', 'ZAG', 'ZAG', 'ZAG', 'MD', 'MEI', 'MEI', 'MEI', 'ME', 'CA', 'CA'],
  '5-3-2':   ['GOL', 'LD', 'ZAG', 'ZAG', 'ZAG', 'LE', 'MEI', 'MEI', 'MEI','CA', 'CA'],
  '4-5-1':   ['GOL', 'LD', 'ZAG', 'ZAG', 'LE', 'MD',  'MEI', 'MEI', 'ME', 'MEI','CA'],
  '3-4-3':   ['GOL', 'ZAG', 'ZAG', 'ZAG', 'MD', 'MEI', 'MEI', 'ME', 'PD', 'CA', 'PE'],
}

// ── Pool de adversários por fase ──────────────────────────────────────────────
export const PHASE_RATING_RANGES: Record<TournamentPhase, { min: number; max: number }> = {
  grupos:  { min: 68, max: 80 },
  oitavas: { min: 78, max: 85 },
  quartas: { min: 83, max: 88 },
  semi:    { min: 86, max: 92 },
  final:   { min: 88, max: 99 },
}

// ── Queries Supabase ──────────────────────────────────────────────────────────

/** Retorna todas as edições disponíveis, ordenadas por ano. */
export async function getCupEditions(): Promise<CupEdition[]> {
  const sb = createBrowserClient()
  const { data, error } = await sb
    .from('cup_editions')
    .select('*')
    .order('year', { ascending: true })

  if (error) throw new Error(`getCupEditions: ${error.message}`)
  return (data ?? []) as CupEdition[]
}

/** Retorna todos os squads de uma edição. */
export async function getSquadsByEdition(editionId: string): Promise<CupSquad[]> {
  const sb = createBrowserClient()
  const { data, error } = await sb
    .from('cup_squads')
    .select('*')
    .eq('edition_id', editionId)

  if (error) throw new Error(`getSquadsByEdition: ${error.message}`)
  return (data ?? []) as CupSquad[]
}

/** Retorna jogadores de um squad, usando a view com rating efetivo. */
export async function getPlayersBySquad(squadId: string): Promise<CupPlayer[]> {
  const sb = createBrowserClient()
  const { data, error } = await sb
    .from('cup_players_with_rating')
    .select('*')
    .eq('squad_id', squadId)
    .order('rating', { ascending: false })

  if (error) throw new Error(`getPlayersBySquad: ${error.message}`)
  return (data ?? []) as CupPlayer[]
}

/**
 * Sorteia um squad aleatório para o draft (seleção + edição).
 * Exclui squads já usados no draft atual.
 */
export async function getRandomRoll(
  excludeSquadIds: string[] = [],
  _attempt = 0,
): Promise<{ edition: CupEdition; squad: CupSquad; players: CupPlayer[] } | null> {
  const sb = createBrowserClient()

  // Buscar todos os squads elegíveis (com pelo menos 11 jogadores)
  let query = sb
    .from('cup_squads')
    .select('*, cup_editions!inner(*)')

  if (excludeSquadIds.length > 0) {
    query = query.not('id', 'in', `(${excludeSquadIds.join(',')})`)
  }

  const { data: squads, error } = await query
  if (error) throw new Error(`getRandomRoll: ${error.message}`)
  if (!squads || squads.length === 0) return null

  // Sortear aleatoriamente (client-side para ser determinístico via PRNG quando necessário)
  const idx   = Math.floor(Math.random() * squads.length)
  const squad = squads[idx] as CupSquad & { cup_editions: CupEdition }

  const players = await getPlayersBySquad(squad.id)
  if (players.length < 11) {
    // Tentar outro squad se este tiver poucos jogadores
    return getRandomRoll([...excludeSquadIds, squad.id])
  }

  return {
    edition: squad.cup_editions,
    squad:   { ...squad, cup_editions: undefined } as unknown as CupSquad,
    players,
  }
}

/**
 * Para "↺ Outra Seleção": mesma Copa (editionId), país diferente.
 * Fallback automático para qualquer squad se não houver outros na mesma Copa.
 */
export async function getRandomRollSameEdition(
  editionId: string,
  excludeSquadIds: string[] = []
): Promise<{ edition: CupEdition; squad: CupSquad; players: CupPlayer[] } | null> {
  const sb = createBrowserClient()

  let query = sb
    .from('cup_squads')
    .select('*, cup_editions!inner(*)')
    .eq('edition_id', editionId)

  if (excludeSquadIds.length > 0) {
    query = query.not('id', 'in', `(${excludeSquadIds.join(',')})`)
  }

  const { data: squads, error } = await query
  if (error) throw new Error(`getRandomRollSameEdition: ${error.message}`)

  if (!squads || squads.length === 0) {
    // Fallback: qualquer squad não usado
    return getRandomRoll(excludeSquadIds)
  }

  const idx   = Math.floor(Math.random() * squads.length)
  const squad = squads[idx] as CupSquad & { cup_editions: CupEdition }

  const players = await getPlayersBySquad(squad.id)
  if (players.length < 11) {
    return getRandomRollSameEdition(editionId, [...excludeSquadIds, squad.id])
  }

  return {
    edition: squad.cup_editions,
    squad:   { ...squad, cup_editions: undefined } as unknown as CupSquad,
    players,
  }
}

/**
 * Para "↺ Outra Copa": mesmo país (countryCode), Copa diferente.
 * Fallback automático para qualquer squad se o país não tiver outras edições.
 */
export async function getRandomRollSameCountry(
  countryCode: string,
  excludeSquadIds: string[] = []
): Promise<{ edition: CupEdition; squad: CupSquad; players: CupPlayer[] } | null> {
  const sb = createBrowserClient()

  let query = sb
    .from('cup_squads')
    .select('*, cup_editions!inner(*)')
    .eq('country_code', countryCode)

  if (excludeSquadIds.length > 0) {
    query = query.not('id', 'in', `(${excludeSquadIds.join(',')})`)
  }

  const { data: squads, error } = await query
  if (error) throw new Error(`getRandomRollSameCountry: ${error.message}`)

  if (!squads || squads.length === 0) {
    // Fallback: qualquer squad não usado
    return getRandomRoll(excludeSquadIds)
  }

  const idx   = Math.floor(Math.random() * squads.length)
  const squad = squads[idx] as CupSquad & { cup_editions: CupEdition }

  const players = await getPlayersBySquad(squad.id)
  if (players.length < 11) {
    return getRandomRollSameCountry(countryCode, [...excludeSquadIds, squad.id])
  }

  return {
    edition: squad.cup_editions,
    squad:   { ...squad, cup_editions: undefined } as unknown as CupSquad,
    players,
  }
}

/**
 * Busca squads elegíveis para ser adversário numa fase do torneio.
 * Exclui squads usados no draft (Abordagem C: apenas o squad exato, não a seleção).
 */
export async function getOpponentPool(
  phase: TournamentPhase,
  draftedSquadIds: string[],
  usedOpponentIds: string[] = []
): Promise<CupSquad[]> {
  const sb    = createBrowserClient()
  let range   = PHASE_RATING_RANGES[phase]
  const excluded = [...draftedSquadIds, ...usedOpponentIds]

  for (let attempt = 0; attempt < 3; attempt++) {
    let query = sb
      .from('cup_squads')
      .select('*')
      .gte('avg_rating', range.min)
      .lte('avg_rating', range.max)

    if (excluded.length > 0) {
      query = query.not('id', 'in', `(${excluded.join(',')})`)
    }

    const { data, error } = await query
    if (error) throw new Error(`getOpponentPool: ${error.message}`)
    if (data && data.length > 0) return data as CupSquad[]

    // Fallback: expandir range ±5
    range = { min: range.min - 5, max: range.max + 5 }
  }

  return []
}

/**
 * Retorna TODOS os squads do banco, sem filtro de rating.
 * Usado para gerar a lista completa de adversários possíveis na simulação.
 */
export async function getAllSquads(): Promise<CupSquad[]> {
  const sb = createBrowserClient()
  const { data, error } = await sb
    .from('cup_squads')
    .select('*')
    .order('avg_rating', { ascending: true })

  if (error) throw new Error(`getAllSquads: ${error.message}`)
  return (data ?? []) as CupSquad[]
}

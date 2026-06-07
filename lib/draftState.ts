/**
 * Helpers para ler/escrever o estado do draft em sessionStorage.
 * sessionStorage é limpo ao fechar a aba — comportamento arcade intencional (D2).
 */

import type { DraftState, CampaignResult } from '@/lib/types'

const DRAFT_KEY    = 'copa:draft'
const CAMPAIGN_KEY = 'copa:campaign'

// ── DraftState ────────────────────────────────────────────────────────────────

export function saveDraftState(state: DraftState): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state))
}

export function loadDraftState(): DraftState | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DraftState
  } catch {
    return null
  }
}

export function clearDraftState(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(DRAFT_KEY)
}

// ── CampaignResult ────────────────────────────────────────────────────────────

export function saveCampaignResult(result: CampaignResult): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(result))
}

export function loadCampaignResult(): CampaignResult | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(CAMPAIGN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CampaignResult
  } catch {
    return null
  }
}

export function clearCampaignResult(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(CAMPAIGN_KEY)
}

/** Limpa todo o estado da Copa dos Sonhos (draft + campanha). Usado em "↻ Repetir". */
export function resetCopaState(): void {
  clearDraftState()
  clearCampaignResult()
}

// ── Helpers de estado ─────────────────────────────────────────────────────────

import type { Formation, DraftMode } from '@/lib/types'

export function createEmptyDraftState(
  formation: Formation,
  mode: DraftMode
): DraftState {
  return {
    formation,
    mode,
    picks: [],
    rerollsLeft: 3,
    currentRoll: null,
  }
}

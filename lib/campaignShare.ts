/**
 * Geração de URL e texto de compartilhamento para a Copa dos Sonhos.
 * O SEED identifica a run do usuário (D11) — não é um replay completo.
 */

import type { CampaignResult } from '@/lib/types'

const PHASE_LABELS: Record<string, string> = {
  grupos:  'na fase de grupos',
  oitavas: 'nas oitavas',
  quartas: 'nas quartas',
  semi:    'na semifinal',
  final:   'na final',
  campeao: 'CAMPEÃO',
}

/** Gera a URL compartilhável com o SEED da campanha. */
export function buildShareUrl(seed: string): string {
  if (typeof window === 'undefined') {
    return `/copa-dos-sonhos/simulacao?seed=${seed}`
  }
  const base = `${window.location.origin}/copa-dos-sonhos/simulacao`
  return `${base}?seed=${seed}`
}

/** Monta o texto pré-formatado para compartilhamento. */
export function buildShareText(result: CampaignResult): string {
  const phase   = PHASE_LABELS[result.phaseReached] ?? result.phaseReached
  const isCampeao = result.phaseReached === 'campeao'

  // Pegar até 3 jogadores em destaque (maiores ratings)
  const top3 = [...result.picks]
    .sort((a, b) => b.player.rating - a.player.rating)
    .slice(0, 3)
    .map(p => p.player.name)

  const playersText = top3.join(', ')

  if (isCampeao) {
    return (
      `🏆 CAMPEÃO DA COPA DOS SONHOS!\n` +
      `Time: ${playersText}...\n` +
      `${result.wins} vitórias | ${result.goalsFor} gols\n` +
      `Tente você também → ${buildShareUrl(result.seed)}`
    )
  }

  return (
    `⚽ Cheguei ${phase} na Copa dos Sonhos!\n` +
    `Time: ${playersText}...\n` +
    `${result.wins} vitórias | ${result.goalsFor} gols\n` +
    `Tente você também → ${buildShareUrl(result.seed)}`
  )
}

/** Copia o link para a área de transferência. Retorna true se copiou com sucesso. */
export async function copyShareLink(seed: string): Promise<boolean> {
  const url = buildShareUrl(seed)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    // Fallback para browsers sem Clipboard API
    try {
      const el = document.createElement('textarea')
      el.value = url
      el.style.position = 'fixed'
      el.style.opacity  = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      return true
    } catch {
      return false
    }
  }
}

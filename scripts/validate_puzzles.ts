import fs from 'node:fs'
import path from 'node:path'

const PUZZLES_PATH = path.resolve(process.cwd(), 'data/puzzles.json')

const RANK_TO_LEVEL: Record<number, number> = {
  1: 1,
  2: 2, 3: 2,
  4: 3, 5: 3, 6: 3,
  7: 4, 8: 4, 9: 4, 10: 4,
}

interface PuzzlePlayer {
  player_id: string
  name: string
  value: number
  correct_rank: number
  correct_level: number
}

interface Puzzle {
  id: string
  date: string
  category: string
  description: string
  difficulty: string
  players: PuzzlePlayer[]
}

function validatePuzzles(puzzles: unknown[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const seenDates = new Set<string>()

  for (const [i, raw] of puzzles.entries()) {
    const p = raw as Puzzle
    const ctx = `Puzzle ${i + 1} (${p.date ?? '?'})`

    // Date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date ?? '')) {
      errors.push(`${ctx}: data inválida "${p.date}"`)
    } else if (seenDates.has(p.date)) {
      errors.push(`${ctx}: data duplicada "${p.date}"`)
    } else {
      seenDates.add(p.date)
    }

    // Player count
    if (!Array.isArray(p.players) || p.players.length !== 10) {
      errors.push(`${ctx}: esperados 10 players, encontrados ${p.players?.length ?? 0}`)
      continue
    }

    // Per-player validation
    const values: number[] = []
    for (const player of p.players) {
      const rank = player.correct_rank
      const expectedLevel = RANK_TO_LEVEL[rank]
      if (expectedLevel === undefined) {
        errors.push(`${ctx} player "${player.player_id}": correct_rank ${rank} inválido (deve ser 1–10)`)
      } else if (player.correct_level !== expectedLevel) {
        errors.push(
          `${ctx} player "${player.player_id}": correct_level ${player.correct_level} ≠ esperado ${expectedLevel} para rank ${rank}`
        )
      }
      values.push(player.value)
    }

    // Warn on duplicate values
    const valueSet = new Set(values)
    if (valueSet.size < values.length) {
      warnings.push(`${ctx}: values duplicados — verifique critério de desempate`)
    }
  }

  return { errors, warnings }
}

function main(): void {
  if (!fs.existsSync(PUZZLES_PATH)) {
    console.error(`Arquivo não encontrado: ${PUZZLES_PATH}`)
    console.error('Execute "python scripts/build_puzzles.py" primeiro.')
    process.exit(1)
  }

  const raw = fs.readFileSync(PUZZLES_PATH, 'utf-8')
  const puzzles: unknown[] = JSON.parse(raw)

  if (!Array.isArray(puzzles)) {
    console.error('data/puzzles.json deve ser um array')
    process.exit(1)
  }

  console.log(`Validando ${puzzles.length} puzzles...`)

  const { errors, warnings } = validatePuzzles(puzzles)

  if (warnings.length) {
    for (const w of warnings) console.warn(`⚠  ${w}`)
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗  ${e}`)
    console.error(`\n${errors.length} erro(s) encontrado(s). Corrija antes de fazer seed.`)
    process.exit(1)
  }

  console.log(`✓  ${puzzles.length} puzzles válidos${warnings.length ? ` (${warnings.length} aviso(s))` : ''}.`)
}

main()

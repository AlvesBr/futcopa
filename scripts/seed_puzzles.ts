/**
 * Seed script — inserts players and puzzles from data/puzzles.json into Supabase.
 * Run once (offline): npx tsx scripts/seed_puzzles.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Puzzle, PuzzlePlayer, Player } from '../lib/types'

// Load env manually (tsx doesn't auto-load .env.local)
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const puzzlesPath = join(process.cwd(), 'data', 'puzzles.json')
const puzzles: Puzzle[] = JSON.parse(readFileSync(puzzlesPath, 'utf-8'))

/** Extract unique players across all puzzles */
function extractPlayers(puzzles: Puzzle[]): Player[] {
  const map = new Map<string, Player>()
  for (const puzzle of puzzles) {
    for (const pp of puzzle.players as (PuzzlePlayer & { player_id: string })[]) {
      if (!map.has(pp.player_id)) {
        map.set(pp.player_id, {
          id: pp.player_id,
          name: pp.name,
          country: '',         // enriched later via data-pipeline change
          photo_url: null,
        })
      }
    }
  }
  return Array.from(map.values())
}

async function seed() {
  console.log(`\n🌱 Seeding ${puzzles.length} puzzles from data/puzzles.json\n`)

  // --- Players ---
  const players = extractPlayers(puzzles)
  console.log(`👤 Upserting ${players.length} unique players...`)
  const { error: playersError, count: playersCount } = await supabase
    .from('players')
    .upsert(players, { onConflict: 'id', count: 'exact' })

  if (playersError) {
    console.error('❌ Players upsert failed:', playersError.message)
    process.exit(1)
  }
  console.log(`   ✓ ${playersCount ?? players.length} players upserted`)

  // --- Puzzles ---
  console.log(`\n🧩 Upserting ${puzzles.length} puzzles...`)
  let puzzlesDone = 0
  for (const puzzle of puzzles) {
    const { error } = await supabase
      .from('puzzles')
      .upsert(puzzle, { onConflict: 'id' })
    if (error) {
      console.error(`❌ Puzzle ${puzzle.date} failed:`, error.message)
    } else {
      console.log(`   ✓ ${puzzle.date} — ${puzzle.category}`)
      puzzlesDone++
    }
  }

  console.log(`\n✅ Done: ${puzzlesDone}/${puzzles.length} puzzles, ${players.length} players\n`)
}

seed().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})

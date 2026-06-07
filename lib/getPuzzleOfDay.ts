import type { Puzzle } from './types'
import { createBrowserClient } from './supabase'

/** Returns today's date as YYYY-MM-DD in the local timezone. */
export function todayDate(): string {
  return new Date().toLocaleDateString('en-CA') // en-CA gives YYYY-MM-DD
}

/**
 * Fetches a puzzle by date from Supabase.
 * Falls back to the static JSON snapshot in data/puzzles.json on error.
 * Returns null if no puzzle exists for the given date.
 */
export async function getPuzzleOfDay(date: string): Promise<Puzzle | null> {
  try {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('date', date)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return getFallbackPuzzle(date) // no rows
      throw error
    }
    return data as Puzzle
  } catch {
    return getFallbackPuzzle(date)
  }
}

/** Loads the static JSON fallback for the given date. */
async function getFallbackPuzzle(date: string): Promise<Puzzle | null> {
  try {
    const puzzles = (await import('@/data/puzzles.json')).default as Puzzle[]
    return puzzles.find(p => p.date === date) ?? null
  } catch {
    return null
  }
}

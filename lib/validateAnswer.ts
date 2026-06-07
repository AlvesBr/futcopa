import { RANK_TO_LEVEL, type Level, type Rank } from './types'

/**
 * Returns true if the chosen pyramid level is correct for the given rank.
 * Uses RANK_TO_LEVEL as the source of truth.
 */
export function validateAnswer(rank: Rank, chosenLevel: Level): boolean {
  return RANK_TO_LEVEL[rank] === chosenLevel
}

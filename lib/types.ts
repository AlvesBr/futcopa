/**
 * Tipos centrais do WorldCup Pyramid, derivados de `supabase/schema.sql`.
 * Fonte única de verdade — reutilizar em data, scripts e UI (não duplicar shapes).
 */

/** Dificuldade do puzzle. */
export type Difficulty = "easy" | "normal";

/** Posição correta de um jogador no puzzle (1 = melhor, 10 = pior). */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Nível na pirâmide (1 = topo, 4 = base). */
export type Level = 1 | 2 | 3 | 4;

/** Jogador/entidade (pode ser uma seleção). Tabela `players`. */
export interface Player {
  id: string; // ex.: "messi-arg"
  name: string;
  country: string;
  country_code?: string | null; // ISO-2, ex.: "AR", "BR"
  photo_url?: string | null;
  born_year?: number | null;
  api_football_id?: number | null;
  wikipedia_slug?: string | null;
  // Atribuição da imagem (Wikimedia): obrigatório quando há photo_url.
  photo_credit?: string | null;
  photo_license?: string | null;
  photo_source_url?: string | null;
  created_at?: string | null;
}

/** Entrada de jogador dentro de um puzzle (jsonb `puzzles.players`). */
export interface PuzzlePlayer {
  player_id: string;
  name: string;
  photo_url?: string | null;
  value: number; // valor da categoria usado para ordenar
  correct_rank: Rank; // 1–10
  correct_level: Level; // 1–4 (derivado de correct_rank por RANK_TO_LEVEL)
}

/** Puzzle diário. Tabela `puzzles`. */
export interface Puzzle {
  id?: string;
  date: string; // YYYY-MM-DD (chave do puzzle diário)
  category: string;
  description?: string | null;
  difficulty: Difficulty;
  players: PuzzlePlayer[];
  source?: string | null;
  created_at?: string | null;
}

/** Resultado anônimo de uma partida. Tabela `user_results`. */
export interface UserResult {
  id?: string;
  puzzle_id?: string | null;
  puzzle_date: string;
  score: number; // 0–10
  used_help?: boolean;
  time_spent?: number | null; // segundos
  share_text?: string | null;
  created_at?: string | null;
}

/** Estatísticas agregadas por puzzle. View `puzzle_stats`. */
export interface PuzzleStats {
  puzzle_date: string;
  total_plays: number;
  avg_score: number;
  perfect_scores: number;
  used_help_count: number;
  avg_time_seconds: number;
}

/** Reporte de erro de dado em um puzzle. Tabela `reports`. */
export interface Report {
  id?: string;
  puzzle_date: string;
  player_id?: string | null;
  reason: string;
  details?: string | null;
  created_at?: string | null;
}

/**
 * Mapa rank (1–10) → nível na pirâmide (1–4).
 * rank 1 → nível 1; ranks 2-3 → nível 2; ranks 4-6 → nível 3; ranks 7-10 → nível 4.
 */
export const RANK_TO_LEVEL: Readonly<Record<Rank, Level>> = {
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 3,
  7: 4,
  8: 4,
  9: 4,
  10: 4,
};

/** Número de slots por nível da pirâmide (nível 1 = topo). */
export const SLOTS_PER_LEVEL: Readonly<Record<Level, number>> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

/** Retorna o nível correto da pirâmide para um dado rank (1–10). */
export function levelForRank(rank: number): Level {
  const level = RANK_TO_LEVEL[rank as Rank];
  if (!level) {
    throw new RangeError(`Rank fora do intervalo 1–10: ${rank}`);
  }
  return level;
}

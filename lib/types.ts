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

/** Modo de jogo selecionado pelo usuário. */
export type GameMode = 'normal' | 'easy'

/** Estado de um slot preenchido na pirâmide. */
export interface SlotEntry {
  playerId: string
  playerName: string
  correct: boolean
  /** Nível correto do jogador — exibido no gabarito quando errou. Opcional para resultados salvos antigos. */
  correctLevel?: Level
}

/** Retorna o nível correto da pirâmide para um dado rank (1–10). */
export function levelForRank(rank: number): Level {
  const level = RANK_TO_LEVEL[rank as Rank];
  if (!level) {
    throw new RangeError(`Rank fora do intervalo 1–10: ${rank}`);
  }
  return level;
}

// ============================================================
// COPA DOS SONHOS — Tipos independentes do puzzle diário
// ============================================================

/** Posições táticas reconhecidas pelo jogo. */
export type TacticalPosition =
  | 'GOL'
  | 'LD' | 'ZAG' | 'LE'
  | 'MEI' | 'MD' | 'ME'
  | 'PD' | 'PE' | 'CA';

/** Formações táticas disponíveis. */
export type Formation =
  | '4-3-3' | '4-4-2' | '4-2-3-1' | '4-2-4'
  | '3-5-2' | '5-3-2' | '4-5-1'   | '3-4-3';

/** Modo de dificuldade do draft. */
export type DraftMode = 'classico' | 'almanaque';

/** Fase alcançada numa Copa. */
export type PhaseReached =
  | 'CAMPEÃO' | 'VICE' | 'SEMI' | 'QUARTAS' | 'OITAVAS' | 'FASE_GRUPOS';

/** Fase do torneio na simulação. */
export type TournamentPhase =
  | 'grupos' | 'oitavas' | 'quartas' | 'semi' | 'final';

// ── Dados de banco ────────────────────────────────────────────

/** Edição da Copa do Mundo. Tabela `cup_editions`. */
export interface CupEdition {
  id:           string;
  year:         number;        // ex: 1998
  host_country: string;        // ex: "França"
  champion:     string;        // ex: "França"
}

/** Seleção numa edição da Copa. Tabela `cup_squads`. */
export interface CupSquad {
  id:            string;
  edition_id:    string;
  country_code:  string;       // ISO-2: "BR", "AR"
  country_name:  string;       // ex: "Brasil"
  flag_emoji:    string;       // ex: "🇧🇷"
  phase_reached: PhaseReached;
  avg_rating:    number;       // média dos 11 maiores ratings; usado no pool de adversários
}

/**
 * Jogador numa seleção × edição específica. Tabela `cup_players`.
 * Rating é SEMPRE por campanha — Messi 2006 ≠ Messi 2022.
 */
export interface CupPlayer {
  id:              string;
  squad_id:        string;
  squad_number:    number | null;
  name:            string;
  positions:       TacticalPosition[];  // [0] = posição principal
  rating_computed: number;              // calculado offline (60–99)
  rating_override: number | null;       // ajuste manual para casos históricos
  override_reason: string | null;
  photo_url:       string | null;
  goals:           number;
  assists:         number;
  minutes_played:  number | null;
  /** Rating efetivo: override ?? computed. Vem da view `cup_players_with_rating`. */
  rating:          number;
}

// ── Estado do draft (sessionStorage) ─────────────────────────

/** Um slot preenchido no draft (posição + jogador escolhido). */
export interface DraftSlot {
  position:     TacticalPosition;
  slotIndex:    number;               // para formações com posições repetidas (ex: ZAG 0 e ZAG 1)
  player:       CupPlayer;
  squadInfo: {
    country_code: string;
    country_name: string;
    flag_emoji:   string;
    edition_year: number;
  };
}

/** Estado completo do draft persistido em sessionStorage. */
export interface DraftState {
  formation:    Formation;
  mode:         DraftMode;
  picks:        DraftSlot[];          // 0–11 picks feitos
  rerollsLeft:  number;               // re-rolls restantes no pick atual (0–3)
  currentRoll: {
    squad:   CupSquad   | null;
    edition: CupEdition | null;
    players: CupPlayer[];
  } | null;
}

// ── Simulação ─────────────────────────────────────────────────

/** Gol gerado pela engine de simulação. */
export interface SimulatedGoal {
  minute:     number;         // 1–90 (ou 90+ para acréscimos)
  scorerName: string;
  isOpponent: boolean;        // false = gol do time do usuário
}

/** Resultado de uma partida simulada. */
export interface SimulatedMatch {
  phase:        TournamentPhase;
  opponentSquad: CupSquad;
  homeGoals:    number;        // gols do time do usuário
  awayGoals:    number;        // gols do adversário
  goals:        SimulatedGoal[];
  penalties?:   PenaltyShootout;
  won:          boolean;
}

/** Disputas de pênaltis. */
export interface PenaltyShootout {
  userKicks:     PenaltyKick[];
  opponentKicks: PenaltyKick[];
  userWon:       boolean;
}

export interface PenaltyKick {
  takerName: string;
  converted: boolean;
}

/** Resultado completo de uma campanha. */
export interface CampaignResult {
  seed:         string;           // ex: "1YYUVSJ"
  formation:    Formation;
  mode:         DraftMode;
  picks:        DraftSlot[];
  matches:      SimulatedMatch[];
  phaseReached: TournamentPhase | 'campeao';
  wins:         number;
  goalsFor:     number;
  goalsAgainst: number;
}

// ── Hub de modos ──────────────────────────────────────────────

/** Registro de um modo de jogo na home hub (D9). Renomeado para HubMode para não colidir com GameMode do Pyramid. */
export interface HubMode {
  id:          string;
  title:       string;
  description: string;
  href:        string;
  duration:    string;          // ex: "~10 min"
  available:   boolean;
  badge?:      'NOVO' | 'EM BREVE';
}

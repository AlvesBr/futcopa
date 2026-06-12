/**
 * Copa 2026 Ao Vivo — tipos, mapa de seleções e helpers de status.
 * Fonte de dados: openfootball/worldcup.json (2026), via /api/live com
 * cache server-side e fallback para data/worldcup-2026.json.
 * Placares são preenchidos pela comunidade openfootball após cada partida —
 * o minuto exibido em jogos ao vivo é estimado a partir do horário de início.
 */

export interface RawGoal {
  name: string
  minute: string
}

export interface RawMatch {
  round: string
  date: string // YYYY-MM-DD
  time?: string // ex: "13:00 UTC-6"
  team1: string
  team2: string
  group?: string // ex: "Group A" (só fase de grupos)
  ground?: string
  score?: {
    ft?: [number, number]
    ht?: [number, number]
    et?: [number, number]
    p?: [number, number]
  }
  goals1?: RawGoal[]
  goals2?: RawGoal[]
}

export interface WorldCupData {
  name: string
  matches: RawMatch[]
}

export type MatchStatus = 'upcoming' | 'live' | 'halftime' | 'awaiting' | 'finished'

/** Seleção classificada: nome pt-BR + bandeira emoji. */
interface TeamInfo {
  pt: string
  flag: string
}

const TEAMS: Record<string, TeamInfo> = {
  'Algeria':              { pt: 'Argélia',            flag: '🇩🇿' },
  'Argentina':            { pt: 'Argentina',          flag: '🇦🇷' },
  'Australia':            { pt: 'Austrália',          flag: '🇦🇺' },
  'Austria':              { pt: 'Áustria',            flag: '🇦🇹' },
  'Belgium':              { pt: 'Bélgica',            flag: '🇧🇪' },
  'Bosnia & Herzegovina': { pt: 'Bósnia',             flag: '🇧🇦' },
  'Brazil':               { pt: 'Brasil',             flag: '🇧🇷' },
  'Canada':               { pt: 'Canadá',             flag: '🇨🇦' },
  'Cape Verde':           { pt: 'Cabo Verde',         flag: '🇨🇻' },
  'Colombia':             { pt: 'Colômbia',           flag: '🇨🇴' },
  'Croatia':              { pt: 'Croácia',            flag: '🇭🇷' },
  'Curaçao':              { pt: 'Curaçao',            flag: '🇨🇼' },
  'Czech Republic':       { pt: 'Tchéquia',           flag: '🇨🇿' },
  'DR Congo':             { pt: 'RD Congo',           flag: '🇨🇩' },
  'Ecuador':              { pt: 'Equador',            flag: '🇪🇨' },
  'Egypt':                { pt: 'Egito',              flag: '🇪🇬' },
  'England':              { pt: 'Inglaterra',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'France':               { pt: 'França',             flag: '🇫🇷' },
  'Germany':              { pt: 'Alemanha',           flag: '🇩🇪' },
  'Ghana':                { pt: 'Gana',               flag: '🇬🇭' },
  'Haiti':                { pt: 'Haiti',              flag: '🇭🇹' },
  'Iran':                 { pt: 'Irã',                flag: '🇮🇷' },
  'Iraq':                 { pt: 'Iraque',             flag: '🇮🇶' },
  'Ivory Coast':          { pt: 'Costa do Marfim',    flag: '🇨🇮' },
  'Japan':                { pt: 'Japão',              flag: '🇯🇵' },
  'Jordan':               { pt: 'Jordânia',           flag: '🇯🇴' },
  'Mexico':               { pt: 'México',             flag: '🇲🇽' },
  'Morocco':              { pt: 'Marrocos',           flag: '🇲🇦' },
  'Netherlands':          { pt: 'Holanda',            flag: '🇳🇱' },
  'New Zealand':          { pt: 'Nova Zelândia',      flag: '🇳🇿' },
  'Norway':               { pt: 'Noruega',            flag: '🇳🇴' },
  'Panama':               { pt: 'Panamá',             flag: '🇵🇦' },
  'Paraguay':             { pt: 'Paraguai',           flag: '🇵🇾' },
  'Portugal':             { pt: 'Portugal',           flag: '🇵🇹' },
  'Qatar':                { pt: 'Catar',              flag: '🇶🇦' },
  'Saudi Arabia':         { pt: 'Arábia Saudita',     flag: '🇸🇦' },
  'Scotland':             { pt: 'Escócia',            flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'Senegal':              { pt: 'Senegal',            flag: '🇸🇳' },
  'South Africa':         { pt: 'África do Sul',      flag: '🇿🇦' },
  'South Korea':          { pt: 'Coreia do Sul',      flag: '🇰🇷' },
  'Spain':                { pt: 'Espanha',            flag: '🇪🇸' },
  'Sweden':               { pt: 'Suécia',             flag: '🇸🇪' },
  'Switzerland':          { pt: 'Suíça',              flag: '🇨🇭' },
  'Tunisia':              { pt: 'Tunísia',            flag: '🇹🇳' },
  'Turkey':               { pt: 'Turquia',            flag: '🇹🇷' },
  'USA':                  { pt: 'Estados Unidos',     flag: '🇺🇸' },
  'Uruguay':              { pt: 'Uruguai',            flag: '🇺🇾' },
  'Uzbekistan':           { pt: 'Uzbequistão',        flag: '🇺🇿' },
}

/** Nome de exibição pt-BR. Placeholders do mata-mata viram rótulos legíveis. */
export function teamName(raw: string): string {
  const known = TEAMS[raw]
  if (known) return known.pt
  // "1A" → "1º do Grupo A"; "2B" → "2º do Grupo B"
  const groupPos = raw.match(/^([123])([A-L])$/)
  if (groupPos) return `${groupPos[1]}º do Grupo ${groupPos[2]}`
  // "3A/B/C/D/F" → "3º de A/B/C/D/F"
  if (raw.startsWith('3') && raw.includes('/')) return `3º de ${raw.slice(1)}`
  // "W73" → "Vencedor J73"; "L101" → "Perdedor J101"
  const wl = raw.match(/^([WL])(\d+)$/)
  if (wl) return `${wl[1] === 'W' ? 'Vencedor' : 'Perdedor'} J${wl[2]}`
  return raw
}

export function teamFlag(raw: string): string {
  return TEAMS[raw]?.flag ?? '⚽'
}

export function isPlaceholder(raw: string): boolean {
  return !TEAMS[raw]
}

/** Rótulo pt-BR da fase. Fase de grupos usa o grupo; mata-mata usa o round. */
export function stageLabel(m: RawMatch): string {
  if (m.group) return m.group.replace('Group', 'Grupo')
  switch (m.round) {
    case 'Round of 32':           return '16 avos de final'
    case 'Round of 16':           return 'Oitavas de final'
    case 'Quarter-final':         return 'Quartas de final'
    case 'Semi-final':            return 'Semifinal'
    case 'Match for third place': return 'Disputa de 3º lugar'
    case 'Final':                 return 'Final'
    default:                      return m.round
  }
}

/** Converte date + time ("13:00 UTC-6") em Date. Sem time → meio-dia UTC. */
export function kickoff(m: RawMatch): Date {
  if (!m.time) return new Date(`${m.date}T12:00:00Z`)
  const match = m.time.match(/^(\d{2}):(\d{2}) UTC([+-]\d{1,2})$/)
  if (!match) return new Date(`${m.date}T12:00:00Z`)
  const [, hh, mm, off] = match
  const offset = `${off!.length === 2 ? off![0] + '0' + off![1] : off}:00`
  return new Date(`${m.date}T${hh}:${mm}:00${offset}`)
}

const LIVE_WINDOW_MIN = 150 // 90' + intervalo + acréscimos/prorrogação curta

export function matchStatus(m: RawMatch, now: Date): MatchStatus {
  if (m.score?.ft) return 'finished'
  const ko = kickoff(m).getTime()
  const elapsedMin = (now.getTime() - ko) / 60000
  if (elapsedMin < 0) return 'upcoming'
  if (elapsedMin > LIVE_WINDOW_MIN) return 'awaiting' // sem placar publicado ainda
  if (elapsedMin > 45 && elapsedMin <= 62) return 'halftime'
  return 'live'
}

/** Minuto estimado de jogo (sem dados ao vivo reais — estimativa pelo relógio). */
export function estimatedMinute(m: RawMatch, now: Date): string {
  const elapsedMin = Math.floor((now.getTime() - kickoff(m).getTime()) / 60000)
  if (elapsedMin <= 45) return `${Math.max(1, elapsedMin)}'`
  if (elapsedMin <= 62) return 'Intervalo'
  const second = Math.min(90, elapsedMin - 17)
  return second >= 90 ? "90'+" : `${second}'`
}

/** Horário de início no fuso local do usuário, ex: "16:00". */
export function kickoffLocal(m: RawMatch): string {
  return kickoff(m).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** Datas (YYYY-MM-DD, fuso local) que têm pelo menos um jogo, ordenadas. */
export function matchDates(matches: RawMatch[]): string[] {
  const dates = new Set(matches.map(m => kickoff(m).toLocaleDateString('en-CA')))
  return [...dates].sort()
}

/** Jogos de uma data (no fuso local do usuário), ordenados por horário. */
export function matchesOnDate(matches: RawMatch[], date: string): RawMatch[] {
  return matches
    .filter(m => kickoff(m).toLocaleDateString('en-CA') === date)
    .sort((a, b) => kickoff(a).getTime() - kickoff(b).getTime())
}

/** Placar final exibível: prorrogação tem precedência; pênaltis anotados à parte. */
export function displayScore(m: RawMatch): { home: number; away: number; note?: string } | null {
  if (!m.score?.ft) return null
  const [h, a] = m.score.et ?? m.score.ft
  let note: string | undefined
  if (m.score.p) note = `pên. ${m.score.p[0]}–${m.score.p[1]}`
  else if (m.score.et) note = 'prorrogação'
  return { home: h!, away: a!, note }
}

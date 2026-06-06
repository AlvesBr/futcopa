/**
 * Seed the local Supabase with players and puzzles from data/puzzles.json.
 * Fetches verified photo URLs from the Wikipedia REST API.
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed_local.ts
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import puzzlesRaw from '../data/puzzles.json' assert { type: 'json' }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

interface PuzzlePlayer {
  player_id: string
  name: string
  value: number
  correct_rank: number
  correct_level: number
  photo_url?: string | null
}
interface Puzzle {
  id: string
  date: string
  category: string
  description?: string
  difficulty: string
  source?: string
  players: PuzzlePlayer[]
}

/* Country inference from player_id suffix */
const COUNTRY_MAP: Record<string, { country: string; country_code: string }> = {
  '-arg': { country: 'Argentina',   country_code: 'AR' },
  '-bra': { country: 'Brasil',      country_code: 'BR' },
  '-ger': { country: 'Alemanha',    country_code: 'DE' },
  '-fra': { country: 'França',      country_code: 'FR' },
  '-por': { country: 'Portugal',    country_code: 'PT' },
  '-eng': { country: 'Inglaterra',  country_code: 'GB' },
  '-ita': { country: 'Itália',      country_code: 'IT' },
  '-esp': { country: 'Espanha',     country_code: 'ES' },
  '-ned': { country: 'Holanda',     country_code: 'NL' },
  '-cro': { country: 'Croácia',     country_code: 'HR' },
  '-mar': { country: 'Marrocos',    country_code: 'MA' },
  '-mex': { country: 'México',      country_code: 'MX' },
  '-pol': { country: 'Polônia',     country_code: 'PL' },
  '-hun': { country: 'Hungria',     country_code: 'HU' },
  '-uru': { country: 'Uruguai',     country_code: 'UY' },
  '-col': { country: 'Colômbia',    country_code: 'CO' },
  '-bel': { country: 'Bélgica',     country_code: 'BE' },
}
function inferCountry(playerId: string) {
  for (const [suffix, info] of Object.entries(COUNTRY_MAP)) {
    if (playerId.endsWith(suffix)) return info
  }
  return { country: 'Desconhecido', country_code: null }
}

/**
 * Maps player_id → Wikipedia article title.
 * Only players with a known article are listed; others get null photo.
 */
const WIKIPEDIA_ARTICLES: Record<string, string> = {
  'messi-arg':      'Lionel Messi',
  'mbappe-fra':     'Kylian Mbappé',
  'ronaldo-bra':    'Ronaldo (Brazilian footballer)',
  'pele-bra':       'Pelé',
  'maradona-arg':   'Diego Maradona',
  'ronaldo-c-por':  'Cristiano Ronaldo',
  'klose-ger':      'Miroslav Klose',
  'neymar-bra':     'Neymar',
  'muller-t-ger':   'Thomas Müller',
  'modric-cro':     'Luka Modrić',
  'benzema-fra':    'Karim Benzema',
  'kane-eng':       'Harry Kane',
  'griezmann-fra':  'Antoine Griezmann',
  'kroos-ger':      'Toni Kroos',
  'neuer-ger':      'Manuel Neuer',
  'giroud-fra':     'Olivier Giroud',
  'muller-g-ger':   'Gerd Müller',
  'zidane-fra':     'Zinedine Zidane',
  'buffon-ita':     'Gianluigi Buffon',
  'robben-ned':     'Arjen Robben',
  'suarez-uru':     'Luis Suárez',
  'casillas-esp':   'Iker Casillas',
  'beckenbauer-ger':'Franz Beckenbauer',
  'cafu-bra':       'Cafu',
  'cannavaro-ita':  'Fabio Cannavaro',
  'matthaus-ger':   'Lothar Matthäus',
  'eusebio-por':    'Eusébio',
  'rodriguez-col':  'James Rodríguez',
  'vanpersie-ned':  'Robin van Persie',
  'ronaldinho-bra': 'Ronaldinho',
  'rivaldo-bra':    'Rivaldo',
  'romario-bra':    'Romário',
  'debruyne-bel':   'Kevin De Bruyne',
  'baggio-ita':     'Roberto Baggio',
  'alvarez-arg':    'Julián Álvarez',
  'hakimi-mar':     'Achraf Hakimi',
  'bounou-mar':     'Yassine Bounou',
  'livakovic-cro':  'Dominik Livaković',
  'courtois-bel':   'Thibaut Courtois',
  'lloris-fra':     'Hugo Lloris',
  'ramos-esp':      'Sergio Ramos',
  'fontaine-fra':   'Just Fontaine',
  'kocsis-hun':     'Sándor Kocsis',
  'puskas-hun':     'Ferenc Puskás',
  'lineker-eng':    'Gary Lineker',
  'klinsmann-ger':  'Jürgen Klinsmann',
  'lahm-ger':       'Philipp Lahm',
}

/** Fetch thumbnail URL from Wikipedia REST API. Returns null on any failure. */
async function fetchWikipediaPhoto(article: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`,
      {
        headers: {
          'User-Agent': 'FutCopa-seed/1.0 (https://github.com/AlvesBr/futcopa; seed script)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!res.ok) return null
    const data = await res.json() as { thumbnail?: { source: string } }
    return data.thumbnail?.source ?? null
  } catch {
    return null
  }
}

/** Fetch flag image from Wikimedia Commons via Wikipedia article for the national team. */
const FLAG_ARTICLES: Record<string, string> = {
  'selecao-bra': 'Brazil national football team',
  'selecao-ger': 'Germany national football team',
  'selecao-ita': 'Italy national football team',
  'selecao-arg': 'Argentina national football team',
  'selecao-fra': 'France national football team',
  'selecao-eng': 'England national football team',
  'selecao-esp': 'Spain national football team',
  'selecao-ned': 'Netherlands national football team',
  'selecao-por': 'Portugal national football team',
  'selecao-uru': 'Uruguay national football team',
  'selecao-mex': 'Mexico national football team',
  'selecao-bel': 'Belgium national football team',
  'selecao-col': 'Colombia national football team',
}

async function buildPhotoCache(playerIds: string[]): Promise<Map<string, string | null>> {
  const cache = new Map<string, string | null>()
  const articleMap = { ...WIKIPEDIA_ARTICLES, ...FLAG_ARTICLES }
  const toFetch = playerIds.filter(id => articleMap[id])

  if (toFetch.length === 0) return cache

  console.log(`  Fetching ${toFetch.length} photos from Wikipedia API…`)

  for (const playerId of toFetch) {
    const article = articleMap[playerId]!
    const photoUrl = await fetchWikipediaPhoto(article)
    cache.set(playerId, photoUrl)
    const status = photoUrl ? '✓' : '✗'
    process.stdout.write(`    ${status} ${article}\n`)
    /* Tiny delay to be polite to Wikipedia API */
    await new Promise(r => setTimeout(r, 120))
  }

  return cache
}

async function main() {
  const puzzles = puzzlesRaw as Puzzle[]

  /* ── 1. Collect unique players ─────────────────────────── */
  const playerMap = new Map<string, {
    id: string; name: string; country: string; country_code: string | null
  }>()
  for (const puzzle of puzzles) {
    for (const p of puzzle.players) {
      if (!playerMap.has(p.player_id)) {
        const { country, country_code } = inferCountry(p.player_id)
        playerMap.set(p.player_id, {
          id: p.player_id,
          name: p.name.replace(/ \(\d{4}\)$/, '').trim(),
          country,
          country_code,
        })
      }
    }
  }

  const playerIds = Array.from(playerMap.keys())
  console.log(`Found ${playerIds.length} unique players.`)

  /* ── 2. Fetch verified photo URLs ──────────────────────── */
  const photoCache = await buildPhotoCache(playerIds)
  const withPhoto = Array.from(photoCache.values()).filter(Boolean).length
  const withoutPhoto = playerIds.length - withPhoto
  console.log(`  ${withPhoto} photos fetched, ${withoutPhoto} will use initials fallback\n`)

  /* ── 3. Upsert players ─────────────────────────────────── */
  const players = Array.from(playerMap.values()).map(p => ({
    ...p,
    photo_url: photoCache.get(p.id) ?? null,
  }))

  console.log(`Inserting ${players.length} players…`)
  const { error: playerError } = await supabase
    .from('players')
    .upsert(players, { onConflict: 'id' })
  if (playerError) { console.error('Player error:', playerError.message); process.exit(1) }
  console.log(`✓ ${players.length} players inserted\n`)

  /* ── 4. Upsert puzzles (enrich JSONB with photo_url) ───── */
  console.log(`Inserting ${puzzles.length} puzzles…`)
  const puzzleRows = puzzles.map(puzzle => ({
    date: puzzle.date,
    category: puzzle.category,
    description: puzzle.description ?? null,
    difficulty: puzzle.difficulty,
    source: puzzle.source ?? null,
    players: puzzle.players.map(p => ({
      ...p,
      photo_url: photoCache.get(p.player_id) ?? null,
    })),
  }))

  const { error: puzzleError } = await supabase
    .from('puzzles')
    .upsert(puzzleRows, { onConflict: 'date' })
  if (puzzleError) { console.error('Puzzle error:', puzzleError.message); process.exit(1) }
  console.log(`✓ ${puzzles.length} puzzles inserted\n`)

  console.log('Seed complete!')
}

main().catch(e => { console.error(e); process.exit(1) })

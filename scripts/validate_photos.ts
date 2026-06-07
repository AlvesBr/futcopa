/**
 * Validates all photo_url entries in the players table.
 * Makes a HEAD request for each URL and marks broken ones as null.
 *
 * Usage:  npx tsx --env-file=.env.local scripts/validate_photos.ts
 * Flags:  --dry-run   print results without writing to DB
 *         --fix       write null for broken URLs (default)
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

/* Browser-like headers to avoid bot-blocking */
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.google.com/',
}

async function checkUrl(photoUrl: string): Promise<boolean> {
  try {
    const res = await fetch(photoUrl, {
      method: 'HEAD',
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) return true
    /* Some servers don't support HEAD — retry with GET (abort after headers) */
    if (res.status === 405 || res.status === 400) {
      const res2 = await fetch(photoUrl, {
        method: 'GET',
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(8000),
      })
      return res2.ok && (res2.headers.get('content-type') ?? '').startsWith('image/')
    }
    return false
  } catch {
    return false
  }
}

async function main() {
  const { data: players, error } = await supabase
    .from('players')
    .select('id, name, photo_url')
    .not('photo_url', 'is', null)
    .order('name')

  if (error) { console.error(error.message); process.exit(1) }
  if (!players?.length) { console.log('No players with photo_url.'); return }

  console.log(`Validating ${players.length} photo URLs…\n`)

  const results = { ok: 0, broken: [] as { id: string; name: string; url: string }[] }

  for (const player of players) {
    const ok = await checkUrl(player.photo_url!)
    const status = ok ? '✓' : '✗'
    const label = ok ? 'ok' : 'BROKEN'
    console.log(`  ${status} ${player.name.padEnd(28)} ${label}`)
    if (ok) {
      results.ok++
    } else {
      results.broken.push({ id: player.id, name: player.name, url: player.photo_url! })
    }
  }

  console.log(`\n─────────────────────────────────────`)
  console.log(`  OK:     ${results.ok}`)
  console.log(`  Broken: ${results.broken.length}`)

  if (results.broken.length === 0) {
    console.log('\nAll photos valid!')
    return
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] Would clear photo_url for:')
    results.broken.forEach(b => console.log(`  - ${b.name} (${b.id})`))
    return
  }

  console.log('\nClearing broken photo_url entries…')
  const brokenIds = results.broken.map(b => b.id)
  const { error: updateError } = await supabase
    .from('players')
    .update({ photo_url: null })
    .in('id', brokenIds)

  if (updateError) {
    console.error('Update error:', updateError.message)
    process.exit(1)
  }
  console.log(`✓ Cleared ${brokenIds.length} broken URLs from players table`)
  console.log('\nRe-run seed_local.ts if you want to restore URLs after fixing them.')
}

main().catch(e => { console.error(e); process.exit(1) })

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * In local dev, the raw Supabase URL is localhost:54321. Chrome's Private
 * Network Access policy blocks cross-port localhost requests. Routing through
 * the Next.js origin (/supabase-proxy → localhost:54321) avoids this, because
 * the browser sees a same-origin fetch — no PNA check, no CORS preflight.
 * In production the Supabase URL is a public HTTPS host, so we skip the proxy.
 */
function getClientUrl(): string {
  if (typeof window !== 'undefined' && supabaseUrl.startsWith('http://localhost')) {
    return `${window.location.origin}/supabase-proxy`
  }
  return supabaseUrl
}

/** Client-side Supabase client — safe to use in Client Components. */
export function createBrowserClient(): SupabaseClient {
  return _createBrowserClient(getClientUrl(), supabaseAnonKey)
}

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 * Reads cookies via the provided getter/setter to maintain session state.
 * Import `cookies` from 'next/headers' and pass it here.
 */
export async function createServerClient(
  cookieStore: Awaited<ReturnType<typeof import('next/headers').cookies>>
): Promise<SupabaseClient> {
  const { createServerClient: _createServerClient } = await import('@supabase/ssr')
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
        })
      },
    },
  })
}

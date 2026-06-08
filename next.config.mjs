/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },

  /**
   * In local dev the browser fetches Supabase from localhost:54321.
   * Chrome's Private Network Access (PNA) policy blocks cross-port localhost
   * fetches unless the server returns Access-Control-Allow-Private-Network.
   * Proxying through the Next.js origin (same-origin = no PNA check) avoids
   * the issue without any Chrome flag or CORS workaround.
   *
   * In production NEXT_PUBLIC_SUPABASE_URL is a public HTTPS URL, so this
   * rewrite path is never taken (the source pattern won't match).
   */
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    if (!supabaseUrl.startsWith('http://localhost')) return []
    return [
      {
        source: '/supabase-proxy/:path*',
        destination: `${supabaseUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig

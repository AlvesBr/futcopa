'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

interface AvatarProps {
  src?: string | null
  name: string
  flag?: string
  playerId?: string
  size?: number
  className?: string
}

const FC_COUNTRY_GRAD: Record<string, string> = {
  "Alemanha":  "linear-gradient(135deg,#2b3b33,#16261e)",
  "Brasil":    "linear-gradient(135deg,#08b65a,#06934a)",
  "França":    "linear-gradient(135deg,#15b8e8,#0a93bd)",
  "Argentina": "linear-gradient(135deg,#6fd9f5,#15b8e8)",
  "Hungria":   "linear-gradient(135deg,#ff2e63,#e01250)",
  "Inglaterra":"linear-gradient(135deg,#ff9e1b,#f2ab00)"
}

export const SUFFIX_TO_COUNTRY: Record<string, { country: string, flag: string }> = {
  ger: { country: "Alemanha", flag: "🇩🇪" },
  bra: { country: "Brasil", flag: "🇧🇷" },
  fra: { country: "França", flag: "🇫🇷" },
  arg: { country: "Argentina", flag: "🇦🇷" },
  hun: { country: "Hungria", flag: "🇭🇺" },
  eng: { country: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  ned: { country: "Holanda", flag: "🇳🇱" },
  ecu: { country: "Equador", flag: "🇪🇨" },
  irn: { country: "Irã", flag: "🇮🇷" },
  bel: { country: "Bélgica", flag: "🇧🇪" },
  col: { country: "Colômbia", flag: "🇨🇴" },
  por: { country: "Portugal", flag: "🇵🇹" },
  per: { country: "Peru", flag: "🇵🇪" },
  ita: { country: "Itália", flag: "🇮🇹" },
  pol: { country: "Polônia", flag: "🇵🇱" },
  mex: { country: "México", flag: "🇲🇽" },
  yug: { country: "Iugoslávia/Sérvia", flag: "🏴" },
  cro: { country: "Croácia", flag: "🇭🇷" },
  mar: { country: "Marrocos", flag: "🇲🇦" },
  esp: { country: "Espanha", flag: "🇪🇸" },
  uru: { country: "Uruguai", flag: "🇺🇾" },
  usa: { country: "Estados Unidos", flag: "🇺🇸" }
}

export function resolveCountryInfo(playerId?: string, flag?: string) {
  let resolvedFlag = flag
  let resolvedCountry = undefined
  if (!resolvedFlag && playerId) {
    const suffix = playerId.split('-').at(-1)?.toLowerCase()
    if (suffix && SUFFIX_TO_COUNTRY[suffix]) {
      resolvedFlag = SUFFIX_TO_COUNTRY[suffix].flag
      resolvedCountry = SUFFIX_TO_COUNTRY[suffix].country
    }
  }
  return { flag: resolvedFlag, country: resolvedCountry }
}

export function initials(name: string) {
  return name
    .replace(/[^A-Za-zÀ-ÿ. ]/g, '')
    .split(/[ .]+/)
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = [
  '#6fc01a', '#15b8e8', '#ff2e63', '#ffc21e',
  '#9bd933', '#ff7aa3', '#6fd9f5', '#f2ab00',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length] as string
}

export function fcGrad(country?: string | null, name?: string) {
  if (country && FC_COUNTRY_GRAD[country]) {
    return FC_COUNTRY_GRAD[country]
  }
  const color = name ? avatarColor(name) : '#4a8b60'
  return `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, #000))`
}

async function fetchWikipediaThumb(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
      { signal: AbortSignal.timeout(5_000) }
    )
    if (!res.ok) return null
    const data = await res.json() as { thumbnail?: { source: string } }
    return data.thumbnail?.source ?? null
  } catch {
    return null
  }
}

type ImgState =
  | { phase: 'primary' }
  | { phase: 'fetching' }
  | { phase: 'fallback'; url: string }
  | { phase: 'failed' }

export function Avatar({ src, name, flag, playerId, size = 40, className }: AvatarProps) {
  const [imgState, setImgState] = useState<ImgState>({ phase: 'primary' })
  const { flag: resolvedFlag, country: resolvedCountry } = resolveCountryInfo(playerId, flag)
  const background = fcGrad(resolvedCountry, name)

  const handlePrimaryError = async () => {
    setImgState({ phase: 'fetching' })
    const url = await fetchWikipediaThumb(name)
    setImgState(url ? { phase: 'fallback', url } : { phase: 'failed' })
  }

  const handleFallbackError = () => setImgState({ phase: 'failed' })

  const showPrimary  = !!src && imgState.phase === 'primary'
  const showFallback = imgState.phase === 'fallback'
  const showFetching = imgState.phase === 'fetching'
  const showInitials = !src || imgState.phase === 'failed'

  return (
    <span
      className={cn('relative flex-none rounded-sm grid place-items-center overflow-hidden', className)}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--r-sm)',
        background
      }}
    >
      {showPrimary && (
        <img
          src={src!}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={handlePrimaryError}
          className="w-full h-full object-cover"
        />
      )}

      {showFallback && (
        <img
          src={imgState.url}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          onError={handleFallbackError}
          className="w-full h-full object-cover"
        />
      )}

      {/* Pulsing initials while Wikipedia fetch is in-flight */}
      {(showFetching || showInitials) && (
        <span
          aria-hidden
          className={cn(
            'w-full h-full grid place-items-center text-white font-bold',
            showFetching && 'animate-pulse opacity-60',
          )}
          style={{ fontSize: size * 0.32 }}
        >
          {initials(name)}
        </span>
      )}

      {resolvedFlag && (
        <span
          className="absolute bottom-[-3px] right-[-4px] leading-none"
          style={{ fontSize: size * 0.375 }}
          aria-label={`Bandeira de ${name}`}
        >
          {resolvedFlag}
        </span>
      )}
    </span>
  )
}

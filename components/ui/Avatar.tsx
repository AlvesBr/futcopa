'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

interface AvatarProps {
  src?: string | null
  name: string
  flag?: string
  size?: number
  className?: string
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
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

export function Avatar({ src, name, flag, size = 40, className }: AvatarProps) {
  const [imgState, setImgState] = useState<ImgState>({ phase: 'primary' })
  const color = avatarColor(name)

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
      style={{ width: size, height: size, borderRadius: 'var(--r-sm)', background: color }}
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

      {flag && (
        <span
          className="absolute bottom-[-3px] right-[-4px] leading-none"
          style={{ fontSize: size * 0.375 }}
          aria-label={`Bandeira de ${name}`}
        >
          {flag}
        </span>
      )}
    </span>
  )
}

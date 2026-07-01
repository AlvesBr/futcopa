'use client'

interface FeedbackMarkProps {
  kind: 'correct' | 'incorrect' | 'empty'
  size?: number
}

export function FeedbackMark({ kind, size = 22 }: FeedbackMarkProps) {
  if (kind === 'correct') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="11" fill="var(--success)" />
        <path
          d="M7 12.5l3 3 6-7"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (kind === 'incorrect') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          rx="3"
          transform="rotate(45 12 12)"
          fill="var(--error)"
        />
        <path
          d="M9 9l6 6M15 9l-6 6"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return null
}

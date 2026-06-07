interface CategoryBadgeProps {
  category: string
  description?: string | null
}

export function CategoryBadge({ category, description }: CategoryBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 px-4">
      <span className="inline-flex items-center gap-2 bg-surface-2 border border-[var(--border)] rounded-pill px-4 py-1.5 fc-label font-semibold text-primary">
        ⚽ {category}
      </span>
      {description && (
        <p className="fc-caption text-fg-2 text-center max-w-sm">{description}</p>
      )}
    </div>
  )
}

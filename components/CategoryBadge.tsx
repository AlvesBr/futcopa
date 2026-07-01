import { Icon } from '@/components/ui'

interface CategoryBadgeProps {
  category:    string
  description?: string | null
  puzzleNo?:   number | string
}

export function CategoryBadge({ category, description, puzzleNo }: CategoryBadgeProps) {
  return (
    <div className="fc-cat">
      {/* Festival gradient icon */}
      <div className="fc-cat-icon" aria-hidden="true">
        <Icon name="trophy" size={20} />
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="fc-cat-label">
          {puzzleNo ? `#${puzzleNo} · ` : ''}Categoria do dia
        </p>
        <p className="fc-cat-title truncate">{category}</p>
        {description && (
          <p className="fc-cat-desc line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  )
}

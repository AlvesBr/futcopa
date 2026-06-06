export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-pill border-4 border-[var(--border)] border-t-primary animate-spin"
        role="status"
        aria-label="Carregando…"
      />
    </div>
  )
}

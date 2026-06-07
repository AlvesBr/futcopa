import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="text-6xl">🏟️</span>
      <h1 className="fc-title text-fg">Puzzle não encontrado</h1>
      <p className="fc-body text-fg-2 max-w-xs">
        Não há puzzle para esta data. Tente o puzzle de hoje ou aguarde a próxima edição.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-[var(--on-primary)] px-6 py-3 rounded-pill font-bold transition-[filter] duration-[var(--dur-1)] hover:brightness-105"
      >
        Jogar hoje
      </Link>
    </main>
  )
}

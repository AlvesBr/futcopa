/** Joins class names, filtering falsy values. Lightweight clsx-like util. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

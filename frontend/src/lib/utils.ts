// Simple cn utility (className merge helper)
export function cn(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

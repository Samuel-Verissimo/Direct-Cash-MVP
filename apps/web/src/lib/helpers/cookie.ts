export function getLocaleCookie(): string {
  if (typeof document === 'undefined') return 'pt-br';
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1] ?? 'pt-br';
}

export function setLocaleCookie(locale: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

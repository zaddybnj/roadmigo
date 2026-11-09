/**
 * Public URL of the web app (e.g. https://roadmigo.app). Set VITE_SITE_URL at build
 * time; inside the native app window.location.origin is capacitor://localhost,
 * which is useless in share links and auth emails.
 */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin;

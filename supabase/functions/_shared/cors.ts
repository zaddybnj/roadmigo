// Shared CORS + site config for edge functions.
//
// Secrets (set with `supabase secrets set ...`):
//   SITE_URL         Public URL of the web app, e.g. https://roadmigo.app
//                    (used for Stripe return URLs)
//   ALLOWED_ORIGINS  Optional extra comma-separated origins, e.g. preview deploys

const NATIVE_APP_ORIGINS = [
  'capacitor://localhost', // iOS app
  'https://localhost',     // Android app
  'http://localhost',
];

const DEV_ORIGINS = ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080'];

const trimSlash = (s: string) => s.replace(/\/+$/, '');

export const SITE_URL = trimSlash(Deno.env.get('SITE_URL') ?? '');

const allowedOrigins = new Set(
  [
    SITE_URL,
    ...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(','),
    ...NATIVE_APP_ORIGINS,
    ...DEV_ORIGINS,
  ]
    .map(o => trimSlash(o.trim()))
    .filter(Boolean),
);

export const isAllowedOrigin = (origin: string | null): origin is string =>
  !!origin && allowedOrigins.has(trimSlash(origin));

export function getCorsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : SITE_URL || 'null',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

/**
 * Where Stripe should send the user back to. Web users return to the site they
 * came from; native-app users go to SITE_URL (Stripe can't redirect to capacitor://).
 */
export function returnBaseUrl(origin: string | null): string {
  if (isAllowedOrigin(origin) && /^https?:\/\//.test(origin) && !NATIVE_APP_ORIGINS.includes(trimSlash(origin))) {
    return trimSlash(origin);
  }
  if (SITE_URL) return SITE_URL;
  throw new Error('SITE_URL is not set');
}

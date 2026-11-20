// Kunci situs
export const config = { matcher: '/:path*' };

// Cek login
export default function middleware(request) {
  const user = process.env.BASIC_AUTH_USER, pass = process.env.BASIC_AUTH_PASSWORD;
  const header = request.headers.get('authorization') || '';
  if (user && pass && header.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(header.slice(6)); } catch {}
    const split = decoded.indexOf(':');
    if (split >= 0 && decoded.slice(0, split) === user && decoded.slice(split + 1) === pass) return;
  }
  return new Response('Login diperlukan.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Rampage Rex", charset="UTF-8"', 'Cache-Control': 'no-store' }
  });
}

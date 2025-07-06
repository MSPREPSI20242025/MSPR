import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtenir la locale depuis l'URL ou les headers
  const pathname = request.nextUrl.pathname;
  
  // Vérifier si le chemin commence déjà par une locale
  const pathnameIsMissingLocale = ['fr', 'de', 'it', 'en'].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Si aucune locale n'est détectée dans l'URL, ne pas rediriger
  // Laisser le système client gérer la détection de langue
  if (pathnameIsMissingLocale) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Matcher pour exclure les fichiers statiques et les API
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
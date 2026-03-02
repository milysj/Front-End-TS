import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/home',
  '/recuperar-senha',
  '/esquecisenha',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se a rota é pública
  const isPublicRoute = PUBLIC_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Se é rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para rotas protegidas, a verificação será feita no cliente via ProtectedRoute
  // O middleware apenas permite a passagem, pois localStorage não está disponível aqui
  // O ProtectedRoute fará a verificação real no cliente
  return NextResponse.next();
}

// Configurar quais rotas devem ser interceptadas pelo middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


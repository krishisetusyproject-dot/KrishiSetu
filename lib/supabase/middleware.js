import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const publicPaths = new Set(['/login', '/register', '/buyer/register']);

  // Protected route prefixes. Public registration and login screens should be accessible without auth.
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/farmer') || path.startsWith('/buyer');

  if (isProtectedPath && !publicPaths.has(path)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.redirect(loginUrl);
    }

    // Role verification
    let userRole = user.user_metadata?.role;
    if (!userRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .or(`id.eq.${user.id},profile_id.eq.${user.id}`)
        .maybeSingle();
      userRole = profile?.role;
    }

    // RBAC Redirect Rules
    if (path.startsWith('/admin') && userRole !== 'admin') {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = userRole === 'farmer' ? '/farmer' : userRole === 'buyer' ? '/buyer' : '/login';
      return NextResponse.redirect(targetUrl);
    }

    if (path.startsWith('/farmer') && userRole === 'buyer') {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = '/buyer';
      return NextResponse.redirect(targetUrl);
    }

    if (path.startsWith('/buyer') && userRole === 'farmer') {
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = '/farmer';
      return NextResponse.redirect(targetUrl);
    }
  }

  return response;
}

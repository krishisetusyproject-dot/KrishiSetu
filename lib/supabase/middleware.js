import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const path = request.nextUrl.pathname;
  const publicPaths = new Set(['/login', '/register', '/buyer/register']);

  // ── Fast exit: skip auth entirely for public paths ──
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/farmer') || path.startsWith('/buyer');
  if (!isProtectedPath || publicPaths.has(path)) {
    return response;
  }

  // ── Only create Supabase client + call getUser() for protected routes ──
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const supabase = createServerClient(
    url,
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

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // The profile row is the authoritative role; JWT metadata can be stale.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('profile_id', user.id)
    .maybeSingle();
  const userRole = profile?.role || user.user_metadata?.role;

  if (profileError) {
    console.warn('Could not verify profile role; falling back to authenticated user metadata.', profileError);
  }

  if (!['admin', 'farmer', 'buyer'].includes(userRole)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // ── RBAC Redirect Rules ──
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

  return response;
}

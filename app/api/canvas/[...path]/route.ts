/**
 * Next.js catch-all proxy route for canvas-workspace API calls.
 * Forwards requests to the FastAPI backend, injecting the Clerk session token
 * obtained via auth() so the browser never makes direct cross-origin calls.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, 'GET');
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, 'POST');
}
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, 'PATCH');
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, 'DELETE');
}

async function proxy(
  request: NextRequest,
  params: { path: string[] },
  method: string
): Promise<NextResponse> {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const upstreamPath = params.path.join('/');
    const search = request.nextUrl.search;
    const upstream = `${BACKEND}/api/v1/canvas-workspace/${upstreamPath}${search}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body: BodyInit | undefined = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        // no body
      }
    }

    const res = await fetch(upstream, { method, headers, body });
    const data = await res.text();

    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[canvas-proxy] error:', err);
    return NextResponse.json({ detail: 'Proxy error' }, { status: 502 });
  }
}

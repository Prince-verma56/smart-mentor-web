/**
 * Next.js catch-all proxy route for canvas-workspace API calls.
 * Forwards requests to the FastAPI backend, injecting the Clerk session token
 * obtained via auth() so the browser never makes direct cross-origin calls.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace('localhost', '127.0.0.1');
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

    // 15 s hard timeout — prevents Next.js from hanging for 60 s and returning a 500
    const signal = AbortSignal.timeout(15_000);

    let res: Response;
    try {
      res = await fetch(upstream, { 
        method, 
        headers: { ...headers, 'Connection': 'close' }, 
        body, 
        signal,
        cache: 'no-store' 
      });
    } catch (fetchErr: any) {
      if (fetchErr?.name === 'TimeoutError' || fetchErr?.name === 'AbortError') {
        console.error(`[canvas-proxy] upstream timeout after 15s: ${upstream}`);
        return NextResponse.json(
          { detail: 'Canvas service did not respond in time. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchErr;
    }

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

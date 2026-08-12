/**
 * Next.js catch-all proxy route for learning-universe API calls.
 * Forwards requests to the FastAPI backend, injecting the Clerk session token
 * obtained via auth() so the browser never makes direct cross-origin calls.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace('localhost', '127.0.0.1');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(request, await params, 'POST');
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
    const upstream = `${BACKEND}/api/v1/learning-universe/${upstreamPath}${search}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const body = await request.text();

    const response = await fetch(upstream, {
      method,
      headers: { ...headers, 'Connection': 'close' },
      body: body ? body : undefined,
    });

    // Since this might be an SSE stream, we pipe the body back directly
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

  } catch (err: any) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}

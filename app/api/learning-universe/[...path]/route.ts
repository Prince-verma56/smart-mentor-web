/**
 * Next.js catch-all proxy route for learning-universe API calls.
 * Forwards requests to the FastAPI backend, injecting the Clerk session token
 * obtained via auth() so the browser never makes direct cross-origin calls.
 *
 * IMPORTANT: The SSE stream response.body pipe is wrapped in a safe ReadableStream
 * so that client disconnects (ECONNRESET / AbortError) are caught silently and do NOT
 * propagate as uncaughtExceptions that crash the Next.js dev server.
 *
 * NOTE: We do NOT pass `request.signal` to the upstream fetch because in Next.js
 * Edge Runtime the request signal is aborted immediately after the POST body is
 * consumed, which would cancel the SSE stream before any data arrives.
 * Instead we use a dedicated AbortController that fires only when the client
 * ReadableStream is explicitly cancelled by the browser.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BACKEND = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace('localhost', '127.0.0.1');

export const dynamic = 'force-dynamic';

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
  // Dedicated controller — only aborted when the client explicitly cancels the stream
  const upstreamAbort = new AbortController();

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

    // Read body before starting the stream (safe — body reading is fast)
    const body = await request.text().catch(() => '');

    // Do NOT pass request.signal here — it gets aborted after body consumption in Edge Runtime
    // and would kill the SSE stream before any data arrives.
    const response = await fetch(upstream, {
      method,
      headers: { ...headers, 'Connection': 'close' },
      body: body || undefined,
      signal: upstreamAbort.signal,
    });

    // Wrap the upstream SSE body in a safe ReadableStream.
    // Without this wrapper, an ECONNRESET from undici when the client disconnects
    // propagates as an uncaughtException and crashes the Next.js process.
    const upstreamBody = response.body;
    const safeStream = upstreamBody
      ? new ReadableStream({
          async start(controller) {
            const reader = upstreamBody.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  controller.close();
                  break;
                }
                controller.enqueue(value);
              }
            } catch (streamErr: any) {
              // Client disconnected (ECONNRESET / AbortError) — close silently.
              // Do NOT re-throw: that would become an uncaughtException.
              const isExpectedDisconnect =
                streamErr?.code === 'ECONNRESET' ||
                streamErr?.name === 'AbortError' ||
                streamErr?.name === 'TimeoutError' ||
                streamErr?.message?.includes('aborted');
              if (!isExpectedDisconnect) {
                console.error('[lu-proxy] unexpected stream error:', streamErr);
              }
              try { controller.close(); } catch { /* already closed */ }
            } finally {
              reader.releaseLock();
            }
          },
          cancel() {
            // Browser cancelled the stream (navigation away) — abort the upstream fetch
            upstreamAbort.abort();
          }
        })
      : null;

    return new NextResponse(safeStream, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (err: any) {
    upstreamAbort.abort();
    // Client disconnected before stream even started — suppress silently
    const isDisconnect =
      err?.code === 'ECONNRESET' ||
      err?.name === 'AbortError' ||
      err?.message?.includes('aborted');
    if (isDisconnect) {
      return new NextResponse(null, { status: 499 });
    }
    console.error('[lu-proxy] error:', err);
    return NextResponse.json({ detail: err.message || 'Proxy error' }, { status: 500 });
  }
}

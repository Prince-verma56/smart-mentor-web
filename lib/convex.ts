import { ConvexHttpClient } from "convex/browser";

const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://dummy.convex.cloud";

export const convexClient = new ConvexHttpClient(url);

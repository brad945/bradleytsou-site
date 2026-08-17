import { NextResponse } from "next/server";
import {
  addReaction,
  getReactions,
  isReactionSlug,
  reactionsConfigured,
  withinRateLimit,
} from "@/lib/reactions";

/**
 * **The site's first endpoint of its own.** Everything else here reads
 * somebody else's API from a server component; this is the one route visitors
 * can write to.
 *
 * No auth, deliberately — the whole point is a reaction that costs nothing.
 * What guards it instead: the slug is validated against a fixed list, so a
 * hand-written POST can't create keys, and there's a crude per-IP ceiling.
 *
 * `force-dynamic` because a cached count is a wrong count. Without it Next
 * would happily serve the first response it ever computed.
 */
export const dynamic = "force-dynamic";

/** 404 rather than an empty object when there's no store behind this. */
function unconfigured() {
  return NextResponse.json({ error: "reactions not configured" }, { status: 404 });
}

export async function GET() {
  if (!reactionsConfigured()) return unconfigured();
  const counts = await getReactions();
  if (!counts) return unconfigured();
  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  if (!reactionsConfigured()) return unconfigured();

  /*
   * Vercel sets `x-forwarded-for`; the client's address is the first entry,
   * the rest are proxies. Locally there's no header at all, hence the
   * fallback — which means the limit is shared by everyone in dev, and that's
   * fine, since dev isn't what's being protected.
   */
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (!(await withinRateLimit(ip))) {
    return NextResponse.json({ error: "slow down" }, { status: 429 });
  }

  let slug: unknown;
  try {
    slug = (await request.json())?.slug;
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  if (typeof slug !== "string" || !isReactionSlug(slug)) {
    return NextResponse.json({ error: "unknown reaction" }, { status: 400 });
  }

  const counts = await addReaction(slug);
  if (!counts) return unconfigured();
  return NextResponse.json({ counts });
}

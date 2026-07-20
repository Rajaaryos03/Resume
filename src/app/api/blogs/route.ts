import { NextRequest, NextResponse } from "next/server";
import { getPublishedBlogs } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "9", 10);

  try {
    const result = await getPublishedBlogs({ category, search, page, limit });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch blogs." }, { status: 500 });
  }
}

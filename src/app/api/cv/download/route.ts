import { NextResponse } from "next/server";
import { getActiveCV } from "@/lib/db";

export async function GET() {
  try {
    const cv = await getActiveCV();

    if (!cv) {
      return NextResponse.json(
        { error: "No CV available at this time." },
        { status: 404 }
      );
    }

    return NextResponse.redirect(cv.fileUrl, {
      headers: {
        "Content-Disposition": `attachment; filename="Raja_Aryos_CV.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch CV." }, { status: 500 });
  }
}

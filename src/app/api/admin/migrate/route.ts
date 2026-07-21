import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MIGRATIONS: Record<string, string> = {
  comment_reply_columns: `
    ALTER TABLE blog_comment ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES blog_comment(id) ON DELETE CASCADE;
    ALTER TABLE blog_comment ADD COLUMN IF NOT EXISTS is_owner_reply boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS blog_comment_parent_idx ON blog_comment(parent_id);
  `,
  blog_series: `
    CREATE TABLE IF NOT EXISTS blog_series (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      slug text NOT NULL UNIQUE,
      description text,
      cover_image_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE blog_series ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      CREATE POLICY "Public read series" ON blog_series FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    ALTER TABLE blog ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES blog_series(id) ON DELETE SET NULL;
    ALTER TABLE blog ADD COLUMN IF NOT EXISTS series_order integer;
  `,
  view_count: `
    ALTER TABLE blog ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0 NOT NULL;
  `,
  availability_status: `
    ALTER TABLE profile ADD COLUMN IF NOT EXISTS availability_status text;
  `,
};

export async function POST(req: NextRequest) {
  const { migration } = await req.json();
  const sql = MIGRATIONS[migration];
  if (!sql) {
    return NextResponse.json({ error: "Unknown migration" }, { status: 400 });
  }

  // Execute via Supabase REST /rest/v1/rpc is unreliable for DDL
  // Use the postgres REST endpoint directly
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    // Fallback: try splitting into individual statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const errors: string[] = [];
    for (const stmt of statements) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: stmt }),
      });
      if (!r.ok) {
        const err = await r.text();
        // Ignore "already exists" errors
        if (!err.includes("already exists") && !err.includes("duplicate")) {
          errors.push(err);
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

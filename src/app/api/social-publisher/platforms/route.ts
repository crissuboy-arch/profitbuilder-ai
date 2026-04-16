import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET — list connected platforms
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("sp_platforms")
    .select("id, name, display_name, is_active, token_expires_at, created_at")
    .eq("user_id", user.id)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ platforms: data ?? [] });
}

// POST — upsert platform credentials
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, credentials } = body as {
    name: "instagram" | "tiktok";
    credentials: Record<string, string>;
  };

  if (!name || !credentials) {
    return NextResponse.json({ error: "name e credentials são obrigatórios" }, { status: 400 });
  }

  const displayName = name === "instagram" ? "Instagram" : "TikTok";

  const { data, error } = await supabase
    .from("sp_platforms")
    .upsert(
      { user_id: user.id, name, display_name: displayName, credentials, is_active: true },
      { onConflict: "user_id,name" }
    )
    .select("id, name, display_name, is_active")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ platform: data });
}

// DELETE — disconnect a platform
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json() as { name: string };
  if (!name) return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });

  const { error } = await supabase
    .from("sp_platforms")
    .delete()
    .eq("user_id", user.id)
    .eq("name", name);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

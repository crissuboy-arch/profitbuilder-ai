import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("sp_posts")
    .select(`
      *,
      sp_post_platforms (
        id, status, external_id, external_url, error_message, published_at,
        sp_platforms ( id, name, display_name )
      )
    `)
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL(requestUrl);
      loginUrl.pathname = "/login";
      loginUrl.search = `?error=${encodeURIComponent(error.message)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  const redirectUrl = new URL(requestUrl);
  redirectUrl.pathname = next.startsWith("/") ? next : "/";
  redirectUrl.search = "";

  return NextResponse.redirect(redirectUrl);
}

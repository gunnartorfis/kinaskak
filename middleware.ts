import { updateSession } from "@/db/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // update user's auth session
  await updateSession(request);

  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL("/product/kinaskak-skrifblokk", request.url)
    );
  }
}

export const config = {
  // Match all paths except for /product/kinaskak-skrifblokk
  matcher: ["/((?!product/kinaskak-skrifblokk).*)"],
};

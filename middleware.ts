import { NextResponse, type NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL("/product/kinaskak-blokk", request.url)
    );
  }
}

export const config = {
  // Match all paths except for /product/kinaskak-blokk
  matcher: ["/((?!product/kinaskak-blokk).*)"],
};

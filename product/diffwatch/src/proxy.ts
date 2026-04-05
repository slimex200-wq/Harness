import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encodedKey = new TextEncoder().encode(process.env.AUTH_SECRET);

export const config = {
  matcher: [
    "/((?!landing|auth|api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("dw_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/landing", request.url));
  }

  try {
    await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/landing", request.url));
    response.cookies.delete("dw_session");
    return response;
  }
}

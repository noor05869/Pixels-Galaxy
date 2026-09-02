import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, adminSessionCookieOptions } from "../../../../lib/admin/session";

type LogoutHandlerOptions = { secureCookie: boolean };

export function createLogoutHandler(options: LogoutHandlerOptions): () => Promise<Response> {
  return async () => {
    const response = NextResponse.json(
      { ok: true },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      ...adminSessionCookieOptions(options.secureCookie),
      maxAge: 0,
    });
    return response;
  };
}

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rateLimit";
import { ensureSameOrigin, getClientIdentifier, jsonError } from "@/lib/security/request";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

function applyRateLimit(request, action) {
  const identifier = getClientIdentifier(request);
  const result = rateLimit({
    key: `auth-session:${action}:${identifier}`,
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (result.success) {
    return null;
  }

  return jsonError("Too many requests. Please try again shortly.", 429, {
    "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
  });
}

export async function POST(request) {
  const sameOriginError = ensureSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = applyRateLimit(request, "post");
  if (rateLimitError) {
    return rateLimitError;
  }

  const { accessToken, refreshToken, expiresAt } = await request.json();

  if (!accessToken || !refreshToken) {
        return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    const maxAge = expiresAt
        ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 60)
        : 60 * 60 * 24;

    response.cookies.set("sb-access-token", accessToken, { ...cookieOptions, maxAge });
    response.cookies.set("sb-refresh-token", refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });

    return response;
}

export async function DELETE(request) {
  const sameOriginError = ensureSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = applyRateLimit(request, "delete");
  if (rateLimitError) {
    return rateLimitError;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("sb-access-token", "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set("sb-refresh-token", "", { ...cookieOptions, maxAge: 0 });
  return response;
}

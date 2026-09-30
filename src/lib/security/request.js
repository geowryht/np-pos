import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createSupabase() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase environment variables are missing");
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
}

export function jsonError(message, status = 400, extraHeaders = {}) {
    return NextResponse.json({ error: message }, {
        status,
        headers: extraHeaders,
    });
}

export function getClientIdentifier(request) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    if (realIp) {
        return realIp.trim();
    }

    return "unknown";
}

export function ensureSameOrigin(request) {
    const origin = request.headers.get("origin");

    if (!origin) {
        return null;
    }

    const requestOrigin = request.nextUrl.origin;

    if (origin !== requestOrigin) {
        return jsonError("Cross-origin requests are not allowed.", 403, {
            Vary: "Origin",
        });
    }

    return null;
}

export async function getAuthenticatedUser(request) {
    const accessToken = request.cookies.get("sb-access-token")?.value;
    const refreshToken = request.cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
        return { user: null, error: "Unauthorized" };
    }

    const supabase = createSupabase();
    const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    const user = data?.user || data?.session?.user || null;

    if (error || !user) {
        return { user: null, error: "Unauthorized" };
    }

    return { user, error: null };
}

export async function requireAdmin(request) {
    const sameOriginError = ensureSameOrigin(request);

    if (sameOriginError) {
        return { errorResponse: sameOriginError, user: null };
    }

    const { user, error } = await getAuthenticatedUser(request);

    if (error || !user) {
        return { errorResponse: jsonError("Unauthorized", 401), user: null };
    }

    const role = user.user_metadata?.role || "cashier";

    if (role !== "admin") {
        return { errorResponse: jsonError("Forbidden", 403), user };
    }

    return { errorResponse: null, user };
}

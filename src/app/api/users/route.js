import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rateLimit";
import { getClientIdentifier, jsonError, requireAdmin } from "@/lib/security/request";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
    if (!supabaseUrl || !serviceRoleKey) {
        return {
            error: new Error("Supabase service role credentials are missing."),
            supabase: null,
        };
    }

    return {
        error: null,
        supabase: createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }),
    };
}

function toUserRow(user) {
    const bannedUntil = user.banned_until ? new Date(user.banned_until) : null;
    const isBanned = bannedUntil && bannedUntil.getTime() > Date.now();

    return {
        id: user.id,
        name: user.user_metadata?.name || user.email,
        email: user.email,
        role: user.user_metadata?.role || "cashier",
        active: !isBanned,
    };
}

function getRateLimitError(request, action) {
    const identifier = getClientIdentifier(request);
    const result = rateLimit({
        key: `admin-users:${action}:${identifier}`,
        limit: 10,
        windowMs: 60 * 1000,
    });

    if (result.success) {
        return null;
    }

    return jsonError("Too many requests. Please try again shortly.", 429, {
        "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
    });
}

export async function GET(request) {
    const rateLimitError = getRateLimitError(request, "get");
    if (rateLimitError) {
        return rateLimitError;
    }

    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) {
        return errorResponse;
    }

    const { supabase, error } = getAdminClient();

    if (error) {
        return jsonError(error.message, 500);
    }

    const { data, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        return jsonError(usersError.message, 500);
    }

    const users = (data.users || [])
        .map(toUserRow)
        .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ data: users });
}

export async function POST(request) {
    const rateLimitError = getRateLimitError(request, "post");
    if (rateLimitError) {
        return rateLimitError;
    }

    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) {
        return errorResponse;
    }

    const { supabase, error } = getAdminClient();

    if (error) {
        return jsonError(error.message, 500);
    }

    const { name, email, password, role } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
        return jsonError("Name, email, and password are required.");
    }

    const { data, error: createError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: {
            name: name.trim(),
            role: role || "cashier",
        },
    });

    if (createError) {
        return jsonError(createError.message, 500);
    }

    return NextResponse.json({ data: toUserRow(data.user) });
}

export async function PATCH(request) {
    const rateLimitError = getRateLimitError(request, "patch");
    if (rateLimitError) {
        return rateLimitError;
    }

    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) {
        return errorResponse;
    }

    const { supabase, error } = getAdminClient();

    if (error) {
        return jsonError(error.message, 500);
    }

    const { id, name, email, role, active } = await request.json();

    if (!id) {
        return jsonError("User id is required.");
    }

    const attributes = {};

    if (email?.trim()) {
        attributes.email = email.trim();
    }

    if (name?.trim() || role) {
        attributes.user_metadata = {
            ...(name?.trim() ? { name: name.trim() } : {}),
            ...(role ? { role } : {}),
        };
    }

    if (typeof active === "boolean") {
        attributes.ban_duration = active ? "none" : "876000h";
    }

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(id, attributes);

    if (updateError) {
        return jsonError(updateError.message, 500);
    }

    return NextResponse.json({ data: toUserRow(data.user) });
}

export async function DELETE(request) {
    const rateLimitError = getRateLimitError(request, "delete");
    if (rateLimitError) {
        return rateLimitError;
    }

    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) {
        return errorResponse;
    }

    const { supabase, error } = getAdminClient();

    if (error) {
        return jsonError(error.message, 500);
    }

    const { id } = await request.json();

    if (!id) {
        return jsonError("User id is required.");
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

    if (deleteError) {
        return jsonError(deleteError.message, 500);
    }

    return NextResponse.json({ ok: true });
}

async function handleResponse(response) {
    const payload = await response.json();

    if (!response.ok) {
        return { data: null, error: new Error(payload.error || "User request failed.") };
    }

    return { data: payload.data ?? null, error: null };
}

export async function getUsers() {
    return handleResponse(await fetch("/api/users"));
}

export async function createUser({ name, email, password, role }) {
    return handleResponse(await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
    }));
}

export async function updateUser(id, updates) {
    return handleResponse(await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
    }));
}

export async function deleteUser(id) {
    return handleResponse(await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    }));
}

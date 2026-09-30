"use client";

import { useEffect, useState } from "react";
import Error from "@/components/shared/error";
import Loading from "@/components/shared/loading";
import { createUser, deleteUser, getUsers, updateUser } from "@/lib/supabase/users";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "cashier",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadUsers() {
            const { data, error: usersError } = await getUsers();

            if (usersError) {
                setError(usersError.message);
            } else {
                setUsers(data || []);
            }

            setLoading(false);
        }

        loadUsers();
    }, []);

    async function addUser(e) {
        e.preventDefault();

        if (!newUser.name || !newUser.email || !newUser.password) return;

        setSaving(true);

        const { data, error: createError } = await createUser({
            name: newUser.name.trim(),
            email: newUser.email.trim(),
            password: newUser.password,
            role: newUser.role,
        });

        setSaving(false);

        if (createError) {
            setError(createError.message);
            return;
        }

        setUsers((currentUsers) => [...currentUsers, data]);

        setNewUser({ name: "", email: "", password: "", role: "cashier" });
    }

    async function toggleUser(user) {
        const nextActive = !(user.active ?? true);
        const { data, error: updateError } = await updateUser(user.id, { active: nextActive });

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setUsers((currentUsers) =>
            currentUsers.map((u) =>
                u.id === user.id ? { ...u, ...data, active: data?.active ?? nextActive } : u
            )
        );
    }

    async function removeUser(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        const { error: deleteError } = await deleteUser(id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        setUsers((currentUsers) => currentUsers.filter((u) => u.id !== id));
    }

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="text-gray-600">
            <h1 className="text-2xl font-bold mb-6">Users</h1>

            {/* Add User */}
            <form
                onSubmit={addUser}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6"
            >
                <input
                    type="text"
                    placeholder="Full name"
                    className="border border-gray-300 rounded px-3 py-2"
                    value={newUser.name}
                    onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                    }
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="border border-gray-300 rounded px-3 py-2"
                    value={newUser.email}
                    onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Temporary password"
                    className="border border-gray-300 rounded px-3 py-2"
                    value={newUser.password}
                    onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                    }
                />

                <select
                    className="border border-gray-300 rounded px-3 py-2"
                    value={newUser.role}
                    onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                    }
                >
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white rounded px-4 hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Adding..." : "Add User"}
                </button>
            </form>

            {/* Users Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No users found. Add one above.
                                </td>
                            </tr>
                        ) : users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2 capitalize">{user.role}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={`text-sm font-medium ${(user.active ?? true) ? "text-green-600" : "text-gray-400"
                                            }`}
                                    >
                                        {(user.active ?? true) ? "Active" : "Disabled"}
                                    </span>
                                </td>
                                <td className="px-4 py-2 space-x-3">
                                    <button
                                        onClick={() => toggleUser(user)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        {(user.active ?? true) ? "Disable" : "Enable"}
                                    </button>
                                    <button
                                        onClick={() => removeUser(user.id)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

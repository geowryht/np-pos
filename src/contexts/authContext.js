"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { syncAuthSession } from "@/lib/supabase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkUser() {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                await syncAuthSession(session);

                const userRole = session.user.user_metadata?.role || "cashier";
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: userRole,
                    name: session.user.user_metadata?.name || session.user.email,
                });
            }
            setLoading(false);
        }

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
                    await syncAuthSession(session);
                }

                const userRole = session.user.user_metadata?.role || "cashier";
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: userRole,
                    name: session.user.user_metadata?.name || session.user.email,
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const isAdmin = user?.role === "admin";
    const isCashier = user?.role === "cashier";

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isCashier }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

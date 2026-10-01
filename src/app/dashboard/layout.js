"use client";

import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/contexts/authContext";
import { POSSearchProvider } from "@/contexts/posSearchContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "@/components/shared/loading";

const adminOnlyPaths = ["/dashboard/products", "/dashboard/categories", "/dashboard/users", "/dashboard/overview"];

export default function DashboardLayout({ children }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!loading && user && !isAdmin) {
            const isAdminPage = adminOnlyPaths.some(path => pathname.startsWith(path));
            if (isAdminPage) {
                router.push("/dashboard/pos");
            }
        }
    }, [user, loading, isAdmin, pathname, router]);

    // Close sidebar when route changes (mobile)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading message="Checking authentication..." />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <POSSearchProvider>
            <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/7 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <Sidebar isAdmin={isAdmin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 min-h-0 min-w-0 overflow-y-auto p-4 md:p-6 bg-gray-50 print:overflow-visible">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </POSSearchProvider>
    );
}

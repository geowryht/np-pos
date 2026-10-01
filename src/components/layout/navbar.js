"use client";

import { useAuth } from "@/contexts/authContext";
import { signOut } from "@/lib/supabase/auth";
import { usePOSSearch } from "@/contexts/posSearchContext";
import { usePathname } from "next/navigation";

export default function Navbar({ onMenuClick }) {
    const { isAdmin } = useAuth();
    const { productSearch, setProductSearch } = usePOSSearch();
    const pathname = usePathname();
    const isPOSPage = pathname === "/dashboard/pos";

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/login';
    };


    return (
        <header className="sticky top-0 z-30 h-14 shrink-0 bg-white border-b flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {isPOSPage && (
                <div className="flex-1 max-w-md mx-3">
                    <input
                        type="search"
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder="Search products"
                        aria-label="Search products"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            )}

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block cursor-default">
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {isAdmin ? "Admin" : "Cashier"}
                    </span>
                </span>
                <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-600 hover:text-red-600 duration-300 cursor-pointer"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}

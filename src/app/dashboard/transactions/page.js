"use client";

import { useEffect, useState, useRef } from "react";
import { getTransactions } from "@/lib/supabase/transactions";
import { getCategories } from "@/lib/supabase/categories";
import Loading from "@/components/shared/loading";
import Error from "@/components/shared/error";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const printRef = useRef();
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        async function loadData() {
            const [transactionsRes, categoriesRes] = await Promise.all([
                getTransactions(),
                getCategories(),
            ]);

            if (transactionsRes.error) {
                setError(transactionsRes.error.message);
            } else {
                setTransactions(transactionsRes.data || []);
            }

            if (categoriesRes.error) {
                setError(categoriesRes.error.message);
            } else {
                setCategories(categoriesRes.data || []);
            }
            setLoading(false);
        }

        loadData();
    }, []);

    const matchesDate = (t) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const transDate = new Date(t.created_at);

        switch (dateFilter) {
            case "today":
                return transDate >= today;
            case "weekly":
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return transDate >= weekAgo;
            case "monthly":
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return transDate >= monthAgo;
            case "yearly":
                const yearAgo = new Date(today);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                return transDate >= yearAgo;
            default:
                return true;
        }
    };

    const matchesCategory = (t) => {
        if (categoryFilter === "all") return true;
        if (!Array.isArray(t.items)) return false;

        const selectedCategory = categories.find(c => c.id === categoryFilter);
        const selectedName = selectedCategory?.name;

        return t.items.some((item) => {
            const itemCategory = item.category_name || item.category || "Unknown";
            const itemCategoryId = item.category_id || item.category || "";
            return itemCategoryId === categoryFilter || itemCategory === selectedName;
        });
    };

    const getFilteredTransactions = () => {
        return transactions.filter(t => matchesDate(t) && matchesCategory(t));
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContents = document.body.innerHTML;

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Transactions Report</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            .no-print { display: none; }
            h1 { margin-bottom: 10px; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const formatItems = (items) => {
        if (!Array.isArray(items)) return "-";
        return items.map((item) => item.name).join(", ");
    };

    const formatCategories = (items) => {
        if (!Array.isArray(items)) return "-";
        const categories = items
            .map((item) => item.category_name || item.category || "Unknown");
        return [...new Set(categories)].join(", ");
    };

    const filteredTransactions = getFilteredTransactions();
    const grandTotal = filteredTransactions.reduce((sum, t) => sum + Number(t.total || 0), 0);

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    const formatItemDetails = (items) => {
        if (!Array.isArray(items)) return [];
        return items.map((item) => ({
            name: item.name,
            price: Number(item.price || 0),
            quantity: item.quantity || 1,
            total: Number(item.price || 0) * (item.quantity || 1),
        }));
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow text-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">Transactions</h1>

                <div className="flex flex-wrap gap-2 no-print">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                        <option value="yearly">This Year</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        Print
                    </button>
                </div>
            </div>

            {filteredTransactions.length === 0 ? (
                <p className="text-gray-500">No transactions found.</p>
            ) : (
                <div ref={printRef}>
                    <div className="hidden print:block mb-4">
                        <h1>Transactions Report</h1>
                        <p className="text-sm text-gray-500">
                            {dateFilter === "all" ? "All Time" :
                                dateFilter === "today" ? "Today" :
                                    dateFilter === "weekly" ? "This Week" :
                                        dateFilter === "monthly" ? "This Month" : "This Year"}
                            {categoryFilter !== "all" && ` - ${categories.find(c => c.id === categoryFilter)?.name || "Category"}`}
                        </p>
                    </div>

                    <div className="overflow-y-auto max-h-120 max-w-[100%]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 text-sm">Date</th>
                                    <th className="text-left py-2 text-sm">Products</th>
                                    <th className="text-left py-2 text-sm hidden sm:table-cell">Category</th>
                                    <th className="text-left py-2 text-sm hidden md:table-cell">Cashier</th>
                                    <th className="text-right py-2 text-sm">Total</th>
                                    <th className="text-right py-2 text-sm hidden sm:table-cell">Cash</th>
                                    <th className="text-right py-2 text-sm hidden sm:table-cell">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="border-b text-sm cursor-pointer hover:bg-gray-50"
                                        onClick={() => setSelectedTransaction(t)}
                                    >
                                        <td className="py-2">
                                            {new Date(t.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-2 text-xs sm:text-sm">{formatItems(t.items)}</td>
                                        <td className="py-2 text-xs sm:text-sm hidden sm:table-cell">{formatCategories(t.items)}</td>
                                        <td className="py-2 text-xs sm:text-sm hidden md:table-cell">{t.cashier}</td>
                                        <td className="py-2 text-right font-medium">₱{Number(t.total).toFixed(2)}</td>
                                        <td className="py-2 text-right hidden sm:table-cell">₱{Number(t.cash).toFixed(2)}</td>
                                        <td className="py-2 text-right hidden sm:table-cell">₱{Number(t.change).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-b bg-gray-50">
                                    <td colSpan={4} className="py-3 text-right font-bold hidden sm:table-cell">Grand Total:</td>
                                    <td colSpan={1} className="py-3 text-right font-bold sm:hidden">Total:</td>
                                    <td className="py-3 text-right font-bold">₱{grandTotal.toFixed(2)}</td>
                                    <td colSpan={2} className="hidden sm:table-cell"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold">Transaction Details</h2>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="text-sm mb-4">
                                <p><strong>ID:</strong> {selectedTransaction.id}</p>
                                <p><strong>Date:</strong> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
                                <p><strong>Cashier:</strong> {selectedTransaction.cashier}</p>
                            </div>

                            <hr className="my-4" />

                            <div className="space-y-2">
                                {formatItemDetails(selectedTransaction.items).map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>₱{item.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₱{Number(selectedTransaction.total).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cash</span>
                                    <span>₱{Number(selectedTransaction.cash).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Change</span>
                                    <span>₱{Number(selectedTransaction.change).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

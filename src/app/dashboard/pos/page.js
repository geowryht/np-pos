"use client";

import { useState, useEffect } from "react";
import Cart from "@/components/pos/cart";
import Payment from "@/components/pos/payment";
import Receipt from "@/components/pos/receipt";
import { getProducts } from "@/lib/supabase/products";
import { getCategories } from "@/lib/supabase/categories";
import { createTransaction } from "@/lib/supabase/transactions";
import Loading from "@/components/shared/loading";
import Error from "@/components/shared/error";
import { useAuth } from "@/contexts/authContext";
import { usePOSSearch } from "@/contexts/posSearchContext";

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [cartExpanded, setCartExpanded] = useState(true);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const { user } = useAuth();
    const { productSearch } = usePOSSearch();
    const normalizedSearch = productSearch.trim().toLowerCase();

    const startNewSale = () => {
        setTransaction(null);
    };

    useEffect(() => {
        async function loadData() {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts(),
                getCategories()
            ]);

            if (productsRes.error) {
                setError(productsRes.error.message);
            } else {
                setProducts(productsRes.data || []);
            }

            if (categoriesRes.error) {
                setError(categoriesRes.error.message);
            } else {
                setCategories(categoriesRes.data || []);
            }
        }

        loadData();
    }, []);

    const filteredProducts = products.filter((product) => (
        product.quantity > 0
        && (selectedCategory === "all" || product.category === selectedCategory)
        && (!normalizedSearch || product.name.toLowerCase().includes(normalizedSearch))
    ));

    const addToCart = (product) => {
        const existingItem = cartItems.find((item) => item.id === product.id);
        if (existingItem && existingItem.quantity >= product.quantity) {
            alert(`Only ${product.quantity} ${product.name} available in stock.`);
            return;
        }

        setCartItems((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, stockQuantity: product.quantity, quantity: 1 }];
        });
    };

    const increaseQuantity = (id) => {
        const cartItem = cartItems.find((item) => item.id === id);
        if (!cartItem || cartItem.quantity >= cartItem.stockQuantity) {
            if (cartItem) {
                alert(`Only ${cartItem.stockQuantity} ${cartItem.name} available in stock.`);
            }
            return;
        }

        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleConfirmPayment = async ({ total, cash, change }) => {
        try {
            setLoading(true);
            const cashierName = user?.name || user?.email || "Unknown";

            const { data, error } = await createTransaction({
                items: cartItems,
                total,
                cash,
                change,
                cashier: cashierName,
            });

            if (error) {
                alert(error.message);
                return;
            }

            setTransaction({
                items: data?.items || cartItems,
                total: Number(data?.total ?? total),
                cash: Number(data?.cash ?? cash),
                change: Number(data?.change ?? change),
                cashier: cashierName,
                date: data?.created_at || new Date().toISOString(),
            });

            setCartItems([]);
            const { data: refreshedProducts, error: productsError } = await getProducts();
            if (productsError) {
                alert("Payment was successful, but product stock could not be refreshed.");
            } else {
                setProducts(refreshedProducts || []);
            }
        } catch (err) {
            alert("Transaction failed!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="flex flex-col xl:flex-row gap-2 h-[calc(100vh-140px)]">
            {/* Left Side - Products */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50 rounded-lg p-3">
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-3 shrink-0 border-b border-gray-200">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === "all"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat.id
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Cards - scrollable */}
                <div className="flex-1 overflow-y-auto px-1">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 p-3 flex flex-col items-center"
                            >
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2"
                                    />
                                ) : (
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-2 flex items-center justify-center text-gray-400">
                                        <span className="text-2xl">+</span>
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-800 line-clamp-2 text-center w-full">
                                    {product.name}
                                </span>
                                <span className="text-lg font-bold text-blue-600 mt-1">
                                    ₱{Number(product.price).toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Stock: {product.quantity}
                                </span>
                            </button>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <p>No available products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Cart + Payment */}
            <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col gap-2">
                <div className="bg-white rounded-lg flex-1 overflow-hidden flex flex-col">
                    <Cart
                        initialItems={cartItems}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        onRemove={removeItem}
                        isExpanded={cartExpanded}
                        onToggleExpand={setCartExpanded}
                    />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-3">
                    <Payment
                        total={cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                        onConfirm={handleConfirmPayment}
                    />
                </div>
            </div>

            {transaction && (
                <Receipt
                    transaction={transaction}
                    onNewSale={startNewSale}
                />
            )}
        </div>
    );

}

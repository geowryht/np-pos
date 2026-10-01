"use client";

import { useState } from "react";
import CartItem from "@/components/pos/cartItem";

export default function Cart({ initialItems, onIncrease, onDecrease, onRemove, onToggleExpand, isExpanded = true }) {
    const [expanded, setExpanded] = useState(isExpanded);

    const toggleExpand = () => {
        const newState = !expanded;
        setExpanded(newState);
        onToggleExpand?.(newState);
    };

    const total = initialItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = initialItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-w-0 overflow-hidden border border-gray-300 rounded-lg shadow-lg text-gray-600 flex flex-col">
            <button
                onClick={toggleExpand}
                className="flex items-center justify-between w-full p-3 hover:bg-gray-50"
            >
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">Cart</h2>
                    {itemCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {itemCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {itemCount > 0 && (
                        <span className="text-lg font-bold text-blue-600">₱{total.toFixed(2)}</span>
                    )}
                    <span className="text-gray-400 text-2xl">{expanded ? "▼" : "▲"}</span>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-gray-200 px-3 pb-3">
                    {initialItems.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">empty</p>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto overflow-x-hidden py-2">
                            {initialItems.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onIncrease={() => onIncrease(item.id)}
                                    onDecrease={() => onDecrease(item.id)}
                                    onRemove={() => onRemove(item.id)}
                                />
                            ))}
                        </div>
                    )}

                    {initialItems.length > 0 && (
                        <button
                            onClick={() => initialItems.forEach(item => onRemove(item.id))}
                            className="w-full text-sm text-red-600 hover:text-red-800 hover:underline cursor-pointer py-2"
                        >
                            Drop Order
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
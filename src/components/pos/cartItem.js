"use client";

export default function CartItem({
    item,
    onIncrease,
    onDecrease,
}) {
    return (
        <div className="flex items-center justify-between border-b py-3">
            <div className="min-w-0">
                <p className="font-medium break-words">{item.name}</p>
                <p className="text-gray-500 text-sm">₱{item.price} x {item.quantity}</p>
            </div>

            <div className="flex gap-2">
                <button onClick={onDecrease} className="px-2 min-w-15 text-xl py-1 bg-gray-200 rounded hover:bg-gray-300">-</button>
                <button
                    onClick={onIncrease}
                    disabled={item.quantity >= item.stockQuantity}
                    className="px-2 min-w-15 text-xl py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    +
                </button>
            </div>
        </div>
    );
}

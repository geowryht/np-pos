"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/button";

export default function Receipt({ transaction, onNewSale }) {
    const modalRef = useRef(null);

    useEffect(() => {
        if (!transaction) return;

        const firstButton = modalRef.current?.querySelector("button");
        firstButton?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                window.print();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [transaction]);

    if (!transaction) return null;

    const { items, total, cash, change, cashier, date } = transaction;

    return (
        <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Print transaction"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
            <div className="w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="receipt-print rounded-lg border bg-white p-6 text-gray-700 shadow">
                    <h2 className="text-2xl font-bold text-center mb-4">
                        🧾 Receipt
                    </h2>

                    <div className="text-sm mb-4">
                        <p><strong>Cashier:</strong> {cashier}</p>
                        <p><strong>Date:</strong> {new Date(date).toLocaleString()}</p>
                    </div>

                    <hr className="my-3" />

                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between text-sm"
                            >
                                <span>
                                    {item.name} × {item.quantity}
                                </span>
                                <span>
                                    ₱{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <hr className="my-3" />

                    <div className="text-sm space-y-1">
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cash</span>
                            <span>₱{cash.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Change</span>
                            <span>₱{change.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-center gap-3 print:hidden">
                    <Button onClick={() => window.print()}>
                        Print
                    </Button>
                    <Button variant="secondary" onClick={onNewSale}>
                        New Sale
                    </Button>
                </div>
            </div>
        </div>
    );
}

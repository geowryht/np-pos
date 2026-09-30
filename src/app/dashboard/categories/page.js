"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/supabase/categories";
import Loading from "@/components/shared/loading";
import Error from "@/components/shared/error";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState("");

    useEffect(() => {
        async function loadCategories() {
            const { data, error: err } = await getCategories();
            if (err) {
                setError(err.message);
            } else {
                setCategories(data);
            }
            setLoading(false);
        }
        loadCategories();
    }, []);

    async function handleAddCategory(e) {
        e.preventDefault();

        if (!newCategory.trim()) return;

        const { data, error } = await createCategory({ name: newCategory });

        if (error) {
            alert(error.message);
            return;
        }

        setCategories([...categories, data]);
        setNewCategory("");
    }

    async function handleUpdateCategory(e) {
        e.preventDefault();
        if (!editingCategory) return;

        const { error } = await updateCategory(editingCategory.id, { 
            name: editingCategory.name 
        });

        if (error) {
            alert(error.message);
            return;
        }

        setCategories(categories.map(c => 
            c.id === editingCategory.id ? editingCategory : c
        ));
        setEditingCategory(null);
    }

    async function handleDeleteCategory(id) {
        if (!confirm("Are you sure you want to delete this category?")) return;

        const { error } = await deleteCategory(id);
        if (error) {
            alert(error.message);
            return;
        }
        setCategories(categories.filter(c => c.id !== id));
    }

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="text-gray-600">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
            </div>

            {editingCategory && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3">Edit Category</h3>
                    <form onSubmit={handleUpdateCategory} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Category name"
                            className="flex-1 border border-gray-300 rounded px-3 py-2"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        />
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="bg-gray-500 text-white px-4 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            <form
                onSubmit={handleAddCategory}
                className="flex gap-2 mb-6"
            >
                <input
                    type="text"
                    placeholder="Category name"
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
                >
                    Add
                </button>
            </form>

            <div className="bg-white rounded shadow">
                <ul className="divide-y">
                    {categories.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">
                            No categories found. Add one above.
                        </li>
                    ) : (
                        categories.map((category) => (
                            <li
                                key={category.id}
                                className="flex justify-between items-center p-4"
                            >
                                <span>{category.name}</span>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditingCategory(category)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}

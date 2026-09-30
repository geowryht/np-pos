import { supabase } from "./client";

function buildValidationError(message) {
    return { data: null, error: new Error(message) };
}

export async function getCategories() {
    return await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
}

export async function createCategory({ name }) {
    if (!name?.trim()) {
        return buildValidationError("Category name is required.");
    }

    const { data, error } = await supabase
        .from("categories")
        .insert([{ name }])
        .select()
        .single();
    return { data, error };
}

export async function updateCategory(id, { name }) {
    if (!id) {
        return buildValidationError("Category id is required.");
    }

    if (!name?.trim()) {
        return buildValidationError("Category name is required.");
    }

    const { data, error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
    return { data, error };
}

export async function deleteCategory(id) {
    const { data, error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
    return { data, error };
}

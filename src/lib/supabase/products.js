import { supabase } from "./client";

function buildValidationError(message) {
    return { data: null, error: new Error(message) };
}

// Get all products with category name
export async function getProducts() {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
    
    if (data && data.length > 0) {
        const { data: categories } = await supabase.from("categories").select("id, name");
        
        const productsWithCategoryName = data.map(product => ({
            ...product,
            category_name: categories?.find(c => c.id === product.category)?.name || "Unknown"
        }));
        
        return { data: productsWithCategoryName, error };
    }
    
    return { data, error };
}

// Create a product
export async function createProduct({ name, price, category, quantity, image_url }) {
    if (!name?.trim()) {
        return buildValidationError("Product name is required.");
    }

    if (!Number.isFinite(Number(price))) {
        return buildValidationError("Product price must be a valid number.");
    }

    if (!category?.trim()) {
        return buildValidationError("Category is required.");
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
        return buildValidationError("Product quantity must be a whole number that is zero or greater.");
    }

    const { data, error } = await supabase
        .from("products")
        .insert([{ name, price, category, quantity: Number(quantity), image_url }])
        .select()
        .single();
    return { data, error };
}

// Update a product
export async function updateProduct(id, { name, price, category, quantity, image_url }) {
    if (!id) {
        return buildValidationError("Product id is required.");
    }

    if (!name?.trim()) {
        return buildValidationError("Product name is required.");
    }

    if (!Number.isFinite(Number(price))) {
        return buildValidationError("Product price must be a valid number.");
    }

    if (!category?.trim()) {
        return buildValidationError("Category is required.");
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
        return buildValidationError("Product quantity must be a whole number that is zero or greater.");
    }

    const { data, error } = await supabase
        .from("products")
        .update({ name, price, category, quantity: Number(quantity), image_url })
        .eq("id", id)
        .select()
        .single();
    return { data, error };
}

// Delete a product
export async function deleteProduct(id) {
    const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
    return { data, error };
}

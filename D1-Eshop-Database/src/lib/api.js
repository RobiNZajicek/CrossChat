// API helper pro komunikaci s backendem

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET request
export async function fetchAPI(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error('API error');
    return res.json();
}

// POST request
export async function postAPI(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
}

// PUT request
export async function putAPI(endpoint, data) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
}

// DELETE request
export async function deleteAPI(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
}

// Produkty
export const getProducts = () => fetchAPI('/api/products');
export const getProduct = (id) => fetchAPI(`/api/products/${id}`);
export const getFeaturedProducts = () => fetchAPI('/api/products/featured');
export const createProduct = (data) => postAPI('/api/products', data);
export const deleteProduct = (id) => deleteAPI(`/api/products/${id}`);

// Kategorie
export const getCategories = () => fetchAPI('/api/categories');

// Objednavky
export const createOrder = (data) => postAPI('/api/orders', data);
export const getOrder = (id) => fetchAPI(`/api/orders/${id}`);

// Report
export const getReport = () => fetchAPI('/api/report');

// Import
export const importProducts = (data) => postAPI('/api/import/products', data);
export const importCategories = (data) => postAPI('/api/import/categories', data);



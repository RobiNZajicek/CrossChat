'use client';
import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError('Chyba pri nacitani produktu');
        } finally {
            setLoading(false);
        }
    }

    function addToCart(product) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Pridano do kosiku!');
    }

    if (loading) return <div>Nacitam...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="products-page">
            <h1>Produkty</h1>
            <div className="products-grid">
                {products.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={addToCart}
                    />
                ))}
            </div>
        </div>
    );
}



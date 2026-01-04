'use client';
import { useState, useEffect } from 'react';
import { getFeaturedProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeatured();
    }, []);

    async function loadFeatured() {
        try {
            const data = await getFeaturedProducts();
            setFeatured(data);
        } catch (err) {
            console.error('Chyba:', err);
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

    return (
        <div className="home-page">
            <h1>Vitejte v E-Shopu</h1>
            <p>D1 Repository Pattern - Skolni projekt</p>
            
            <section className="featured-section">
                <h2>Doporucene produkty</h2>
                {loading ? (
                    <p>Nacitam...</p>
                ) : featured.length > 0 ? (
                    <div className="products-grid">
                        {featured.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product}
                                onAddToCart={addToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <p>Zadne doporucene produkty</p>
                )}
            </section>
            
            <div className="home-links">
                <Link href="/products" className="btn">Vsechny produkty</Link>
                <Link href="/admin" className="btn">Admin panel</Link>
            </div>
        </div>
    );
}

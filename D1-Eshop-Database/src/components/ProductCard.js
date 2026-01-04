'use client';
import Link from 'next/link';

export default function ProductCard({ product, onAddToCart }) {
    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p className="price">{product.price} Kc</p>
            <p className="stock">Skladem: {product.stock} ks</p>
            <div className="product-actions">
                <Link href={`/products/${product.id}`}>Detail</Link>
                <button onClick={() => onAddToCart(product)}>
                    Pridat do kosiku
                </button>
            </div>
        </div>
    );
}



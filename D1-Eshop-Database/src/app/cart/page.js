'use client';
import { useState, useEffect } from 'react';
import { createOrder } from '@/lib/api';

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
    }, []);

    function removeFromCart(productId) {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    }

    function updateQuantity(productId, quantity) {
        const newCart = cart.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(1, quantity) };
            }
            return item;
        });
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    }

    async function submitOrder() {
        if (cart.length === 0) {
            alert('Kosik je prazdny!');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                user_id: 1, // TODO: dynamicky z prihlaseni
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price
                }))
            };

            const result = await createOrder(orderData);
            alert(`Objednavka vytvorena! ID: ${result.order_id}`);
            setCart([]);
            localStorage.setItem('cart', '[]');
        } catch (err) {
            alert('Chyba pri vytvareni objednavky');
        } finally {
            setLoading(false);
        }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="cart-page">
            <h1>Kosik</h1>
            
            {cart.length === 0 ? (
                <p>Kosik je prazdny</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">{item.price} Kc</span>
                                <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                    min="1"
                                />
                                <span className="item-total">{item.price * item.quantity} Kc</span>
                                <button onClick={() => removeFromCart(item.id)}>X</button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="cart-total">
                        <strong>Celkem: {total} Kc</strong>
                    </div>
                    
                    <button 
                        className="order-button"
                        onClick={submitOrder}
                        disabled={loading}
                    >
                        {loading ? 'Odesilam...' : 'Objednat'}
                    </button>
                </>
            )}
        </div>
    );
}



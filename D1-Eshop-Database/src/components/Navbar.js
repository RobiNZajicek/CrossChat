'use client';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link href="/">E-Shop</Link>
            </div>
            <div className="navbar-menu">
                <Link href="/products">Produkty</Link>
                <Link href="/cart">Kosik</Link>
                <Link href="/admin">Admin</Link>
            </div>
        </nav>
    );
}



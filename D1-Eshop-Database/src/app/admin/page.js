'use client';
import { useState, useEffect } from 'react';
import { getReport, getProducts, deleteProduct, importProducts } from '@/lib/api';
import Link from 'next/link';

export default function AdminPage() {
    const [report, setReport] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importData, setImportData] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [reportData, productsData] = await Promise.all([
                getReport(),
                getProducts()
            ]);
            setReport(reportData);
            setProducts(productsData);
        } catch (err) {
            console.error('Chyba:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Opravdu smazat?')) return;
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Chyba pri mazani');
        }
    }

    async function handleImport() {
        try {
            const data = JSON.parse(importData);
            const result = await importProducts(data);
            alert(result.message);
            loadData();
            setImportData('');
        } catch (err) {
            alert('Chyba pri importu - zkontroluj JSON format');
        }
    }

    if (loading) return <div>Nacitam...</div>;

    return (
        <div className="admin-page">
            <h1>Admin Panel</h1>
            
            {/* REPORT - agregace z 3+ tabulek */}
            <section className="report-section">
                <h2>Report (agregace 3+ tabulek)</h2>
                {report && (
                    <div className="report-grid">
                        <div className="report-card">
                            <h3>Celkove trzby</h3>
                            <p>{report.total_revenue} Kc</p>
                        </div>
                        <div className="report-card">
                            <h3>Pocet objednavek</h3>
                            <p>{report.total_orders}</p>
                        </div>
                        <div className="report-card">
                            <h3>Pocet uzivatelu</h3>
                            <p>{report.total_users}</p>
                        </div>
                        <div className="report-card">
                            <h3>Prumerna objednavka</h3>
                            <p>{report.avg_order_value?.toFixed(2)} Kc</p>
                        </div>
                    </div>
                )}
                
                {report?.top_products?.length > 0 && (
                    <div className="top-products">
                        <h3>Top produkty</h3>
                        <ul>
                            {report.top_products.map((p, i) => (
                                <li key={i}>{p.name} - prodano: {p.sold}x ({p.revenue} Kc)</li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* IMPORT JSON */}
            <section className="import-section">
                <h2>Import produktu (JSON)</h2>
                <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"products": [{"name": "Test", "price": 100, "category_id": 1}]}'
                    rows={5}
                />
                <button onClick={handleImport}>Importovat</button>
            </section>

            {/* SPRAVA PRODUKTU */}
            <section className="products-section">
                <h2>Sprava produktu</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nazev</th>
                            <th>Cena</th>
                            <th>Sklad</th>
                            <th>Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.name}</td>
                                <td>{p.price} Kc</td>
                                <td>{p.stock}</td>
                                <td>
                                    <button onClick={() => handleDelete(p.id)}>Smazat</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}



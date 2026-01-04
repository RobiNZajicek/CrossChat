from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os

# Pridej backend do path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from database import Database
from repositories.product_repository import ProductRepository
from repositories.category_repository import CategoryRepository
from repositories.user_repository import UserRepository
from repositories.order_repository import OrderRepository

app = Flask(__name__)
CORS(app)  # Povoli cross-origin requesty z frontendu

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Zkontroluje jestli API a databaze funguje"""
    try:
        Database.get_connection()
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ============================================
# PRODUCTS - CRUD
# ============================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """Vrati vsechny produkty"""
    try:
        products = ProductRepository.get_all()
        result = []
        for p in products:
            result.append({
                "id": p[0],
                "name": p[1],
                "description": p[2],
                "price": float(p[3]),
                "stock": p[4],
                "category_id": p[5],
                "is_featured": bool(p[6]),
                "created_at": str(p[7])
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:id>', methods=['GET'])
def get_product(id):
    """Vrati jeden produkt podle ID"""
    try:
        p = ProductRepository.get_by_id(id)
        if not p:
            return jsonify({"error": "Produkt nenalezen"}), 404
        return jsonify({
            "id": p[0],
            "name": p[1],
            "description": p[2],
            "price": float(p[3]),
            "stock": p[4],
            "category_id": p[5],
            "is_featured": bool(p[6]),
            "created_at": str(p[7])
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    """Vytvori novy produkt"""
    try:
        data = request.get_json()
        
        # Validace
        required = ['name', 'price', 'category_id']
        for field in required:
            if field not in data:
                return jsonify({"error": f"Chybi pole: {field}"}), 400
        
        ProductRepository.create(
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            stock=data.get('stock', 0),
            category_id=data['category_id'],
            is_featured=data.get('is_featured', False)
        )
        return jsonify({"message": "Produkt vytvoren"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:id>', methods=['PUT'])
def update_product(id):
    """Aktualizuje produkt"""
    try:
        data = request.get_json()
        
        # Zkontroluj ze produkt existuje
        if not ProductRepository.get_by_id(id):
            return jsonify({"error": "Produkt nenalezen"}), 404
        
        ProductRepository.update(
            id=id,
            name=data['name'],
            description=data.get('description', ''),
            price=data['price'],
            stock=data.get('stock', 0),
            category_id=data['category_id'],
            is_featured=data.get('is_featured', False)
        )
        return jsonify({"message": "Produkt aktualizovan"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    """Smaze produkt"""
    try:
        if not ProductRepository.get_by_id(id):
            return jsonify({"error": "Produkt nenalezen"}), 404
        
        ProductRepository.delete(id)
        return jsonify({"message": "Produkt smazan"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/featured', methods=['GET'])
def get_featured_products():
    """Vrati doporucene produkty"""
    try:
        products = ProductRepository.get_featured()
        result = []
        for p in products:
            result.append({
                "id": p[0],
                "name": p[1],
                "price": float(p[3]),
                "stock": p[4]
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# CATEGORIES
# ============================================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Vrati vsechny kategorie"""
    try:
        categories = CategoryRepository.get_all()
        result = []
        for c in categories:
            result.append({
                "id": c[0],
                "name": c[1],
                "description": c[2]
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories', methods=['POST'])
def create_category():
    """Vytvori novou kategorii"""
    try:
        data = request.get_json()
        if 'name' not in data:
            return jsonify({"error": "Chybi pole: name"}), 400
        
        CategoryRepository.create(
            name=data['name'],
            description=data.get('description', '')
        )
        return jsonify({"message": "Kategorie vytvorena"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories/with-counts', methods=['GET'])
def get_categories_with_counts():
    """Vrati kategorie s poctem produktu"""
    try:
        categories = CategoryRepository.get_with_product_count()
        result = []
        for c in categories:
            result.append({
                "id": c[0],
                "name": c[1],
                "description": c[2],
                "product_count": c[3]
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# USERS
# ============================================

@app.route('/api/users', methods=['POST'])
def create_user():
    """Registrace noveho uzivatele"""
    try:
        data = request.get_json()
        
        required = ['email', 'password', 'name']
        for field in required:
            if field not in data:
                return jsonify({"error": f"Chybi pole: {field}"}), 400
        
        # Zkontroluj jestli email neexistuje
        existing = UserRepository.get_by_email(data['email'])
        if existing:
            return jsonify({"error": "Email jiz existuje"}), 400
        
        # V realu bychom heslo hashovali!
        password_hash = f"hash_{data['password']}"
        
        UserRepository.create(
            email=data['email'],
            password_hash=password_hash,
            name=data['name'],
            credits=data.get('credits', 0)
        )
        return jsonify({"message": "Uzivatel vytvoren"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:id>', methods=['GET'])
def get_user(id):
    """Vrati uzivatele podle ID"""
    try:
        u = UserRepository.get_by_id(id)
        if not u:
            return jsonify({"error": "Uzivatel nenalezen"}), 404
        return jsonify({
            "id": u[0],
            "email": u[1],
            "name": u[3],
            "credits": float(u[4]),
            "is_active": bool(u[5])
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/transfer-credits', methods=['POST'])
def transfer_credits():
    """Prevede kredity mezi uzivateli - TRANSAKCE!"""
    try:
        data = request.get_json()
        
        required = ['from_user_id', 'to_user_id', 'amount']
        for field in required:
            if field not in data:
                return jsonify({"error": f"Chybi pole: {field}"}), 400
        
        if data['amount'] <= 0:
            return jsonify({"error": "Castka musi byt kladna"}), 400
        
        UserRepository.transfer_credits(
            from_user_id=data['from_user_id'],
            to_user_id=data['to_user_id'],
            amount=data['amount']
        )
        return jsonify({"message": "Kredity prevedeny"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# ORDERS - CRUD PRES VICE TABULEK!
# ============================================

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Vytvori objednavku - UKLADA DO VICE TABULEK!"""
    try:
        data = request.get_json()
        
        if 'user_id' not in data or 'items' not in data:
            return jsonify({"error": "Chybi user_id nebo items"}), 400
        
        if len(data['items']) == 0:
            return jsonify({"error": "Objednavka musi mit alespon 1 polozku"}), 400
        
        # Validace polozek
        for item in data['items']:
            if 'product_id' not in item or 'quantity' not in item or 'unit_price' not in item:
                return jsonify({"error": "Kazda polozka musi mit product_id, quantity a unit_price"}), 400
        
        order_id = OrderRepository.create_order(
            user_id=data['user_id'],
            items=data['items']
        )
        return jsonify({"message": "Objednavka vytvorena", "order_id": order_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<int:id>', methods=['GET'])
def get_order(id):
    """Vrati objednavku s polozkammi"""
    try:
        items = OrderRepository.get_order_with_items(id)
        if not items:
            return jsonify({"error": "Objednavka nenalezena"}), 404
        
        result = {
            "order_id": items[0][0],
            "status": items[0][1],
            "total_price": float(items[0][2]),
            "created_at": str(items[0][3]),
            "customer_name": items[0][4],
            "customer_email": items[0][5],
            "items": []
        }
        
        for item in items:
            result["items"].append({
                "product_name": item[8],
                "quantity": item[6],
                "unit_price": float(item[7])
            })
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<int:id>/status', methods=['PUT'])
def update_order_status(id):
    """Zmeni stav objednavky"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({"error": "Chybi pole: status"}), 400
        
        OrderRepository.update_status(id, data['status'])
        return jsonify({"message": "Status aktualizovan"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    """Vrati vsechny objednavky uzivatele"""
    try:
        orders = OrderRepository.get_user_orders(user_id)
        result = []
        for o in orders:
            result.append({
                "id": o[0],
                "status": o[2],
                "total_price": float(o[3]),
                "created_at": str(o[4])
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# REPORT - AGREGOVANA DATA Z 3+ TABULEK
# ============================================

@app.route('/api/report', methods=['GET'])
def get_report():
    """Souhrnny report - agregace z vice tabulek"""
    try:
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        # Celkove trzby
        cursor.execute("SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status != 'pending'")
        total_revenue = float(cursor.fetchone()[0])
        
        # Pocet objednavek
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]
        
        # Pocet uzivatelu
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Pocet produktu
        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]
        
        # Prumerna hodnota objednavky
        cursor.execute("SELECT COALESCE(AVG(total_price), 0) FROM orders")
        avg_order_value = float(cursor.fetchone()[0])
        
        # Top 5 produktu podle prodeje
        cursor.execute("""
            SELECT TOP 5 p.name, SUM(oi.quantity) as sold, SUM(oi.quantity * oi.unit_price) as revenue
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            GROUP BY p.id, p.name
            ORDER BY sold DESC
        """)
        top_products = []
        for row in cursor.fetchall():
            top_products.append({
                "name": row[0],
                "sold": row[1],
                "revenue": float(row[2])
            })
        
        # Prodeje podle kategorii
        cursor.execute("""
            SELECT c.name, COUNT(oi.id) as items_sold, COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY c.id, c.name
        """)
        category_sales = []
        for row in cursor.fetchall():
            category_sales.append({
                "category": row[0],
                "items_sold": row[1],
                "revenue": float(row[2])
            })
        
        return jsonify({
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_users": total_users,
            "total_products": total_products,
            "avg_order_value": avg_order_value,
            "top_products": top_products,
            "category_sales": category_sales
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# IMPORT - CSV/JSON DO 2 TABULEK
# ============================================

@app.route('/api/import/products', methods=['POST'])
def import_products():
    """Importuje produkty z JSON"""
    try:
        data = request.get_json()
        
        if 'products' not in data:
            return jsonify({"error": "Chybi pole: products"}), 400
        
        imported = 0
        errors = []
        
        for p in data['products']:
            try:
                ProductRepository.create(
                    name=p['name'],
                    description=p.get('description', ''),
                    price=p['price'],
                    stock=p.get('stock', 0),
                    category_id=p['category_id'],
                    is_featured=p.get('is_featured', False)
                )
                imported += 1
            except Exception as e:
                errors.append(f"Produkt {p.get('name', '?')}: {str(e)}")
        
        return jsonify({
            "message": f"Importovano {imported} produktu",
            "errors": errors
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/import/categories', methods=['POST'])
def import_categories():
    """Importuje kategorie z JSON"""
    try:
        data = request.get_json()
        
        if 'categories' not in data:
            return jsonify({"error": "Chybi pole: categories"}), 400
        
        imported = 0
        errors = []
        
        for c in data['categories']:
            try:
                CategoryRepository.create(
                    name=c['name'],
                    description=c.get('description', '')
                )
                imported += 1
            except Exception as e:
                errors.append(f"Kategorie {c.get('name', '?')}: {str(e)}")
        
        return jsonify({
            "message": f"Importovano {imported} kategorii",
            "errors": errors
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# SPUSTENI APLIKACE
# ============================================

if __name__ == '__main__':
    print("=" * 50)
    print("E-SHOP API SERVER")
    print("=" * 50)
    print(f"Server: http://{Config.FLASK_HOST}:{Config.FLASK_PORT}")
    print(f"Database: {Config.DB_SERVER}/{Config.DB_NAME}")
    print("=" * 50)
    
    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )


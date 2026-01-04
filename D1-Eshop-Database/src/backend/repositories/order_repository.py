from repositories.base_repository import BaseRepository
from database import Database

class OrderRepository(BaseRepository):
    """Repository pro praci s objednavkami"""
    
    TABLE_NAME = "orders"
    
    @classmethod
    def create_order(cls, user_id, items):
        """
        Vytvori objednavku s polozkammi - TRANSAKCE pres vice tabulek!
        
        items = [
            {"product_id": 1, "quantity": 2, "unit_price": 299.00},
            {"product_id": 3, "quantity": 1, "unit_price": 599.00},
        ]
        """
        conn = Database.get_connection()
        cursor = conn.cursor()
        
        try:
            # 1. Vypocitej celkovou cenu
            total_price = sum(item["quantity"] * item["unit_price"] for item in items)
            
            # 2. Vytvor objednavku
            cursor.execute(
                "INSERT INTO orders (user_id, status, total_price) VALUES (?, 'pending', ?)",
                (user_id, total_price)
            )
            
            # 3. Ziskej ID nove objednavky
            cursor.execute("SELECT @@IDENTITY")
            order_id = cursor.fetchone()[0]
            
            # 4. Pridej polozky a aktualizuj sklad
            for item in items:
                # Vloz polozku
                cursor.execute(
                    "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
                    (order_id, item["product_id"], item["quantity"], item["unit_price"])
                )
                
                # Sniz sklad
                cursor.execute(
                    "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                    (item["quantity"], item["product_id"], item["quantity"])
                )
                if cursor.rowcount == 0:
                    raise Exception(f"Nedostatek skladu pro produkt {item['product_id']}!")
            
            # 5. Vse ok - uloz
            conn.commit()
            return order_id
            
        except Exception as e:
            conn.rollback()
            raise e
    
    @classmethod
    def get_order_with_items(cls, order_id):
        """Vrati objednavku s polozkammi"""
        query = """
            SELECT o.id, o.status, o.total_price, o.created_at,
                   u.name as customer_name, u.email,
                   oi.quantity, oi.unit_price,
                   p.name as product_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.id = ?
        """
        return Database.execute_query(query, (order_id,))
    
    @classmethod
    def get_user_orders(cls, user_id):
        """Vrati vsechny objednavky uzivatele"""
        query = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
        return Database.execute_query(query, (user_id,))
    
    @classmethod
    def update_status(cls, order_id, new_status):
        """Zmeni stav objednavky"""
        valid_statuses = ['pending', 'paid', 'shipped', 'delivered']
        if new_status not in valid_statuses:
            raise ValueError(f"Neplatny status! Povolene: {valid_statuses}")
        
        query = "UPDATE orders SET status = ? WHERE id = ?"
        return Database.execute_non_query(query, (new_status, order_id))
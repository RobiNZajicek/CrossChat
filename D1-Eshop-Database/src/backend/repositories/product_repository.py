from repositories.base_repository import BaseRepository
from database import Database

class ProductRepository(BaseRepository):
    """Repository pro praci s produkty"""
    # bere to ted data jen z products tabulky
    TABLE_NAME = "products"
    
    @classmethod
    # vytvari novy produkt
    
    def create(cls, name, description, price, stock, category_id, is_featured=False):
        """Vytvori novy produkt"""
        query = """
            INSERT INTO products (name, description, price, stock, category_id, is_featured)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        params = (name, description, price, stock, category_id, 1 if is_featured else 0)
        return Database.execute_non_query(query, params)
    
    @classmethod
    # aktualizuje produkt
    def update(cls, id, name, description, price, stock, category_id, is_featured):
        """Aktualizuje produkt"""
        query = """
            UPDATE products 
            SET name = ?, description = ?, price = ?, stock = ?, 
                category_id = ?, is_featured = ?
            WHERE id = ?
        """
        params = (name, description, price, stock, category_id, 1 if is_featured else 0, id)
        return Database.execute_non_query(query, params)
    
    @classmethod
    # vrati produkty podle kategorie
    def get_by_category(cls, category_id):
        """Vrati produkty podle kategorie"""
        query = "SELECT * FROM products WHERE category_id = ?"
        return Database.execute_query(query, (category_id,))
    
    @classmethod
    # vrati doporucene produkty (is_featured = 1)
    def get_featured(cls):
        """Vrati doporucene produkty (is_featured = 1)"""
        query = "SELECT * FROM products WHERE is_featured = 1"
        return Database.execute_query(query)
    
    @classmethod
    # zmeni stav skladuu +-
    def update_stock(cls, id, quantity_change):
        """Zmeni stav skladu (+ nebo -)"""
        query = "UPDATE products SET stock = stock + ? WHERE id = ?"
        return Database.execute_non_query(query, (quantity_change, id))
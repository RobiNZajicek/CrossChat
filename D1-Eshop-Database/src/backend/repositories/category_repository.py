from repositories.base_repository import BaseRepository
from database import Database

class CategoryRepository(BaseRepository):
    """Repository pro praci s kategoriemi"""
    
    TABLE_NAME = "categories"
    
    @classmethod
    def create(cls, name, description=None):
        """Vytvori novou kategorii"""
        query = "INSERT INTO categories (name, description) VALUES (?, ?)"
        return Database.execute_non_query(query, (name, description))
    
    @classmethod
    def update(cls, id, name, description):
        """Aktualizuje kategorii"""
        query = "UPDATE categories SET name = ?, description = ? WHERE id = ?"
        return Database.execute_non_query(query, (name, description, id))
    
    @classmethod
    def get_with_product_count(cls):
        """Vrati kategorie s poctem produktu"""
        query = """
            SELECT c.id, c.name, c.description, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.description
        """
        return Database.execute_query(query)
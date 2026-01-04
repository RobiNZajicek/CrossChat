from database import Database

class BaseRepository:
    """Zakladni repository trida - spolecne metody pro vsechny repository"""
    
    # Kazda repository si definuje svou tabulku
    TABLE_NAME = None
    
    # select from tabulky
    @classmethod
    def get_all(cls):
        """Vrati vsechny zaznamy z tabulky"""
        query = f"SELECT * FROM {cls.TABLE_NAME}"
        return Database.execute_query(query)
    
    # select from tabulky podle id
    @classmethod
    def get_by_id(cls, id):
        """Vrati jeden zaznam podle ID"""
        query = f"SELECT * FROM {cls.TABLE_NAME} WHERE id = ?"
        result = Database.execute_query(query, (id,))
        return result[0] if result else None
    
    # delete from tabulky podle id
    @classmethod
    def delete(cls, id):
        """Smaze zaznam podle ID"""
        query = f"DELETE FROM {cls.TABLE_NAME} WHERE id = ?"
        return Database.execute_non_query(query, (id,))
    
    # count from tabulky
    @classmethod
    def count(cls):
        """Vrati pocet zaznamu v tabulce"""
        query = f"SELECT COUNT(*) FROM {cls.TABLE_NAME}"
        result = Database.execute_query(query)
        return result[0][0] if result else 0
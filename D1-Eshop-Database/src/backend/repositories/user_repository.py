from repositories.base_repository import BaseRepository
from database import Database

class UserRepository(BaseRepository):
    """Repository pro praci s uzivateli"""
    
    TABLE_NAME = "users"
    
    @classmethod
    def create(cls, email, password_hash, name, credits=0):
        """Vytvori noveho uzivatele"""
        query = """
            INSERT INTO users (email, password_hash, name, credits, is_active)
            VALUES (?, ?, ?, ?, 1)
        """
        return Database.execute_non_query(query, (email, password_hash, name, credits))
    
    @classmethod
    def get_by_email(cls, email):
        """Najde uzivatele podle emailu"""
        query = "SELECT * FROM users WHERE email = ?"
        result = Database.execute_query(query, (email,))
        return result[0] if result else None
    
    @classmethod
    def update_credits(cls, user_id, amount):
        """Zmeni kredit uzivatele (+ nebo -)"""
        query = "UPDATE users SET credits = credits + ? WHERE id = ?"
        return Database.execute_non_query(query, (amount, user_id))
    
    @classmethod
    def transfer_credits(cls, from_user_id, to_user_id, amount):
        """Prevede kredity mezi uzivateli - TRANSAKCE!"""
        conn = Database.get_connection()
        cursor = conn.cursor()
        try:
            # Odecti od prvniho
            cursor.execute(
                "UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?",
                (amount, from_user_id, amount)
            )
            if cursor.rowcount == 0:
                raise Exception("Nedostatek kreditu!")
            
            # Pricti druhemu
            cursor.execute(
                "UPDATE users SET credits = credits + ? WHERE id = ?",
                (amount, to_user_id)
            )
            
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            raise e
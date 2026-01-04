import pyodbc
from config import Config

class Database:
    """Trida pro spravu pripojeni k databazi"""
    
    _connection = None
    #connectne k databazi jiz vytvorenym spojenim
    @classmethod
    def get_connection(cls):
        """Vrati pripojeni k databazi (singleton pattern)"""
        if cls._connection is None or cls._is_connection_closed():
            cls._connection = cls._create_connection()
        return cls._connection
    
    @classmethod
    #zkontroluje jestli je spojeni zavrene
    def _is_connection_closed(cls):
        """Zkontroluje jestli je spojeni zavrene"""
        try:
            cls._connection.cursor()
            return False
        except:
            return True
    
    @classmethod
    #vytvori spojeni
    def _create_connection(cls):
        """Vytvori nove pripojeni"""
        try:
            connection_string = Config.get_connection_string()
            conn = pyodbc.connect(connection_string)
            print("Pripojeno k databazi!")
            return conn
        except pyodbc.Error as e:
            print(f"Chyba pripojeni k databazi: {e}")
            raise
    #uzavre spojeni
    @classmethod
    def close_connection(cls):
        """Uzavre pripojeni"""
        if cls._connection:
            cls._connection.close()
            cls._connection = None
            print("Odpojeno od databaze.")
    #vrati tabulku jako pole objektu
    #pro select dotaz
    @classmethod
    def execute_query(cls, query, params=None):
        """Provede SELECT dotaz a vrati vysledky"""
        conn = cls.get_connection()
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return cursor.fetchall()
        except pyodbc.Error as e:
            print(f"Chyba dotazu: {e}")
            raise
    
    #vrati pocet zaznamu
    #pro insert/update/delete dotaz
    @classmethod
    def execute_non_query(cls, query, params=None):
        """Provede INSERT/UPDATE/DELETE dotaz"""
        conn = cls.get_connection()
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            conn.commit()
            return cursor.rowcount
        except pyodbc.Error as e:
            conn.rollback()
            print(f"Chyba dotazu: {e}")
            raise
import os
from dotenv import load_dotenv
#udela z .env soubor promenne a v databazi je pouzije pro pripojeni
# Nacte .env soubor (pokud existuje)
load_dotenv()

class Config:
    """Konfigurace aplikace - nacita z ENV nebo pouzije defaults"""
    
    # Databaze
    DB_SERVER = os.getenv('DB_SERVER', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'zajicek3')
    DB_USER = os.getenv('DB_USER', '')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_DRIVER = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    
    # Flask
    FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    @classmethod
    def get_connection_string(cls):
        """Vytvori connection string pro pyodbc"""
        if cls.DB_USER and cls.DB_PASSWORD:
            # SQL Server Authentication
            return (
                f"DRIVER={{{cls.DB_DRIVER}}};"
                f"SERVER={cls.DB_SERVER};"
                f"DATABASE={cls.DB_NAME};"
                f"UID={cls.DB_USER};"
                f"PWD={cls.DB_PASSWORD};"
                f"TrustServerCertificate=yes;"
            )
        else:
            # Windows Authentication
            return (
                f"DRIVER={{{cls.DB_DRIVER}}};"
                f"SERVER={cls.DB_SERVER};"
                f"DATABASE={cls.DB_NAME};"
                f"Trusted_Connection=yes;"
            )
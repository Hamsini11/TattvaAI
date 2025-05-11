import os
import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

load_dotenv()

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "adminh"),
            port=os.getenv("DB_PORT", "5432")
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def init_db():
    try:
        # Connect to postgres database
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database="postgres",
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "adminh"),
            port=os.getenv("DB_PORT", "5432")
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()

        # Drop existing tables if they exist (with CASCADE)
        print("Dropping existing tables...")
        cur.execute("DROP TABLE IF EXISTS chat_history CASCADE")
        cur.execute("DROP TABLE IF EXISTS responses CASCADE")
        cur.execute("DROP TABLE IF EXISTS results CASCADE")
        cur.execute("DROP TABLE IF EXISTS scores CASCADE")
        cur.execute("DROP TABLE IF EXISTS users CASCADE")

        # Create tables in postgres database
        print("Creating users table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                session_id UUID NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("Creating prakriti_results table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS prakriti_results (
                id SERIAL PRIMARY KEY,
                session_id UUID NOT NULL,
                deha_prakriti JSONB NOT NULL,
                manas_prakriti JSONB NOT NULL,
                guna_prakriti JSONB NOT NULL,
                backend_code VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES users(session_id)
            )
        """)

        print("Creating chat_history table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                session_id UUID NOT NULL,
                messages JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES users(session_id)
            )
        """)

        # Commit changes and close connection
        conn.commit()
        cur.close()
        conn.close()
        print("Database initialization completed successfully")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    init_db()
import sqlite3
import os
import random

DB_PATH = os.path.join(os.path.dirname(__file__), "olist.db")

def init_database():
    """
    Initializes SQLite database for Olist E-Commerce dataset using Python 3 and SQLite3.
    Creates structured tables with Primary Keys, Foreign Keys, and seeds dataset records.
    """
    # If database file exists, remove it first to prevent malformed disk image errors
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception as e:
            print(f"Notice: Could not remove existing database file: {e}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Enable Foreign Key constraints
    cursor.execute("PRAGMA foreign_keys = ON;")

    # Drop existing tables if re-initializing
    cursor.execute("DROP TABLE IF EXISTS olist_order_reviews;")
    cursor.execute("DROP TABLE IF EXISTS olist_order_payments;")
    cursor.execute("DROP TABLE IF EXISTS olist_order_items;")
    cursor.execute("DROP TABLE IF EXISTS olist_orders;")
    cursor.execute("DROP TABLE IF EXISTS olist_products;")
    cursor.execute("DROP TABLE IF EXISTS olist_customers;")
    cursor.execute("DROP TABLE IF EXISTS olist_sellers;")
    cursor.execute("DROP TABLE IF EXISTS product_category_name_translation;")

    # 1. Customers Table
    cursor.execute("""
    CREATE TABLE olist_customers (
        customer_id TEXT PRIMARY KEY,
        customer_unique_id TEXT NOT NULL,
        customer_zip_code_prefix INTEGER,
        customer_city TEXT NOT NULL,
        customer_state TEXT NOT NULL
    );
    """)

    # 2. Sellers Table
    cursor.execute("""
    CREATE TABLE olist_sellers (
        seller_id TEXT PRIMARY KEY,
        seller_zip_code_prefix INTEGER,
        seller_city TEXT NOT NULL,
        seller_state TEXT NOT NULL
    );
    """)

    # 3. Products Table
    cursor.execute("""
    CREATE TABLE olist_products (
        product_id TEXT PRIMARY KEY,
        product_category_name TEXT,
        product_category_name_english TEXT,
        product_name_length INTEGER,
        product_description_length INTEGER,
        product_photos_qty INTEGER,
        product_weight_g INTEGER,
        product_length_cm INTEGER,
        product_height_cm INTEGER,
        product_width_cm INTEGER
    );
    """)

    # 4. Orders Table
    cursor.execute("""
    CREATE TABLE olist_orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        order_status TEXT NOT NULL,
        order_purchase_timestamp TEXT NOT NULL,
        order_approved_at TEXT,
        order_delivered_carrier_date TEXT,
        order_delivered_customer_date TEXT,
        order_estimated_delivery_date TEXT,
        FOREIGN KEY (customer_id) REFERENCES olist_customers (customer_id)
    );
    """)

    # 5. Order Items Table
    cursor.execute("""
    CREATE TABLE olist_order_items (
        order_id TEXT NOT NULL,
        order_item_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        shipping_limit_date TEXT,
        price REAL NOT NULL,
        freight_value REAL NOT NULL,
        PRIMARY KEY (order_id, order_item_id),
        FOREIGN KEY (order_id) REFERENCES olist_orders (order_id),
        FOREIGN KEY (product_id) REFERENCES olist_products (product_id),
        FOREIGN KEY (seller_id) REFERENCES olist_sellers (seller_id)
    );
    """)

    # 6. Order Payments Table
    cursor.execute("""
    CREATE TABLE olist_order_payments (
        order_id TEXT NOT NULL,
        payment_sequential INTEGER NOT NULL,
        payment_type TEXT NOT NULL,
        payment_installments INTEGER NOT NULL,
        payment_value REAL NOT NULL,
        PRIMARY KEY (order_id, payment_sequential),
        FOREIGN KEY (order_id) REFERENCES olist_orders (order_id)
    );
    """)

    # 7. Order Reviews Table
    cursor.execute("""
    CREATE TABLE olist_order_reviews (
        review_id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        review_score INTEGER NOT NULL,
        review_comment_title TEXT,
        review_comment_message TEXT,
        review_creation_date TEXT,
        review_answer_timestamp TEXT,
        FOREIGN KEY (order_id) REFERENCES olist_orders (order_id)
    );
    """)

    # 8. Category Translation Table
    cursor.execute("""
    CREATE TABLE product_category_name_translation (
        product_category_name TEXT PRIMARY KEY,
        product_category_name_english TEXT NOT NULL
    );
    """)

    # Seed Sample Data
    categories = [
        ('cama_mesa_banho', 'bed_bath_table'),
        ('beleza_saude', 'health_beauty'),
        ('esporte_lazer', 'sports_leisure'),
        ('informatica_acessorios', 'computers_accessories'),
        ('moveis_decoracao', 'furniture_decor'),
        ('utilidades_domesticas', 'housewares'),
        ('relogios_presentes', 'watches_gifts'),
        ('telefonia', 'telephony'),
        ('automotivo', 'auto'),
        ('brinquedos', 'toys')
    ]
    cursor.executemany("INSERT INTO product_category_name_translation VALUES (?, ?);", categories)

    states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA']
    cities = {'SP': 'Sao Paulo', 'RJ': 'Rio de Janeiro', 'MG': 'Belo Horizonte', 'RS': 'Porto Alegre', 'PR': 'Curitiba', 'SC': 'Florianopolis', 'BA': 'Salvador'}

    # Insert 10 Sellers
    for i in range(1, 11):
        s_id = f"seller_{i:03d}"
        st = states[i % len(states)]
        cursor.execute("INSERT INTO olist_sellers VALUES (?, ?, ?, ?);", (s_id, 1000 + i, cities[st], st))

    # Insert 50 Products
    for i in range(1, 51):
        p_id = f"prod_{i:04d}"
        cat_pt, cat_en = categories[i % len(categories)]
        cursor.execute("INSERT INTO olist_products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                       (p_id, cat_pt, cat_en, 40 + i, 200 + i*5, 2, 800 + i*10, 20, 15, 25))

    # Insert 100 Customers & Orders
    statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'canceled']
    pay_types = ['credit_card', 'credit_card', 'boleto', 'voucher', 'debit_card']

    for i in range(1, 101):
        c_id = f"c_{i:05d}"
        u_id = f"u_{(i % 80) + 1:05d}" # Some repeat customers
        st = states[i % len(states)]
        cursor.execute("INSERT INTO olist_customers VALUES (?, ?, ?, ?, ?);", (c_id, u_id, 12000 + i, cities[st], st))

        o_id = f"ord_{i:05d}"
        status = statuses[i % len(statuses)]
        date_str = f"2023-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}"
        cursor.execute("INSERT INTO olist_orders VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                       (o_id, c_id, status, f"{date_str} 10:30:00", f"{date_str} 10:45:00", f"{date_str} 14:00:00", f"{date_str} 18:00:00", "2023-12-31 23:59:59"))

        # Items
        p_id = f"prod_{(i % 50) + 1:04d}"
        s_id = f"seller_{(i % 10) + 1:03d}"
        price = 50.0 + (i * 3.5)
        freight = 15.0 + (i % 5)
        cursor.execute("INSERT INTO olist_order_items VALUES (?, ?, ?, ?, ?, ?, ?);",
                       (o_id, 1, p_id, s_id, f"{date_str} 23:59:59", price, freight))

        # Payments
        pay_type = pay_types[i % len(pay_types)]
        installments = 1 if pay_type != 'credit_card' else (i % 6) + 1
        cursor.execute("INSERT INTO olist_order_payments VALUES (?, ?, ?, ?, ?);",
                       (o_id, 1, pay_type, installments, price + freight))

        # Reviews
        score = 5 if status == 'delivered' and (i % 7 != 0) else random.choice([1, 2, 3])
        cursor.execute("INSERT INTO olist_order_reviews VALUES (?, ?, ?, ?, ?, ?, ?);",
                       (f"rev_{i:05d}", o_id, score, "Great item", "Fast delivery and good quality.", f"{date_str} 20:00:00", f"{date_str} 21:00:00"))

    conn.commit()
    conn.close()
    print("Database initialized & seeded successfully at:", DB_PATH)

if __name__ == "__main__":
    init_database()

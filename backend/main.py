"""
FastAPI REST API Server for Olist E-Commerce Analytics Engine
Tech Stack: Python 3, FastAPI, SQLite3, Pandas
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from typing import Optional, List, Dict, Any

# Try importing pandas for advanced data frame operations
try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False

app = FastAPI(
    title="Olist E-Commerce Analytics REST API",
    description="Production REST API for Olist marketplace built with FastAPI, SQLite, and Pandas.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "olist.db")
TMP_DB_PATH = "/tmp/olist.db"

def resolve_db_path() -> str:
    # 1. Check if olist.db exists in backend folder
    if os.path.exists(DEFAULT_DB_PATH) and os.path.getsize(DEFAULT_DB_PATH) > 0:
        return DEFAULT_DB_PATH
    # 2. Check if /tmp/olist.db exists
    if os.path.exists(TMP_DB_PATH) and os.path.getsize(TMP_DB_PATH) > 0:
        return TMP_DB_PATH
    # 3. Try initializing at DEFAULT_DB_PATH
    try:
        from backend.init_db import init_database
        init_database(DEFAULT_DB_PATH)
        if os.path.exists(DEFAULT_DB_PATH):
            return DEFAULT_DB_PATH
    except Exception:
        pass
    # 4. Fallback to initializing at /tmp/olist.db
    try:
        from backend.init_db import init_database
        init_database(TMP_DB_PATH)
        return TMP_DB_PATH
    except Exception:
        pass
    return DEFAULT_DB_PATH

def get_db_connection():
    """Obtain a SQLite database connection with Row factory."""
    db_path = resolve_db_path()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Executes a SQL query against SQLite3 database using Pandas if available, or sqlite3 Row factory."""
    conn = get_db_connection()
    if HAS_PANDAS:
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        return df.to_dict(orient="records")
    else:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Olist E-Commerce Analytics API",
        "tech_stack": {
            "language": "Python 3",
            "framework": "FastAPI",
            "database": "SQLite3",
            "data_analysis": "Pandas" if HAS_PANDAS else "SQLite3 Engine"
        },
        "documentation": "/docs"
    }

# ================================
# PART 2: CORE ENTITY REST ENDPOINTS
# ================================

# 1. Products
@app.get("/products", summary="List Products with Pagination")
def get_products(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100)):
    offset = (page - 1) * limit
    records = execute_query("SELECT * FROM olist_products LIMIT ? OFFSET ?", (limit, offset))
    total_res = execute_query("SELECT COUNT(*) as count FROM olist_products")
    total = total_res[0]["count"] if total_res else 0
    
    return {
        "status": "success",
        "page": page,
        "limit": limit,
        "total": total,
        "data": records
    }

@app.get("/products/{product_id}", summary="Get Product Details")
def get_product_by_id(product_id: str):
    records = execute_query("SELECT * FROM olist_products WHERE product_id = ?", (product_id,))
    if not records:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return {"status": "success", "data": records[0]}

# 2. Customers
@app.get("/customers", summary="List Customers with Pagination")
def get_customers(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100)):
    offset = (page - 1) * limit
    records = execute_query("SELECT * FROM olist_customers LIMIT ? OFFSET ?", (limit, offset))
    total_res = execute_query("SELECT COUNT(*) as count FROM olist_customers")
    total = total_res[0]["count"] if total_res else 0
    
    return {
        "status": "success",
        "page": page,
        "limit": limit,
        "total": total,
        "data": records
    }

@app.get("/customers/{customer_id}", summary="Get Customer Details")
def get_customer_by_id(customer_id: str):
    records = execute_query("SELECT * FROM olist_customers WHERE customer_id = ?", (customer_id,))
    if not records:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found.")
    return {"status": "success", "data": records[0]}

# 3. Orders
@app.get("/orders", summary="List Orders with Pagination")
def get_orders(page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=100)):
    offset = (page - 1) * limit
    records = execute_query("SELECT * FROM olist_orders LIMIT ? OFFSET ?", (limit, offset))
    total_res = execute_query("SELECT COUNT(*) as count FROM olist_orders")
    total = total_res[0]["count"] if total_res else 0
    
    return {
        "status": "success",
        "page": page,
        "limit": limit,
        "total": total,
        "data": records
    }

@app.get("/orders/{order_id}", summary="Get Order Summary")
def get_order_by_id(order_id: str):
    records = execute_query("SELECT * FROM olist_orders WHERE order_id = ?", (order_id,))
    if not records:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")
    return {"status": "success", "data": records[0]}

@app.get("/orders/{order_id}/details", summary="Get Full Order Line Items, Customer, and Payment Details")
def get_order_full_details(order_id: str):
    orders = execute_query("SELECT * FROM olist_orders WHERE order_id = ?", (order_id,))
    if not orders:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")
    
    order = orders[0]
    customers = execute_query("SELECT * FROM olist_customers WHERE customer_id = ?", (order['customer_id'],))
    items = execute_query("SELECT * FROM olist_order_items WHERE order_id = ?", (order_id,))
    payments = execute_query("SELECT * FROM olist_order_payments WHERE order_id = ?", (order_id,))
    reviews = execute_query("SELECT * FROM olist_order_reviews WHERE order_id = ?", (order_id,))

    return {
        "status": "success",
        "data": {
            "order": order,
            "customer": customers[0] if customers else None,
            "items": items,
            "payments": payments,
            "reviews": reviews
        }
    }

# 4. Categories
@app.get("/categories", summary="List All Product Categories")
def get_categories():
    records = execute_query("SELECT DISTINCT product_category_name_english FROM olist_products WHERE product_category_name_english IS NOT NULL")
    cats = [r["product_category_name_english"] for r in records]
    return {"status": "success", "categories": cats}

@app.get("/categories/translation", summary="Get Category Portuguese to English Translations")
def get_category_translations():
    records = execute_query("SELECT * FROM product_category_name_translation")
    return {"status": "success", "translations": records}

# ================================
# PART 3: ADVANCED ANALYTICS (PANDAS & SQL)
# ================================

@app.get("/analytics/top-selling-products", summary="Top 10 Selling Products by Volume")
def top_selling_products():
    query = """
    SELECT 
        i.product_id,
        p.product_category_name_english as category,
        COUNT(i.order_item_id) as units_sold,
        ROUND(SUM(i.price), 2) as total_revenue
    FROM olist_order_items i
    LEFT JOIN olist_products p ON i.product_id = p.product_id
    GROUP BY i.product_id
    ORDER BY units_sold DESC
    LIMIT 10;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Top 10 Selling Products", "data": records}

@app.get("/analytics/top-revenue-products", summary="Top 10 Revenue Generating Products")
def top_revenue_products():
    query = """
    SELECT 
        i.product_id,
        p.product_category_name_english as category,
        COUNT(i.order_item_id) as units_sold,
        ROUND(SUM(i.price), 2) as total_revenue
    FROM olist_order_items i
    LEFT JOIN olist_products p ON i.product_id = p.product_id
    GROUP BY i.product_id
    ORDER BY total_revenue DESC
    LIMIT 10;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Top 10 Revenue Generating Products", "data": records}

@app.get("/analytics/monthly-revenue", summary="Monthly Revenue Trend Analysis")
def monthly_revenue():
    query = """
    SELECT 
        strftime('%Y-%m', o.order_purchase_timestamp) as year_month,
        ROUND(SUM(p.payment_value), 2) as monthly_revenue,
        COUNT(DISTINCT o.order_id) as order_count
    FROM olist_orders o
    JOIN olist_order_payments p ON o.order_id = p.order_id
    WHERE o.order_status = 'delivered'
    GROUP BY year_month
    ORDER BY year_month ASC;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Monthly Revenue", "data": records}

@app.get("/analytics/revenue-by-state", summary="Revenue Distribution by Brazilian State")
def revenue_by_state():
    query = """
    SELECT 
        c.customer_state,
        ROUND(SUM(p.payment_value), 2) as revenue,
        COUNT(DISTINCT o.order_id) as total_orders
    FROM olist_orders o
    JOIN olist_customers c ON o.customer_id = c.customer_id
    JOIN olist_order_payments p ON o.order_id = p.order_id
    GROUP BY c.customer_state
    ORDER BY revenue DESC;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Revenue by State", "data": records}

@app.get("/analytics/revenue-by-category", summary="Revenue by Product Category")
def revenue_by_category():
    query = """
    SELECT 
        COALESCE(p.product_category_name_english, 'other') as category,
        ROUND(SUM(i.price), 2) as category_revenue,
        COUNT(i.order_item_id) as items_sold
    FROM olist_order_items i
    LEFT JOIN olist_products p ON i.product_id = p.product_id
    GROUP BY category
    ORDER BY category_revenue DESC;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Revenue by Category", "data": records}

@app.get("/analytics/aov", summary="Average Order Value (AOV)")
def average_order_value():
    query = """
    SELECT 
        ROUND(SUM(payment_value) / COUNT(DISTINCT order_id), 2) as average_order_value,
        ROUND(SUM(payment_value), 2) as total_gmv,
        COUNT(DISTINCT order_id) as total_orders
    FROM olist_order_payments;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Average Order Value", "data": records[0] if records else {}}

@app.get("/analytics/cancellation-rate", summary="Order Cancellation Rate %")
def cancellation_rate():
    query = """
    SELECT 
        COUNT(order_id) as total_orders,
        SUM(CASE WHEN order_status = 'canceled' THEN 1 ELSE 0 END) as canceled_orders,
        ROUND((CAST(SUM(CASE WHEN order_status = 'canceled' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(order_id)) * 100, 2) as cancellation_rate_pct
    FROM olist_orders;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Cancellation Rate", "data": records[0] if records else {}}

@app.get("/analytics/repeat-customers", summary="Repeat Customer Analysis")
def repeat_customers():
    query = """
    WITH CustomerOrderCounts AS (
        SELECT customer_unique_id, COUNT(customer_id) as order_count
        FROM olist_customers
        GROUP BY customer_unique_id
    )
    SELECT 
        COUNT(customer_unique_id) as total_unique_customers,
        SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) as repeat_customers,
        ROUND((CAST(SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(customer_unique_id)) * 100, 2) as repeat_rate_pct
    FROM CustomerOrderCounts;
    """
    records = execute_query(query)
    return {"status": "success", "metric": "Repeat Customers", "data": records[0] if records else {}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

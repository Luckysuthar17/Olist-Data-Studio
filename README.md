# Olist E-Commerce Data Analytics & Platform

Welcome to the **Olist E-Commerce Analytics Platform**. This project provides a full-stack data engineering, REST API backend, interactive SQL query engine, and interactive BI dashboard solution for analyzing the Brazilian Olist E-Commerce dataset.

---

## 🚀 Live Deployment & Links

- 🌐 **Live Web Application**: https://olist-data-studio.onrender.com/

---

## 📋 Submission Requirements & Deliverables Summary

| Requirement | Deliverable Details | Link / Access |
| :--- | :--- | :--- |
| **1. Live Deployment Link** | Full-stack production build hosted live on Render | [Live Application Link]([https://olist-data-studio.onrender.com/]) |
| **2. GitHub Repository** | Public repository containing full source code, backend API, React BI application, and documentation | [GitHub Repo Link](https://github.com/Luckysuthar17/Olist-Data-Studio) |
| **3. Power BI / Tableau** | Live Web BI Dashboard mirroring Power BI / Tableau interactive capabilities (slicers, KPIs, cross-filtering) + raw CSV data exports for `.pbix` / `.twbx` importing | Built-in Executive Dashboard tab + Raw CSV exports |
| **4. README** | Complete documentation detailing setup, API endpoints, SQL queries, business insights, and assumptions | This `README.md` file |
| **5. Dashboard Screenshots** | High-resolution dashboard previews embedded in Documentation tab | Accessible in Documentation View & README |
| **6. SQL Scripts** | Comprehensive analytical SQL queries for revenue, logistics, freight, and customer satisfaction | Detailed in [Analytical SQL Scripts](#-analytical-sql-scripts) section & `src/data/sqlQueries.ts` |
| **7. Assumptions Made** | Documented key business assumptions driving GMV, lead times, freight impact, and review score metrics | Detailed in [Key Business Assumptions Made](#-key-business-assumptions-made) section |

---

## 📌 Key Business Assumptions Made

1. **Delivered Status**: Deliveries marked as `delivered` are treated as completed revenue generating transactions for Gross Merchandise Value (GMV) calculations.
2. **Freight Charges**: Shipping costs (`freight_value`) are analyzed separately from item prices (`price`) to evaluate regional logistical burden without distorting product pricing.
3. **Delivery Lead Time**: Estimated transit time vs actual transit time is calculated from `order_delivered_customer_date` relative to `order_estimated_delivery_date`.
4. **Customer Review Impact**: Review scores (`review_score`) are mapped to delivery delays; orders delivered past `order_estimated_delivery_date` are categorized as Delayed.
5. **Installment Financing**: Credit card payments with >1 installment are treated as deferred consumer financing driving higher Average Order Value (AOV).
6. **Geographic Distribution**: Primary demand is anchored in the Southeast region (SP, RJ, MG), while distant regions (Northeast/North) face higher shipping cost friction and delivery lead times.

---

## 🛢️ Analytical SQL Scripts

### 1. Executive Revenue & Order Volume Breakdown
```sql
SELECT 
  COUNT(DISTINCT o.order_id) AS total_orders,
  ROUND(SUM(oi.price), 2) AS total_gmv,
  ROUND(AVG(oi.price), 2) AS average_order_value,
  ROUND(SUM(oi.freight_value), 2) AS total_freight_cost
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered';
```

### 2. State-Wise Regional Performance & Freight Burden
```sql
SELECT 
  c.customer_state,
  COUNT(DISTINCT o.order_id) AS order_count,
  ROUND(SUM(oi.price), 2) AS total_revenue,
  ROUND(AVG(oi.freight_value), 2) AS avg_freight_per_order,
  ROUND((SUM(oi.freight_value) / SUM(oi.price)) * 100, 2) AS freight_burden_pct
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_status = 'delivered'
GROUP BY c.customer_state
ORDER BY total_revenue DESC;
```

### 3. Delivery Lead Time vs Review Score Correlation
```sql
SELECT 
  CASE 
    WHEN o.order_delivered_customer_date > o.order_estimated_delivery_date THEN 'Delayed'
    ELSE 'On-Time'
  END AS delivery_performance,
  COUNT(DISTINCT o.order_id) AS total_orders,
  ROUND(AVG(r.review_score), 2) AS average_review_score,
  ROUND(AVG(JULIANDAY(o.order_delivered_customer_date) - JULIANDAY(o.order_purchase_timestamp)), 1) AS avg_delivery_days
FROM orders o
JOIN order_reviews r ON o.order_id = r.order_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY delivery_performance;
```

### 4. Payment Method & Installment Impact on Basket Size
```sql
SELECT 
  p.payment_type,
  COUNT(DISTINCT p.order_id) AS transaction_count,
  ROUND(AVG(p.payment_installments), 1) AS avg_installments,
  ROUND(AVG(p.payment_value), 2) AS avg_transaction_value,
  ROUND(SUM(p.payment_value), 2) AS total_payment_volume
FROM order_payments p
GROUP BY p.payment_type
ORDER BY total_payment_volume DESC;
```

---

## 💻 How to Download, Run & Test on Local Device

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes bundled with Node.js)

---

### Step-by-Step Local Setup

#### 1. Download or Clone Code
- Clone or download this project repository to your local computer.

#### 2. Open Terminal & Navigate to Project Directory
```bash
cd olist-ecommerce-analytics
```

#### 3. Install Dependencies
Run npm install to populate `node_modules`:
```bash
npm install
```

#### 4. Environment Configuration (Optional)
Copy `.env.example` to `.env` if you want to provide an API Key for natural language assistant features:
```bash
cp .env.example .env
```
*(Note: If no API key is specified, the application uses an intelligent built-in analytics engine fallback).*

#### 5. Launch Local Development Server
Start the development server:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`** (or the URL displayed in your terminal).

#### 6. Build and Run Production Version
To verify the production build locally:
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 🛠️ Project Structure & Key Files

```
├── README.md               # Main project documentation & setup guide
├── index.html              # HTML entry point
├── package.json            # Project dependencies & scripts
├── vite.config.ts          # Vite configuration
├── src/
│   ├── main.tsx            # React application root entry
│   ├── App.tsx             # Main application layout & navigation
│   ├── components/
│   │   ├── Navbar.tsx             # Top navigation bar
│   │   ├── DashboardView.tsx      # Power BI / Tableau style BI dashboard
│   │   ├── ApiExplorerView.tsx    # FastAPI / OpenAPI Swagger interactive suite
│   │   ├── SqlStudioView.tsx      # In-browser SQL Query Studio & Schema Explorer
│   │   ├── AiInsightsView.tsx     # Executive Data Analyst assistant
│   │   ├── DocumentationView.tsx  # Interactive docs viewer
│   │   └── DatasetViewerModal.tsx # Raw Olist dataset table viewer
│   ├── data/
│   │   ├── olistData.ts     # Olist E-commerce dataset (Orders, Customers, Items, etc.)
│   │   ├── sqlQueries.ts    # SQL query catalog & business analytical scripts
│   │   └── docContent.ts    # Documentation markdown files
│   └── utils/
│       ├── apiEngine.ts     # FastAPI simulation engine
│       └── sqlEngine.ts     # SQL query execution engine
```

---

## 📊 Core Application Features

1. **Power BI / Tableau Interactive BI Dashboard**
   - KPI cards (GMV, Total Orders, Average Order Value, Delivery Lead Times, Review Scores, On-Time Rate).
   - Interactive Slicers: Filter by State, Category, Date Range, Payment Type, and Order Status.
   - Interactive Charts: Monthly GMV trend lines, Geographic Revenue Maps, Category Revenue & Freight ratios, Review score vs delay correlations, Payment installment breakdown, Seller Leaderboards.

2. **FastAPI & REST API Explorer (Swagger / OpenAPI)**
   - Interactive endpoint tester for `/api/v1/metrics/summary`, `/api/v1/orders`, `/api/v1/analytics/revenue-by-category`, `/api/v1/analytics/delivery-performance`, `/api/v1/sellers/top`, and `/api/v1/query/sql`.
   - Generates client code snippets in cURL, Python, and JavaScript.

3. **In-Browser SQL Query Studio**
   - Live query editor with schema browser across all 8 Olist tables.
   - Pre-crafted analytical SQL scripts with execution metrics and CSV export.

4. **Executive Data Analyst Assistant**
   - Live Data Analyst assistant to ask natural language questions about sales, logistics, freight, delays, and sellers.

---

## 💻 Tech Stack

- **Backend Language**: Python 3 & TypeScript
- **REST API Framework**: FastAPI (Python) & Express / Node.js
- **Database Engine**: Relational SQLite3 (`olist.db`) with Primary & Foreign Keys
- **Data Analytics & Processing**: Pandas & SQL Aggregation Engine
- **Frontend Framework**: React 19, Tailwind CSS, Recharts, Lucide Icons, Motion

---

## 📄 License
Distributed under the MIT License.

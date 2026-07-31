export const README_MD = `# Olist E-Commerce Data Analytics & FastAPI Platform

Welcome to the **Olist E-Commerce Analytics Platform**. This project provides a full-stack data engineering, REST API backend, interactive SQL query engine, and interactive BI dashboard solution for analyzing the Brazilian Olist E-Commerce dataset.

---

## 💻 Local Setup & Execution Guide

Follow these steps to run and test this application on your local machine:

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)

### 1. Installation
Clone or download the project files into a folder on your computer, navigate into the directory, and install dependencies:

\`\`\`bash
# Install dependencies
npm install
\`\`\`

### 2. Environment Variables (Optional)
Copy \`.env.example\` to \`.env\` if you wish to configure a custom Gemini API key for real-time AI responses:

\`\`\`bash
cp .env.example .env
\`\`\`

*Note: If no key is set, the application automatically uses its built-in rule-based intelligence engine.*

### 3. Run Development Server
Start the local Vite development server:

\`\`\`bash
npm run dev
\`\`\`

Open your browser and navigate to \`http://localhost:3000\` (or the port specified in terminal output, e.g. \`http://localhost:5173\`).

### 4. Build for Production
To build the application for deployment or production testing:

\`\`\`bash
npm run build
\`\`\`

To preview the built production bundle locally:

\`\`\`bash
npm run start
\`\`\`

---

## 🚀 Key Features

1. **Interactive BI Executive Dashboard (Power BI / Tableau Style)**
   - **Metrics Overview**: GMV, Total Orders, Average Order Value (AOV), Delivery Lead Time, On-time Delivery %, Average Review Score.
   - **Interactive Slicers**: Filter by Date Range, Customer State, Product Category, Payment Type, and Order Status.
   - **Visualizations**: Monthly GMV trend lines, Geographic Revenue Maps/Bars, Top Product Categories, Delivery Delay vs Review Score correlations, Payment Installment Breakdown, Seller Leaderboards.

2. **FastAPI & REST API Explorer (Swagger / OpenAPI Interactive Suite)**
   - Complete endpoint implementation and live interactive request runner:
     - \`GET /api/v1/metrics/summary\` - High-level KPIs & performance summary
     - \`GET /api/v1/orders\` - Search & filter orders with pagination
     - \`GET /api/v1/orders/{order_id}\` - Single order full payload (items, customer, payment, review)
     - \`GET /api/v1/analytics/revenue-by-category\` - Category breakdown with freight ratio
     - \`GET /api/v1/analytics/delivery-performance\` - Delivery delay metrics & review impact
     - \`GET /api/v1/sellers/top\` - Top sellers leaderboard
     - \`POST /api/v1/query/sql\` - Execute custom SQL queries against the dataset
     - \`GET /api/v1/insights/ai\` - Executive insights powered by Gemini AI / Analytics Engine

3. **In-Browser SQL Query Studio**
   - Live query editor with schema browser across all 8 Olist tables.
   - Pre-crafted analytical SQL scripts covering MoM growth, delivery delay impact, category freight ratios, state distribution, and payment behavior.
   - Results tabular grid with execution timer and CSV export.

4. **AI-Powered Data Analyst Assistant**
   - Integration with Google Gemini API to explain dataset trends, generate executive summaries, perform anomaly detection, and recommend strategic actions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Motion
- **API Runtime**: FastAPI REST Engine simulator & Express Node server proxy
- **Database Engine**: In-memory relational SQLite engine with Olist E-Commerce Schema
- **AI Analytics**: @google/genai (Gemini 2.5/Flash AI models)

---

## 📐 Database Schema & Assumptions

The solution builds upon the standard Olist relational schema:
- \`olist_orders_dataset\` (order_id, customer_id, order_status, order_purchase_timestamp, etc.)
- \`olist_customers_dataset\` (customer_id, customer_unique_id, zip_code, city, state)
- \`olist_order_items_dataset\` (order_id, order_item_id, product_id, seller_id, price, freight_value)
- \`olist_products_dataset\` (product_id, product_category_name, English category, dimensions, weight)
- \`olist_sellers_dataset\` (seller_id, city, state)
- \`olist_order_payments_dataset\` (order_id, payment_type, installments, payment_value)
- \`olist_order_reviews_dataset\` (review_id, order_id, review_score, review_comment)

### Business & Analytical Assumptions:
1. **GMV Calculation**: Gross Merchandise Value is computed based on \`payment_value\` or \`price + freight_value\` for delivered orders.
2. **Delivery Performance**: An order is classified as **Delayed** if \`order_delivered_customer_date > order_estimated_delivery_date\`.
3. **Repeat Customer Metric**: Computed using \`customer_unique_id\` count per user (>1 order = repeat buyer).
4. **Freight Share**: Freight burden is evaluated as \`freight_value / item_price * 100\`.
`;

export const CANDIDATE_TASK_MD = `# Candidate Task Specification: Game Data Analyst / E-Commerce Data Analyst

## Overview
As a Data Analyst for Olist, your objective is to analyze transaction records, evaluate operational logistics, understand customer purchasing habits, build REST API endpoints, and deliver actionable business dashboards.

---

## Task Requirements & Breakdown

### 1. Data Cleaning & SQL Engineering
- Write production-ready SQL scripts to answer business questions:
  - Monthly GMV and MoM growth rate calculation
  - On-Time vs Delayed Delivery effect on customer satisfaction (1-5 review scores)
  - Top 10 Product Categories by Revenue and Freight Cost Ratio
  - Customer Geographic Revenue Concentration across Brazilian states (SP, RJ, MG, etc.)
  - Seller Concentration and Pareto Analysis
  - Credit Card Installment behavior analysis

### 2. FastAPI Endpoint Development
- Build RESTful endpoints adhering to OpenAPI specs:
  - Metrics Summary Endpoint
  - Orders Query & Detail Endpoints
  - Category Analytics Endpoint
  - Delivery Performance Endpoint
  - Custom SQL Execution Endpoint

### 3. Power BI / Tableau Interactive Dashboard
- Construct an executive dashboard with interactive filters (Slicers):
  - **Executive Summary Page**: High-level KPIs & Revenue trends
  - **Logistics & Delivery Page**: Delivery lead times, delays, and state delivery maps
  - **Product & Category Page**: Revenue contribution, freight burden
  - **Customer & Reviews Page**: Review distribution and payment method choices

### 4. Strategic Business Insights
- Provide concrete recommendations based on data findings regarding delivery bottleneck mitigation, freight subsidization for high-weight products, and credit card installment promotions.
`;

export const SUBMISSION_GUIDELINES_MD = `# Submission Guidelines & Assessment Criteria

## Deliverables Checklist
- [x] Functional REST API (FastAPI standard compliant)
- [x] Complete SQL Query collection
- [x] Interactive Power BI / Tableau style dashboard
- [x] Documentation & README setup instructions
- [x] AI-assisted analytical summary & strategic recommendations

## Assessment Criteria
1. **Code Quality & Architecture**: Clean modular TypeScript/Python code, type definitions, error handling.
2. **Analytical Rigor**: Correct SQL aggregations, window functions, and business logic.
3. **UI/UX Craftsmanship**: Polished desktop dashboard with responsive layout, clean contrast, clear visual hierarchy.
4. **Data Presentation**: Clear visual charts, metric cards, and intuitive filter slicers.
`;

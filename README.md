# Olist E-Commerce Data Analytics & FastAPI Platform

Welcome to the **Olist E-Commerce Analytics Platform**. This project provides a full-stack data engineering, REST API backend, interactive SQL query engine, and interactive BI dashboard solution for analyzing the Brazilian Olist E-Commerce dataset.

---

## 💻 How to Download, Run & Test on Local Device

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes bundled with Node.js)

---

### Step-by-Step Local Setup

#### 1. Download or Export Code
- **Export via AI Studio**: Click **Settings** -> **Export to GitHub** or **Download ZIP**.
- Unzip the downloaded file onto your local computer.

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
Copy `.env.example` to `.env` if you want to provide a custom Groq API Key for AI features:
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
│   │   ├── AiInsightsView.tsx     # Groq AI Data Analyst assistant
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

4. **AI-Powered Executive Insights**
   - Live Groq AI Data Analyst assistant to ask natural language questions about sales, logistics, freight, delays, and sellers.

---

## 📄 License
Distributed under the MIT License.

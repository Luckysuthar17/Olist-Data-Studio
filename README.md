# Olist E-Commerce Data Analytics & FastAPI Platform

Welcome to the **Olist E-Commerce Analytics Platform**. This project provides a full-stack data engineering, REST API backend, interactive SQL query engine, and interactive BI dashboard solution for analyzing the Brazilian Olist E-Commerce dataset.

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

## 🌐 Deployment on Render (Render.com)

You can easily deploy this full-stack application to **Render** as either a **Web Service** or a **Static Site**.

### Option A: Web Service Deployment (Recommended)
This deploys both the Node.js API server and serves the compiled React application.

1. **Push your code to GitHub**: Create a repository and push your project code.
2. **Log into Render**: Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** -> **Web Service**.
3. **Connect Repository**: Select your GitHub repository.
4. **Configure Web Service**:
   - **Name**: `olist-analytics-platform`
   - **Environment / Runtime**: `Node`
   - **Region**: Choose your nearest region (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables** (Optional):
   - Under **Environment Variables**, add:
     - `GROQ_API_KEY`: *(Optional API Key for natural language assistant)*
     - `NODE_ENV`: `production`
6. **Click "Create Web Service"**: Render will build and deploy your app. Once deployed, you will get a live URL (e.g., `https://olist-analytics-platform.onrender.com`).

---

### Option B: Render Blueprint Deployment (1-Click)
Since this repository includes a `render.yaml` file:

1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically read `render.yaml` and set up the Web Service automatically.
4. Click **Apply**.

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

import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Code, 
  Terminal, 
  Database, 
  Layers, 
  Truck, 
  ShoppingBag, 
  Sparkles,
  Search,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';
import { handleApiRequest, ApiResponse } from '../utils/apiEngine';

interface ApiEndpointDef {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  params: { name: string; type: string; default?: string; description: string; required?: boolean }[];
  defaultBody?: string;
}

const ENDPOINTS: ApiEndpointDef[] = [
  {
    id: 'ep-1',
    method: 'GET',
    path: '/api/v1/metrics/summary',
    title: 'Get Metrics Summary',
    description: 'Returns overall Gross Merchandise Value (GMV), total completed orders, average order value (AOV), review scores, and on-time delivery rate.',
    params: []
  },
  {
    id: 'ep-2',
    method: 'GET',
    path: '/api/v1/orders',
    title: 'Search Orders List',
    description: 'Retrieves a paginated list of orders with optional state and status filter parameters.',
    params: [
      { name: 'status', type: 'string', default: 'delivered', description: 'Filter by order_status (delivered, shipped, canceled)' },
      { name: 'customer_state', type: 'string', default: 'SP', description: 'Filter by 2-letter Brazilian state code (SP, RJ, MG, etc.)' },
      { name: 'page', type: 'integer', default: '1', description: 'Page number' },
      { name: 'limit', type: 'integer', default: '5', description: 'Records per page' },
    ]
  },
  {
    id: 'ep-3',
    method: 'GET',
    path: '/api/v1/orders/ord_00001',
    title: 'Get Order Details',
    description: 'Fetch detailed payload for a single order including items, customer, seller states, payment, and review ratings.',
    params: []
  },
  {
    id: 'ep-4',
    method: 'GET',
    path: '/api/v1/analytics/revenue-by-category',
    title: 'Revenue by Product Category',
    description: 'Retrieves total revenue, total freight cost, freight-to-price ratio %, and item counts grouped by product category.',
    params: []
  },
  {
    id: 'ep-5',
    method: 'GET',
    path: '/api/v1/analytics/delivery-performance',
    title: 'Delivery & Logistics Analytics',
    description: 'Analyzes on-time vs delayed order delivery metrics and average lead times aggregated by Brazilian state.',
    params: []
  },
  {
    id: 'ep-6',
    method: 'GET',
    path: '/api/v1/sellers/top',
    title: 'Top Sellers Leaderboard',
    description: 'Lists top revenue-generating marketplace sellers with sales totals and order counts.',
    params: [
      { name: 'limit', type: 'integer', default: '5', description: 'Number of sellers to return' }
    ]
  },
  {
    id: 'ep-7',
    method: 'POST',
    path: '/api/v1/query/sql',
    title: 'Execute SQL Query',
    description: 'Run custom SQL query payload against Olist dataset tables (olist_orders_dataset, olist_customers_dataset, etc.)',
    params: [],
    defaultBody: JSON.stringify({
      sql: "SELECT customer_state, COUNT(order_id) AS total_orders FROM olist_orders_dataset GROUP BY customer_state LIMIT 5;"
    }, null, 2)
  },
  {
    id: 'ep-8',
    method: 'GET',
    path: '/api/v1/products',
    title: 'Get Products Catalog',
    description: 'Retrieves paginated list of products in the Olist database.',
    params: [
      { name: 'page', type: 'integer', default: '1', description: 'Page number' },
      { name: 'limit', type: 'integer', default: '10', description: 'Records per page' }
    ]
  },
  {
    id: 'ep-9',
    method: 'GET',
    path: '/api/v1/customers',
    title: 'Get Customers List',
    description: 'Retrieves paginated list of customers with zip code, city, and state information.',
    params: [
      { name: 'page', type: 'integer', default: '1', description: 'Page number' },
      { name: 'limit', type: 'integer', default: '10', description: 'Records per page' }
    ]
  },
  {
    id: 'ep-10',
    method: 'GET',
    path: '/api/v1/categories',
    title: 'Get Categories List',
    description: 'Returns list of all distinct product categories.',
    params: []
  },
  {
    id: 'ep-11',
    method: 'GET',
    path: '/api/v1/analytics/top-selling-products',
    title: 'Top 10 Selling Products',
    description: 'Returns top 10 products sorted by volume of units sold.',
    params: []
  },
  {
    id: 'ep-12',
    method: 'GET',
    path: '/api/v1/analytics/monthly-revenue',
    title: 'Monthly Revenue Trend',
    description: 'Aggregates total GMV payment volume grouped by year-month.',
    params: []
  },
  {
    id: 'ep-13',
    method: 'GET',
    path: '/api/v1/analytics/revenue-by-state',
    title: 'Revenue Distribution by State',
    description: 'Aggregates total sales revenue across Brazilian state codes.',
    params: []
  },
  {
    id: 'ep-14',
    method: 'GET',
    path: '/api/v1/analytics/cancellation-rate',
    title: 'Order Cancellation Rate',
    description: 'Calculates overall percentage of canceled orders.',
    params: []
  },
  {
    id: 'ep-15',
    method: 'GET',
    path: '/api/v1/analytics/repeat-customers',
    title: 'Repeat Customer Metrics',
    description: 'Measures total unique customers vs repeat buyers count and repeat rate percentage.',
    params: []
  },
  {
    id: 'ep-16',
    method: 'GET',
    path: '/api/v1/insights/ai',
    title: 'Executive Business Briefing Insights',
    description: 'Retrieves executive briefing, operational findings, and strategic recommendations.',
    params: []
  }
];

export const ApiExplorerView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDef>(ENDPOINTS[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    ENDPOINTS[0].params.forEach(p => {
      init[p.name] = p.default || '';
    });
    return init;
  });

  const [bodyText, setBodyText] = useState<string>(ENDPOINTS[0].defaultBody || '');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'javascript'>('curl');

  const handleSelectEndpoint = (ep: ApiEndpointDef) => {
    setSelectedEndpoint(ep);
    const newParams: Record<string, string> = {};
    ep.params.forEach(p => {
      newParams[p.name] = p.default || '';
    });
    setParamValues(newParams);
    setBodyText(ep.defaultBody || '');
    setResponse(null);
  };

  const handleRunRequest = () => {
    setLoading(true);

    let bodyJson: Record<string, any> = {};
    if (selectedEndpoint.method === 'POST' && bodyText) {
      try {
        bodyJson = JSON.parse(bodyText);
      } catch (err) {
        setResponse({
          status: 'error',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          endpoint: selectedEndpoint.path,
          method: 'POST',
          message: 'Invalid JSON payload in request body'
        });
        setLoading(false);
        return;
      }
    }

    setTimeout(() => {
      const res = handleApiRequest(
        selectedEndpoint.method,
        selectedEndpoint.path,
        paramValues,
        bodyJson
      );
      setResponse(res);
      setLoading(false);
    }, 150);
  };

  // Generate URL string with query params
  const queryString = Object.entries(paramValues)
    .filter(([_, v]) => String(v || '').trim() !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

  const fullUrl = `${selectedEndpoint.path}${queryString ? '?' + queryString : ''}`;

  // Code snippet generators
  const generateCodeSnippet = () => {
    const host = window.location.origin;
    if (activeCodeTab === 'curl') {
      if (selectedEndpoint.method === 'GET') {
        return `curl -X GET "${host}${fullUrl}" \\\n  -H "Accept: application/json"`;
      } else {
        return `curl -X POST "${host}${fullUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyText.replace(/\n/g, '')}'`;
      }
    } else if (activeCodeTab === 'python') {
      return `import requests\n\nurl = "${host}${fullUrl}"\nheaders = {"Accept": "application/json"}\n\nresponse = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers${selectedEndpoint.method === 'POST' ? `, json=${bodyText}` : ''})\nprint(response.json())`;
    } else {
      return `const response = await fetch("${host}${fullUrl}", {\n  method: "${selectedEndpoint.method}",\n  headers: { "Content-Type": "application/json" }${selectedEndpoint.method === 'POST' ? `,\n  body: JSON.stringify(${bodyText})` : ''}\n});\nconst data = await response.json();\nconsole.log(data);`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Sidebar: Endpoints Navigation */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span>FastAPI REST Endpoints</span>
        </div>

        <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
          {ENDPOINTS.map(ep => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isSelected 
                    ? 'bg-indigo-50/80 border-indigo-200 text-slate-900 shadow-xs' 
                    : 'bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    ep.method === 'GET' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-semibold truncate text-slate-800">{ep.path}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium truncate">
                  {ep.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Request & Response Workbench */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Endpoint Detail & Form Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  selectedEndpoint.method === 'GET' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-base font-mono font-bold text-slate-900">{selectedEndpoint.path}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedEndpoint.description}</p>
            </div>

            <button
              onClick={handleRunRequest}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Executing...' : 'Execute Request'}</span>
            </button>
          </div>

          {/* Query Parameters Form */}
          {selectedEndpoint.params.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Query Parameters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedEndpoint.params.map(p => (
                  <div key={p.name} className="flex flex-col">
                    <label className="text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
                      <span className="font-mono">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.type}</span>
                    </label>
                    <input
                      type="text"
                      value={paramValues[p.name] || ''}
                      onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                      placeholder={p.default || p.description}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JSON Body Form (for POST requests) */}
          {selectedEndpoint.method === 'POST' && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Request Body (JSON)</h4>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-800 text-amber-300 text-xs font-mono rounded-lg p-3 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Generated Code Snippet */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">Client Code Snippet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setActiveCodeTab('curl')}
                    className={`px-2 py-0.5 rounded transition-colors ${activeCodeTab === 'curl' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-2 py-0.5 rounded transition-colors ${activeCodeTab === 'python' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('javascript')}
                    className={`px-2 py-0.5 rounded transition-colors ${activeCodeTab === 'javascript' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    JS
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  title="Copy code snippet"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2.5 bg-slate-950/80 rounded-lg">
              {generateCodeSnippet()}
            </pre>
          </div>

        </div>

        {/* Live Response Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Live Response Payload</span>
            </h3>

            {response && (
              <div className="flex items-center space-x-3 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                  response.statusCode === 200 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {response.statusCode} {response.status.toUpperCase()}
                </span>
                {response.meta?.executionTimeMs && (
                  <span className="text-slate-500 font-mono text-[11px]">
                    Latency: {response.meta.executionTimeMs} ms
                  </span>
                )}
              </div>
            )}
          </div>

          {!response ? (
            <div className="py-12 text-center space-y-2">
              <Globe className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs text-slate-500">Click <strong className="text-indigo-600 font-semibold">Execute Request</strong> above to trigger live API response.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[500px]">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

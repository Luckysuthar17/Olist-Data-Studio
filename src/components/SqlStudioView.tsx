import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Database, 
  Code, 
  Clock, 
  Copy, 
  Check, 
  HelpCircle, 
  Table, 
  ChevronRight,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { PRESET_SQL_QUERIES, SqlQueryItem } from '../data/sqlQueries';
import { executeSqlQuery, SqlResult } from '../utils/sqlEngine';
import { OLIST_DATABASE } from '../data/olistData';

export const SqlStudioView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<SqlQueryItem>(PRESET_SQL_QUERIES[0]);
  const [sqlText, setSqlText] = useState<string>(PRESET_SQL_QUERIES[0].sql);
  const [result, setResult] = useState<SqlResult | null>(() => executeSqlQuery(PRESET_SQL_QUERIES[0].sql));
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSchemaTable, setActiveSchemaTable] = useState<string>('olist_orders_dataset');

  const handleSelectPreset = (preset: SqlQueryItem) => {
    setSelectedPreset(preset);
    setSqlText(preset.sql);
    const res = executeSqlQuery(preset.sql);
    setResult(res);
  };

  const handleRunSql = () => {
    setLoading(true);
    setTimeout(() => {
      const res = executeSqlQuery(sqlText);
      setResult(res);
      setLoading(false);
    }, 100);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result || !result.rows || result.rows.length === 0) return;

    const headers = result.columns.join(',');
    const rowsText = result.rows.map(row => 
      result.columns.map(col => {
        const val = row[col];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rowsText}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `olist_sql_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // List of tables for Schema Explorer
  const schemaTables = [
    { name: 'olist_orders_dataset', rows: OLIST_DATABASE.olist_orders_dataset.length, cols: ['order_id', 'customer_id', 'order_status', 'order_purchase_timestamp', 'order_approved_at', 'order_delivered_carrier_date', 'order_delivered_customer_date', 'order_estimated_delivery_date'] },
    { name: 'olist_customers_dataset', rows: OLIST_DATABASE.olist_customers_dataset.length, cols: ['customer_id', 'customer_unique_id', 'customer_zip_code_prefix', 'customer_city', 'customer_state'] },
    { name: 'olist_order_items_dataset', rows: OLIST_DATABASE.olist_order_items_dataset.length, cols: ['order_id', 'order_item_id', 'product_id', 'seller_id', 'shipping_limit_date', 'price', 'freight_value'] },
    { name: 'olist_products_dataset', rows: OLIST_DATABASE.olist_products_dataset.length, cols: ['product_id', 'product_category_name', 'product_category_name_english', 'product_weight_g', 'product_photos_qty'] },
    { name: 'olist_sellers_dataset', rows: OLIST_DATABASE.olist_sellers_dataset.length, cols: ['seller_id', 'seller_zip_code_prefix', 'seller_city', 'seller_state'] },
    { name: 'olist_order_payments_dataset', rows: OLIST_DATABASE.olist_order_payments_dataset.length, cols: ['order_id', 'payment_sequential', 'payment_type', 'payment_installments', 'payment_value'] },
    { name: 'olist_order_reviews_dataset', rows: OLIST_DATABASE.olist_order_reviews_dataset.length, cols: ['review_id', 'order_id', 'review_score', 'review_comment_title', 'review_comment_message'] },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Left Sidebar: Query Presets & Schema Browser */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Presets Library */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Code className="w-4 h-4 text-indigo-600" />
            <span>Analytical Query Catalog</span>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {PRESET_SQL_QUERIES.map(p => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected 
                      ? 'bg-indigo-50/80 border-indigo-200 text-slate-900 shadow-xs' 
                      : 'bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {p.category}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1.5">
                    {p.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schema Browser */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Schema Explorer (8 Tables)</span>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {schemaTables.map(t => {
              const isOpen = activeSchemaTable === t.name;
              return (
                <div key={t.name} className="bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                  <button
                    onClick={() => setActiveSchemaTable(isOpen ? '' : t.name)}
                    className="w-full flex items-center justify-between p-2.5 text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate font-mono">
                      <Table className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate font-medium">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono ml-2">{t.rows} recs</span>
                  </button>

                  {isOpen && (
                    <div className="p-2.5 bg-white border-t border-slate-200/80 space-y-1 font-mono text-[11px] text-slate-600 pl-6">
                      {t.cols.map(c => (
                        <div key={c} className="flex items-center space-x-1.5">
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main SQL IDE & Results Grid */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Editor Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Code className="w-4 h-4 text-indigo-600" />
                <span>{selectedPreset.title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedPreset.businessProblem}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopySql}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                title="Copy SQL code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleRunSql}
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Running...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* SQL Textarea */}
          <div className="relative">
            <textarea
              value={sqlText}
              onChange={(e) => setSqlText(e.target.value)}
              rows={9}
              className="w-full bg-slate-900 border border-slate-800 text-amber-300 text-xs font-mono rounded-xl p-4 leading-relaxed focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <strong className="text-indigo-600 font-semibold">Methodology Explanation: </strong>
            <span>{selectedPreset.explanation}</span>
          </div>
        </div>

        {/* Results Grid */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <span>Query Results Table</span>
              </h3>
              {result && (
                <span className="text-xs text-slate-500 font-mono">
                  ({result.rowCount} rows returned in {result.executionTimeMs} ms)
                </span>
              )}
            </div>

            {result && result.rows.length > 0 && (
              <button
                onClick={handleDownloadCsv}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {result?.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-mono">
              <strong>Query Execution Error:</strong> {result.error}
            </div>
          ) : !result || result.rows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No results to display. Click "Run Query" to execute.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[400px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    {result.columns.map(col => (
                      <th key={col} className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {result.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {result.columns.map(col => (
                        <td key={col} className="py-2.5 px-4 whitespace-nowrap text-slate-800">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { X, Table, Search, Database, Download } from 'lucide-react';
import { OLIST_DATABASE } from '../data/olistData';

interface DatasetViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatasetViewerModal: React.FC<DatasetViewerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTable, setActiveTable] = useState<keyof typeof OLIST_DATABASE>('olist_orders_dataset');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tableData = OLIST_DATABASE[activeTable] || [];

  // Get columns from first item
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  // Filter rows by search
  const filteredRows = tableData.filter(row => {
    if (!searchQuery.trim()) return true;
    const lowerQ = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(lowerQ)
    );
  }).slice(0, 50); // limit 50 for quick modal rendering

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Relational Dataset Inspector</h3>
              <p className="text-xs text-slate-500">Browse raw data across 8 normalized tables</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Selection Tabs */}
        <div className="flex items-center space-x-1 px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 overflow-x-auto text-xs">
          {Object.keys(OLIST_DATABASE).map(tblKey => {
            const isSelected = activeTable === tblKey;
            return (
              <button
                key={tblKey}
                onClick={() => {
                  setActiveTable(tblKey as any);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg font-mono font-medium whitespace-nowrap transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tblKey.replace('olist_', '').replace('_dataset', '')}
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeTable}...`}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <span className="text-xs font-mono text-slate-500">
            Showing top {filteredRows.length} of {tableData.length} records
          </span>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
          {filteredRows.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No matching records found.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="py-2.5 px-4 whitespace-nowrap text-slate-800">
                          {String(row[col] ?? '')}
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

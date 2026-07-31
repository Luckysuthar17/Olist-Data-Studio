import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Database, 
  Sparkles, 
  Table, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { OLIST_DATABASE } from '../data/olistData';

export type TabType = 'dashboard' | 'api' | 'sql' | 'ai' | 'docs';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenDatasetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenDatasetModal }) => {
  const totalOrders = OLIST_DATABASE.olist_orders_dataset.length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm">
              <TrendingUp className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">Olist Data Studio</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  <span>Enterprise BI v1.0</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                E-Commerce BI & REST API Analytics Workspace
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'api'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>FastAPI Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'sql'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>SQL Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'ai'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Data Analyst</span>
            </button>
          </nav>

          {/* Right Action & Dataset Pill */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenDatasetModal}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-xs"
              title="Inspect raw e-commerce relational dataset"
            >
              <Table className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">Inspect Dataset</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                {totalOrders.toLocaleString()} Records
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-50 px-2 py-2 border-t border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-1.5 rounded ${activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex flex-col items-center p-1.5 rounded ${activeTab === 'api' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          <Terminal className="w-4 h-4" />
          <span>API</span>
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex flex-col items-center p-1.5 rounded ${activeTab === 'sql' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          <Database className="w-4 h-4" />
          <span>SQL</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center p-1.5 rounded ${activeTab === 'ai' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyst</span>
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { SqlStudioView } from './components/SqlStudioView';
import { AiInsightsView } from './components/AiInsightsView';
import { DocumentationView } from './components/DocumentationView';
import { DatasetViewerModal } from './components/DatasetViewerModal';
import { Database, Terminal, Heart, Sparkles, TrendingUp, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'api' && <ApiExplorerView />}
        {activeTab === 'sql' && <SqlStudioView />}
        {activeTab === 'ai' && <AiInsightsView />}
        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Dataset Raw Inspector Modal */}
      <DatasetViewerModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="font-semibold text-slate-700">Olist Enterprise Analytics Suite</span>
            <span>•</span>
            <span className="text-slate-500">FastAPI & SQL BI Architecture</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-600">
            <button
              onClick={() => setActiveTab('api')}
              className="hover:text-indigo-600 transition-colors flex items-center space-x-1 font-medium"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Swagger API Docs</span>
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className="hover:text-indigo-600 transition-colors flex items-center space-x-1 font-medium"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL Queries</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              <span>Methodology & Docs</span>
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}

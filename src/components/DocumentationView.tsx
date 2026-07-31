import React, { useState } from 'react';
import { FileText, CheckCircle2, Copy, Check, Download, Layers } from 'lucide-react';
import { README_MD, CANDIDATE_TASK_MD, SUBMISSION_GUIDELINES_MD } from '../data/docContent';

type DocTab = 'readme' | 'task' | 'guidelines';

export const DocumentationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocTab>('readme');
  const [copied, setCopied] = useState<boolean>(false);

  const getContent = () => {
    switch (activeTab) {
      case 'readme':
        return README_MD;
      case 'task':
        return CANDIDATE_TASK_MD;
      case 'guidelines':
        return SUBMISSION_GUIDELINES_MD;
    }
  };

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'readme'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            README.md
          </button>

          <button
            onClick={() => setActiveTab('task')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'task'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            CANDIDATE_TASK.md
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'guidelines'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            SUBMISSION_GUIDELINES.md
          </button>
        </div>

        <button
          onClick={handleCopyDoc}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy Markdown</span>
        </button>
      </div>

      {/* Render Markdown Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs font-sans text-slate-800 text-xs leading-relaxed space-y-4">
        <pre className="whitespace-pre-wrap font-sans text-slate-700 text-xs leading-relaxed font-normal">
          {getContent()}
        </pre>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { getAnalystInsights } from '../utils/apiEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  findings?: string[];
  recommendations?: string[];
}

export const AiInsightsView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am your Data Analyst Assistant for the Olist E-Commerce dataset. I have ingested transactional data across orders, sellers, reviews, and delivery lead times.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      findings: [
        "Orders delivered late suffer a 58.7% drop in customer review score (from 4.6 avg to 1.9 stars).",
        "South & Southeast states (SP, RJ, MG) account for 68% of all Gross Merchandise Value.",
        "Categories with high weight-to-price ratio (like Furniture & Decor) lose margin to shipping fees."
      ],
      recommendations: [
        "Subsidize freight costs for items over R$150 to boost inter-state expansion.",
        "Establish regional fulfillment partnerships in Southern & Northeastern hubs.",
        "Set up proactive SMS warning notifications when shipping carriers experience delay."
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      let replyText = '';
      let findingsList: string[] = [];
      let recsList: string[] = [];

      try {
        const res = await fetch('/api/v1/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: query }),
        });

        if (res.ok) {
          const apiRes = await res.json();
          if (apiRes.data) {
            replyText = apiRes.data.replyText || `Analysis completed for "${query}":`;
            findingsList = apiRes.data.findings || [];
            recsList = apiRes.data.recommendations || [];
          }
        }
      } catch (e) {
        console.warn('Backend API request failed, falling back to local analysis engine:', e);
      }

      // If replyText was not set by API, execute local intelligent analytical engine
      if (!replyText) {
        const localInsights = getAnalystInsights(query);
        replyText = localInsights.replyText;
        findingsList = localInsights.findings;
        recsList = localInsights.recommendations;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        findings: findingsList.length > 0 ? findingsList : undefined,
        recommendations: recsList.length > 0 ? recsList : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallbackInsights = getAnalystInsights(query);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: fallbackInsights.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          findings: fallbackInsights.findings,
          recommendations: fallbackInsights.recommendations,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Why do delayed deliveries cause a review score drop?",
    "Which product categories have the highest freight burden?",
    "How do credit card installments impact Average Order Value?",
    "What are the top regional growth opportunities outside SP?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      
      {/* Left Column: Briefing Summary Cards */}
      <div className="lg:col-span-5 space-y-6">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Executive Analytics Briefing</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Primary Bottleneck: Delivery Delays</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                When shipping transit exceeds estimated delivery dates, customer satisfaction plummets from 4.6 to 1.9 stars. Cross-state transit to NE regions suffers the highest delay rate.
              </p>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Growth Opportunity: Freight Subsidization</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                High-weight items (furniture, tools) face freight costs exceeding 22% of item price. Subsidizing shipping fees increases cart conversion by up to 28%.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Suggested Analytical Prompts</h4>
          <div className="space-y-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-700 hover:text-slate-900 transition-all flex items-center justify-between"
              >
                <span>{p}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Interactive Chat Interface */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col h-[620px]">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Data Analyst Assistant</h3>
              <p className="text-[10px] text-slate-500">Olist Dataset Insights Engine</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 font-mono border border-emerald-200 font-semibold">
            Active
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 my-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800'
              }`}>
                <div className={`flex items-center justify-between text-[10px] mb-1 ${m.sender === 'user' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  <span className="font-bold flex items-center space-x-1">
                    {m.sender === 'user' ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3 text-indigo-600" />}
                    <span>{m.sender === 'user' ? 'You' : 'Data Analyst'}</span>
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{m.text}</p>

                {m.findings && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px]">Key Findings:</span>
                    {m.findings.map((f, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {m.recommendations && (
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <span className="font-bold text-indigo-700 block text-[11px]">Strategic Recommendations:</span>
                    {m.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-slate-700">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-indigo-600 flex items-center space-x-2 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing dataset and running queries...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about sales, freight, delays, or sellers..."
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50 flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

      </div>

    </div>
  );
};

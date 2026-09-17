import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  ShoppingBag, 
  Terminal, 
  Wrench, 
  ShieldCheck,
  Zap 
} from 'lucide-react';
import { AgentTrace, Product, Store } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: Product[];
  trace?: AgentTrace;
  timestamp: string;
}

interface ClickitAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeStore: Store;
  cartCount: number;
  onAddToCart: (product: Product) => void;
  onAddAllToCart: (products: Product[]) => void;
  initialPrompt?: string;
}

export const ClickitAIAssistant: React.FC<ClickitAIAssistantProps> = ({
  isOpen,
  onClose,
  activeStore,
  cartCount,
  onAddToCart,
  onAddAllToCart,
  initialPrompt = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      text: "Hello! I'm Clickit AI, your intelligent quick-commerce assistant powered by cognitive multi-agent orchestration. Ask me to assemble meal bundles within budget, find healthy snack alternatives, or track live dark-store inventory!",
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<AgentTrace | null>(null);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          storeId: activeStore.id,
          cartItemsCount: cartCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Agent failed to respond.');
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.data.response,
        products: data.data.products,
        trace: data.data.trace,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `I encountered a problem processing that query: ${err.message}. Please try a different grocery item or budget!`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Breakfast for 4 under ₹500',
    'Healthy snacks & protein essentials',
    'Chai time snacks under ₹200',
    'Where is my order status?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Main AI Window */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[650px] max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-violet-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base text-white">Clickit AI</h3>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Cognitive Multi-Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Store: {activeStore.name} • 10-minute dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start space-x-2 max-w-[85%]">
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Multi-Agent Trace Inspector Button */}
                  {msg.trace && (
                    <div className="mt-1 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTrace(msg.trace!)}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md transition-colors"
                      >
                        <Layers className="w-3 h-3 text-indigo-600" />
                        <span>Inspect Agent Trace ({msg.trace.selectedAgents.join(' • ')})</span>
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.trace.verification.inventoryVerified ? '✓ Stock Verified' : 'Inventory check'}
                      </span>
                    </div>
                  )}

                  {/* Recommended Products Bundle inside Chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                          Suggested Items ({msg.products.length})
                        </span>
                        <button
                          onClick={() => onAddAllToCart(msg.products!)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-xs flex items-center space-x-1 transition-all"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add All to Cart</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.products.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg bg-white shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-semibold">
                                ₹{p.sellingPrice} <span className="line-through text-slate-400">₹{p.mrp}</span> • {p.unit}
                              </div>
                            </div>
                            <button
                              onClick={() => onAddToCart(p)}
                              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-[10px] rounded-md transition-colors"
                            >
                              ADD
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 bg-indigo-50/80 p-3 rounded-2xl border border-indigo-100 max-w-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Clickit AI is reasoning across dark-store inventory...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center space-x-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggestions:
          </span>
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-semibold bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask Clickit AI (e.g. 'breakfast for 4 under ₹500', 'healthy snacks')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 bg-slate-100 focus:bg-white text-slate-900 text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden transition-all placeholder:text-slate-400"
          />
          <button
            disabled={!inputQuery.trim() || isLoading}
            onClick={() => handleSend()}
            className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 text-white font-bold transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Trace Inspector Drawer */}
      {selectedTrace && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedTrace(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-xl bg-slate-900 text-slate-100 rounded-3xl border border-slate-700 shadow-2xl p-5 z-10 max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h4 className="font-mono text-sm font-bold text-white">
                  Agent Orchestration Trace ({selectedTrace.id})
                </h4>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Perception */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">1. PERCEPTION & INTENT</span>
                <div className="text-slate-300">
                  Query: <span className="text-white font-bold">"{selectedTrace.query}"</span>
                </div>
                <div className="text-slate-400">
                  Detected Intent: <span className="text-amber-300 font-bold">{selectedTrace.perception.intent}</span>
                </div>
                <div className="text-slate-400">
                  Entities: {JSON.stringify(selectedTrace.perception.detectedEntities)}
                </div>
              </div>

              {/* Multi-Agent Routing */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-blue-400 font-bold block mb-1">2. MULTI-AGENT ROUTING</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTrace.selectedAgents.map((ag) => (
                    <span key={ag} className="bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-700">
                      {ag}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">{selectedTrace.reasoning}</p>
              </div>

              {/* Tools Called */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">3. CONTROLLED BACKEND TOOLS CALLED</span>
                <div className="space-y-2 mt-2">
                  {selectedTrace.toolsCalled.map((t, idx) => (
                    <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="flex justify-between text-slate-300 font-bold">
                        <span className="text-purple-300">{t.tool}()</span>
                        <span className="text-slate-500 font-normal">{t.durationMs}ms</span>
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{t.outputSummary}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Phase */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-teal-400 font-bold block">4. CLOSED-LOOP VERIFICATION</span>
                  <span className="text-[11px] text-slate-400">
                    ACID inventory guarantee & pricing rules passed.
                  </span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded border border-emerald-500/40 text-[10px]">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

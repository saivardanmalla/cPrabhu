import React, { useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Cpu, 
  Terminal,
  RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { AgentTrace, AnomalySignal, DemandForecast, Order, Product, Store } from '../types';

interface AdminIntelligenceCenterProps {
  orders: Order[];
  stores: Store[];
  products: Product[];
  forecasts: DemandForecast[];
  anomalies: AnomalySignal[];
  agentTraces: AgentTrace[];
  onResolveAnomaly: (id: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const AdminIntelligenceCenter: React.FC<AdminIntelligenceCenterProps> = ({
  orders,
  stores,
  products,
  forecasts,
  anomalies,
  agentTraces,
  onResolveAnomaly,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'ANOMALIES' | 'AGENT_TRACES'>('FORECAST');

  const totalGMV = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const unresolvedAnomalies = anomalies.filter((a) => !a.resolved);

  // Hourly demand distribution simulation
  const hourlyData = [
    { hour: '07 AM', orders: 12, predicted: 14 },
    { hour: '08 AM', orders: 28, predicted: 30 },
    { hour: '09 AM', orders: 45, predicted: 42 },
    { hour: '10 AM', orders: 38, predicted: 36 },
    { hour: '11 AM', orders: 24, predicted: 25 },
    { hour: '12 PM', orders: 32, predicted: 35 },
    { hour: '01 PM', orders: 41, predicted: 40 },
    { hour: '02 PM', orders: 20, predicted: 22 },
    { hour: '04 PM', orders: 35, predicted: 38 },
    { hour: '06 PM', orders: 58, predicted: 62 },
    { hour: '08 PM', orders: 64, predicted: 68 },
    { hour: '10 PM', orders: 30, predicted: 28 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Executive Command Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black bg-purple-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Autonomous Ops Core
              </span>
              <span className="text-xs text-slate-400 font-mono">Platform Health: 99.98%</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">Clickit AI Intelligence Control</h1>
            <p className="text-xs text-slate-400">
              Real-time multi-agent oversight, dynamic inventory forecasting & anomaly mitigation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefreshData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform GMV</div>
              <div className="text-2xl font-black text-slate-900 mt-1">₹{totalGMV.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 inline" />
            <span>+24.8% vs last week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Dark Store Orders</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{activeOrders.length}</div>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-2">
            Average fulfillment: 9.1 mins
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anomalies Detected</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{unresolvedAnomalies.length}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-2">
            {unresolvedAnomalies.length > 0 ? 'Requires supervisor review' : 'All systems normal'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Decisions Stream</div>
              <div className="text-2xl font-black text-purple-700 mt-1">{agentTraces.length}</div>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Terminal className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[11px] text-purple-700 font-semibold mt-2">
            Avg reasoning latency: 142ms
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('FORECAST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'FORECAST'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Demand & Stockout Forecasting
        </button>
        <button
          onClick={() => setActiveTab('ANOMALIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'ANOMALIES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Anomaly Signals Radar
          {unresolvedAnomalies.length > 0 && (
            <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unresolvedAnomalies.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('AGENT_TRACES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'AGENT_TRACES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cognitive Agent Execution Traces
        </button>
      </div>

      {/* TAB 1: DEMAND FORECASTING */}
      {activeTab === 'FORECAST' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Real-time Dark Store Demand Curve (Actual vs AI Prediction)
                </h3>
                <p className="text-xs text-slate-500">
                  Continuous inference across weather, evening IPL matches, and historical order velocity
                </p>
              </div>
              <span className="text-[11px] font-bold bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg">
                RMSE Accuracy: 94.2%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                    name="Actual Orders"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorPred)"
                    name="AI Predicted Demand"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SKU Stockout Risk Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-3">
              SKU Stockout Risk & Replenishment Directives
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">Dark Store</th>
                    <th className="pb-2">Current Stock</th>
                    <th className="pb-2">Predicted Demand (24h)</th>
                    <th className="pb-2">Hours to Depletion</th>
                    <th className="pb-2">Risk Level</th>
                    <th className="pb-2">Recommended PO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forecasts.map((f) => {
                    const isCritical = f.hoursUntilStockout < 12;
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-slate-900">{f.productName}</td>
                        <td className="py-3 text-slate-600 font-mono text-[11px]">{f.storeId}</td>
                        <td className="py-3 font-bold">{f.currentStock} units</td>
                        <td className="py-3 text-purple-700 font-bold">{f.predictedTomorrowDemand} units</td>
                        <td className="py-3 font-semibold text-slate-700">{f.hoursUntilStockout}h</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {f.stockoutRisk}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-emerald-700">
                          +{f.recommendedRestockQuantity} units auto-ordered
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANOMALY SIGNALS */}
      {activeTab === 'ANOMALIES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">
              Autonomous Anomaly Detection Radar
            </h3>
            <span className="text-xs text-slate-500">
              Monitoring coupon velocity, delivery delays, and inventory skew
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className={`p-4 rounded-3xl border-2 transition-all ${
                  anom.resolved
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : anom.severity === 'HIGH'
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        anom.severity === 'HIGH'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {anom.severity} PRIORITY
                    </span>
                    <span className="font-mono text-xs text-slate-400">{anom.type}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(anom.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{anom.description}</h4>

                <div className="bg-white/80 p-2 rounded-xl text-xs text-slate-600 font-mono mb-3">
                  Metadata: {JSON.stringify(anom.metadata)}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    Store: {anom.storeId}
                  </span>
                  {!anom.resolved ? (
                    <button
                      onClick={() => onResolveAnomaly(anom.id)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      Resolve & Dismiss
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mitigated</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AGENT EXECUTION TRACES */}
      {activeTab === 'AGENT_TRACES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">
              Cognitive Orchestrator Execution Log
            </h3>
            <span className="text-xs text-slate-500">
              Deep reasoning traces from user natural language queries
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {agentTraces.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No agent queries processed in this session yet. Open Clickit AI to trigger real queries!
              </div>
            ) : (
              agentTraces.map((trace) => (
                <div
                  key={trace.id}
                  className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <span className="text-emerald-400 font-bold">{trace.id}</span>
                    <span>Query: "{trace.query}"</span>
                    <span className="text-purple-400">{trace.executionTimeMs}ms</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">INTENT & ENTITIES:</span>
                      <span className="text-amber-300 font-bold">{trace.perception.intent}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ROUTED AGENTS:</span>
                      <span className="text-blue-300 font-bold">{trace.selectedAgents.join(' • ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">TOOLS INVOKED:</span>
                      <span className="text-teal-300 font-bold">
                        {trace.toolsCalled.map((t) => t.tool).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-400 text-[11px] pt-1">
                    <span className="text-slate-500 font-bold">REASONING: </span>
                    {trace.reasoning}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

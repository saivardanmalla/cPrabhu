import React, { useState } from 'react';
import { 
  Store as StoreIcon, 
  PackageCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Search, 
  Plus, 
  Minus, 
  RefreshCw,
  Boxes
} from 'lucide-react';
import { Order, Product, Store, OrderStatus } from '../types';

interface StoreManagerViewProps {
  stores: Store[];
  activeStore: Store;
  onSelectStore: (store: Store) => void;
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const StoreManagerView: React.FC<StoreManagerViewProps> = ({
  stores,
  activeStore,
  onSelectStore,
  orders,
  products,
  onUpdateOrderStatus,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<Record<string, number>>({});

  // Filter orders assigned to this store
  const storeOrders = orders.filter((o) => o.storeId === activeStore.id);
  const pendingOrders = storeOrders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'STORE_ACCEPTED' || o.status === 'PICKING' || o.status === 'PACKED'
  );

  // Low stock products in this store (< 20 units)
  const lowStockProducts = products.filter((p) => {
    const stock = p.storeInventory[activeStore.id] ?? 0;
    return stock > 0 && stock <= 18;
  });

  const handleStockChange = async (productId: string, newStock: number) => {
    try {
      const res = await fetch('/api/v1/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          storeId: activeStore.id,
          newStock: Math.max(0, newStock),
        }),
      });
      if (res.ok) {
        await onRefreshData();
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar with Dark Store Hub Selector */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Store Operations Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">{activeStore.code}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">{activeStore.name}</h1>
            <p className="text-xs text-slate-500">{activeStore.address}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={activeStore.id}
            onChange={(e) => {
              const found = stores.find((s) => s.id === e.target.value);
              if (found) onSelectStore(found);
            }}
            className="bg-slate-100 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.zone})
              </option>
            ))}
          </select>

          <button
            onClick={onRefreshData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Orders to Pack
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{pendingOrders.length}</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">SLA: Under 2.5 mins target</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Alert SKUs
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">{lowStockProducts.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Less than 18 units remaining</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total SKUs Active
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{products.length}</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Fulfillment Ready 24x7</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content: Orders Queue & Inventory Adjustments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Orders & Picking List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <span>Dark Store Packing Queue</span>
              <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Real-time shelf pick list</span>
          </div>

          <div className="flex-1 space-y-3 max-h-[500px] overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-slate-400">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="font-bold text-sm text-slate-700">All caught up!</p>
                <p className="text-xs">No pending orders waiting for packing in this dark store hub.</p>
              </div>
            ) : (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black font-mono text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {ord.customerName} ({ord.deliveryAddress.area})
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Pick Items List */}
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                    {ord.items.map((it) => (
                      <div key={it.productId} className="flex justify-between items-center text-slate-700">
                        <span className="font-medium truncate max-w-[240px]">
                          • {it.quantity}x {it.name} ({it.unit})
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">SKU: {it.productId}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-black text-slate-900">₹{ord.total}</span>
                    <div className="flex space-x-2">
                      {ord.status === 'CONFIRMED' && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'STORE_ACCEPTED')}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition-colors"
                        >
                          Accept & Start Picking
                        </button>
                      )}
                      {ord.status === 'STORE_ACCEPTED' && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'PACKED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors"
                        >
                          Mark Bag Packed
                        </button>
                      )}
                      {ord.status === 'PACKED' && (
                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'ASSIGNED')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-colors"
                        >
                          Handover to Rider
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Inventory Adjustments */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-900">
              Live Stock Adjustments
            </h2>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter SKUs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 border-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex-1 max-h-[500px] overflow-y-auto space-y-2">
            {filteredProducts.slice(0, 25).map((prod) => {
              const currentStock = prod.storeInventory[activeStore.id] ?? 0;
              const isLow = currentStock > 0 && currentStock <= 18;

              return (
                <div
                  key={prod.id}
                  className="p-3 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">
                        {prod.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-md ${
                        currentStock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : isLow
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentStock} in stock
                    </span>

                    {/* Quick +/- Stock Adjustment */}
                    <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <button
                        onClick={() => handleStockChange(prod.id, currentStock - 5)}
                        className="p-1 hover:bg-slate-200 text-slate-600"
                        title="Deduct 5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleStockChange(prod.id, currentStock + 10)}
                        className="p-1 hover:bg-slate-200 text-slate-600"
                        title="Add 10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

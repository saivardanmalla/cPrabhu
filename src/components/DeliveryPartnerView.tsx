import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Navigation, 
  Clock, 
  Award, 
  Wallet, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface DeliveryPartnerViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

export const DeliveryPartnerView: React.FC<DeliveryPartnerViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefreshData,
}) => {
  // Orders in delivery rider workflow
  const activeDeliveries = orders.filter(
    (o) => o.status === 'ASSIGNED' || o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY'
  );
  const completedDeliveries = orders.filter((o) => o.status === 'DELIVERED');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Rider Profile & Shift Stats */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-white font-black text-2xl shadow-inner">
            <Bike className="w-7 h-7 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Online & Active
              </span>
              <span className="text-xs text-blue-300 font-mono">ID: DEL-P-01</span>
            </div>
            <h1 className="text-xl font-black text-white">Vikas Patel (Electric Scooter KA-03-EV-7819)</h1>
            <p className="text-xs text-blue-200">Koramangala Dark Store Delivery Cluster</p>
          </div>
        </div>

        {/* Daily Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
          <div>
            <div className="text-[10px] font-bold text-blue-200 uppercase">Today's Pay</div>
            <div className="text-base font-black text-emerald-400">₹1,120</div>
          </div>
          <div className="border-x border-white/10 px-2">
            <div className="text-[10px] font-bold text-blue-200 uppercase">Completed</div>
            <div className="text-base font-black text-white">{completedDeliveries.length + 8}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-blue-200 uppercase">On-Time SLA</div>
            <div className="text-base font-black text-amber-300">98.6%</div>
          </div>
        </div>
      </div>

      {/* Active Deliveries Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <span>Assigned Deliveries in Transit</span>
            <span className="text-xs bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded-full">
              {activeDeliveries.length} Active
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Auto-navigating to shortest route</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No pending deliveries right now</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You are on standby in the Koramangala dark store hub waiting for newly packed orders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeliveries.map((ord) => {
              const isAssigned = ord.status === 'ASSIGNED';
              const isPickedUp = ord.status === 'PICKED_UP';
              const isEnRoute = ord.status === 'OUT_FOR_DELIVERY';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-slate-900">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 mt-0.5">
                          {ord.items.length} items • ₹{ord.total} ({ord.paymentMethod})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-700">⚡ 10-Min SLA</div>
                        <div className="text-[10px] text-slate-400">Target: Under 8 mins</div>
                      </div>
                    </div>

                    {/* Dark Store Pickup location */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-2 mb-2">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold">Dark Store:</span>
                        <span className="truncate">{ord.storeName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-700 border-t border-slate-200/60 pt-2">
                        <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-bold">Customer Drop:</span>
                        <span className="truncate">
                          {ord.deliveryAddress.street}, {ord.deliveryAddress.area}
                        </span>
                      </div>
                    </div>

                    {/* Customer details */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <div className="font-semibold text-slate-700">
                        {ord.customerName}
                      </div>
                      <a
                        href={`tel:${ord.customerPhone}`}
                        className="text-emerald-700 font-bold flex items-center space-x-1 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Customer</span>
                      </a>
                    </div>
                  </div>

                  {/* Rider Step Actions */}
                  <div className="pt-2 border-t border-slate-100">
                    {isAssigned && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'PICKED_UP')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Confirm Pickup from Dark Store</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    {isPickedUp && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'OUT_FOR_DELIVERY')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Start Navigation (Out for Delivery)</span>
                        <Navigation className="w-4 h-4" />
                      </button>
                    )}
                    {isEnRoute && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'DELIVERED')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <span>Complete Handover & Mark Delivered</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

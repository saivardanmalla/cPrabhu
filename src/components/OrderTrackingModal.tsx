import React, { useState } from 'react';
import { X, CheckCircle, Clock, MapPin, Bike, Phone, ShieldAlert, ChevronRight, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
}

const statusSequence: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', description: 'Payment verified and dark store notified' },
  { status: 'STORE_ACCEPTED', label: 'Store Packing Started', description: 'Store team is picking items from shelves' },
  { status: 'PACKED', label: 'Order Packed', description: 'Items verified & sealed in thermal bags' },
  { status: 'ASSIGNED', label: 'Rider Assigned', description: 'Electric delivery partner dispatched' },
  { status: 'PICKED_UP', label: 'Picked Up', description: 'Rider collected packet from dark store' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Rider is en route to your address' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Handed over at doorstep' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
  onAdvanceStatus,
  onCancelOrder,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const currentStatusIndex = statusSequence.findIndex((s) => s.status === order.status);
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  const handleAdvance = async () => {
    if (currentStatusIndex < statusSequence.length - 1) {
      setIsUpdating(true);
      const next = statusSequence[currentStatusIndex + 1].status;
      await onAdvanceStatus(order.id, next);
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this order? Reserved stock will be restored.')) {
      setIsUpdating(true);
      await onCancelOrder(order.id);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                ⚡ Real-time Dispatch
              </span>
              <span className="text-xs text-emerald-200 font-mono">#{order.orderNumber}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              {isDelivered ? 'Order Delivered!' : isCancelled ? 'Order Cancelled' : `Arriving ${order.estimatedDeliveryTime}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Simulated Live Route Map */}
          <div className="relative h-44 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 overflow-hidden border border-slate-700 p-4 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300 z-10">
              <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white">Live GPS Feed</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-300">
                Hub: {order.storeName.replace('Clickit Hub — ', '')}
              </div>
            </div>

            {/* Route graphic */}
            <div className="relative flex items-center justify-between px-8 py-4 z-10">
              {/* Dark Store Node */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-1">Dark Store</span>
              </div>

              {/* Transit Line & Moving Rider */}
              <div className="flex-1 mx-3 h-1 bg-slate-700 relative rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-700"
                  style={{
                    width: isDelivered ? '100%' : `${Math.max(10, ((currentStatusIndex + 1) / statusSequence.length) * 100)}%`
                  }}
                />
              </div>

              {/* Delivery Node */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg ${
                  isDelivered ? 'bg-emerald-600' : 'bg-slate-700'
                }`}>
                  <Bike className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 mt-1">Doorstep</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 z-10 flex items-center justify-between">
              <span>Customer: {order.deliveryAddress.street}, {order.deliveryAddress.area}</span>
              <span className="text-emerald-400 font-bold">10-min SLA Guaranteed</span>
            </div>

            {/* Background grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
          </div>

          {/* Rider Details Card */}
          {order.deliveryPartner && !isCancelled && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {order.deliveryPartner.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-extrabold text-slate-900">{order.deliveryPartner.name}</h4>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1 rounded">
                      ★ {order.deliveryPartner.rating}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{order.deliveryPartner.vehicleType}</div>
                </div>
              </div>

              <a
                href={`tel:${order.deliveryPartner.phone}`}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1 text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Call Rider</span>
              </a>
            </div>
          )}

          {/* Timeline Steps */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Order Lifecycle Milestones
            </h3>
            <div className="space-y-3">
              {statusSequence.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div key={step.status} className="flex items-start space-x-3 text-xs">
                    <div className="relative mt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      {idx < statusSequence.length - 1 && (
                        <div
                          className={`w-0.5 h-6 mx-auto mt-1 ${
                            isPassed ? 'bg-emerald-600' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                        {isCurrent && !isDelivered && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full animate-pulse">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary in Order */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Order Items ({order.items.length})</h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {order.items.map((it) => (
                <div key={it.productId} className="flex justify-between items-center text-xs text-slate-600 py-1 border-b border-slate-50">
                  <span className="truncate max-w-[280px]">
                    {it.quantity}x {it.name} ({it.unit})
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-2">
              <span>Total Paid ({order.paymentMethod})</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions for Reviewer / Simulation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {!isDelivered && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
            >
              Cancel Order
            </button>
          )}

          {!isDelivered && !isCancelled && (
            <button
              onClick={handleAdvance}
              disabled={isUpdating}
              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <span>Simulate Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {isDelivered && (
            <div className="w-full text-center text-xs font-bold text-emerald-700 bg-emerald-100/60 py-2 rounded-xl">
              ✓ Order successfully delivered to your doorstep.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

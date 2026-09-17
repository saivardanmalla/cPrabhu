import React, { useState } from 'react';
import { X, MapPin, Zap, CheckCircle2, CreditCard, Smartphone, Banknote, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Address, Order, Store } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStore: Store;
  totalAmount: number;
  itemCount: number;
  onOrderPlaced: (order: Order) => void;
  items: { productId: string; quantity: number }[];
  couponCode?: string | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  activeStore,
  totalAmount,
  itemCount,
  onOrderPlaced,
  items,
  couponCode,
}) => {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'COD'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const addresses: Address[] = [
    {
      id: 'addr-1',
      label: 'Home',
      street: 'Flat 402, Green Glen Towers',
      area: 'Koramangala 4th Block',
      city: 'Bengaluru',
      pincode: '560034',
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    {
      id: 'addr-2',
      label: 'Work',
      street: 'Floor 3, Tech Space Arena, Outer Ring Road',
      area: 'Bellandur / HSR Sector 2',
      city: 'Bengaluru',
      pincode: '560103',
      coordinates: { lat: 12.9234, lng: 77.6789 },
    },
  ];

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const selectedAddr = addresses[selectedAddressIndex];
      const payload = {
        customerName: 'Aarav Sharma',
        customerPhone: '+91 98765 43210',
        storeId: activeStore.id,
        items,
        deliveryAddress: selectedAddr,
        paymentMethod,
        couponCode: couponCode || undefined,
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to place order.');
      }

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      onOrderPlaced(data.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during order placement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 fill-slate-950" />
              <span>Express Checkout</span>
            </div>
            <h2 className="text-lg font-black leading-tight">Confirm & Place Order</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Delivery ETA Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <div className="font-extrabold text-emerald-950">
                  Arriving in {activeStore.etaMinutes} mins
                </div>
                <div className="text-[11px] text-emerald-700">
                  Fulfilled by {activeStore.name}
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-1 rounded-md">
              LIVE DARK STORE
            </span>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Delivery Address
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {addresses.map((addr, idx) => {
                const isSelected = idx === selectedAddressIndex;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{addr.label}</span>
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Abstraction */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Payment Method
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      UPI (Google Pay, PhonePe, Paytm, BHIM)
                    </div>
                    <div className="text-[10px] text-slate-500">Instant one-click mock payment authorization</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="accent-emerald-600 w-4 h-4"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Credit / Debit Card</div>
                    <div className="text-[10px] text-slate-500">Visa, Mastercard, RuPay, Amex</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CREDIT_CARD'}
                  onChange={() => setPaymentMethod('CREDIT_CARD')}
                  className="accent-emerald-600 w-4 h-4"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">Cash / QR on Delivery</div>
                    <div className="text-[10px] text-slate-500">Pay rider directly via cash or UPI scan</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-emerald-600 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold p-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Secure Guarantee */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clickit 10-Minute Guarantee: Sealed moisture-lock bags with temperature control.</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500">Total Payable</div>
            <div className="text-xl font-black text-slate-900">₹{totalAmount}</div>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handlePlaceOrder}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all active:scale-98"
          >
            {isSubmitting ? (
              <span>Reserving & Placing...</span>
            ) : (
              <>
                <span>PAY & PLACE ORDER</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

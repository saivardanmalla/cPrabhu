import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Tag, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';
import { CartItem, Coupon } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  availableCoupons: Coupon[];
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onClearCart,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  availableCoupons,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const mrpSavings = mrpTotal - subtotal;

  let couponDiscount = 0;
  if (appliedCoupon) {
    const coupon = availableCoupons.find((c) => c.code.toUpperCase() === appliedCoupon.toUpperCase());
    if (coupon && subtotal >= coupon.minOrderValue) {
      couponDiscount = coupon.discountType === 'FLAT' ? coupon.value : Math.round((subtotal * coupon.value) / 100);
    }
  }

  const isFreeDelivery = subtotal > 199 || appliedCoupon === 'FREEDEL';
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : 25;
  const handlingFee = subtotal > 0 ? 4 : 0;
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee + handlingFee);

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = availableCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!coupon) {
      setCouponError('Invalid coupon code.');
      return;
    }
    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Min order value of ₹${coupon.minOrderValue} required.`);
      return;
    }
    setCouponError('');
    onApplyCoupon(cleanCode);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
              <span>My Shopping Cart</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Delivered in 10 minutes</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                <Tag className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Explore our fresh groceries, dairy essentials, and snacks delivered in 10 minutes.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-2xs"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-xl bg-slate-50 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                    {product.brand}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                  <div className="text-[11px] text-slate-500">{product.unit}</div>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{product.sellingPrice * quantity}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{product.mrp * quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                    className="p-1.5 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-extrabold text-xs px-2 text-slate-900 min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                    className="p-1.5 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="pt-2">
              {/* Coupons Section */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 mb-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coupons & Offers</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      <div>
                        <div className="font-extrabold">'{appliedCoupon}' Applied</div>
                        <div className="text-[10px] text-emerald-700">₹{couponDiscount} discount applied</div>
                      </div>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 px-3 py-1.5 text-xs rounded-xl uppercase font-bold focus:outline-hidden focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponInput)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && <p className="text-[11px] text-rose-600 font-semibold mb-2">{couponError}</p>}

                    {/* Quick Coupon Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {availableCoupons.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleApplyCoupon(c.code)}
                          className="text-[10px] font-bold bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 px-2 py-1 rounded-lg transition-colors"
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="font-bold text-slate-800 text-xs pb-1 border-b border-slate-200">
                  Bill Summary
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Item Total (MRP)</span>
                  <span>₹{mrpTotal}</span>
                </div>
                {mrpSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Product Discount</span>
                    <span>-₹{mrpSavings}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Savings</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center space-x-1">
                    <span>Delivery Fee</span>
                    {isFreeDelivery && <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">FREE</span>}
                  </span>
                  <span>{deliveryFee === 0 ? '₹0' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Handling & Packing Fee</span>
                  <span>₹{handlingFee}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-sm text-slate-900">
                  <span>To Pay</span>
                  <span className="text-base text-emerald-700">₹{grandTotal}</span>
                </div>

                {mrpSavings + couponDiscount > 0 && (
                  <div className="bg-emerald-100/60 text-emerald-900 text-[11px] font-bold p-2 rounded-xl text-center">
                    🎉 Yay! You saved ₹{mrpSavings + couponDiscount} on this order
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-between px-5 transition-all hover:scale-101 active:scale-98"
            >
              <div>
                <div className="text-[11px] font-medium opacity-90 text-left">
                  {items.reduce((s, i) => s + i.quantity, 0)} items • ₹{grandTotal}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Deliver in 10 mins
                </div>
              </div>
              <div className="flex items-center space-x-1 font-black">
                <span>PROCEED TO PAY</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

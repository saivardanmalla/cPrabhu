import React from 'react';
import { X, Plus, Minus, Zap, ShieldCheck, Check, Info } from 'lucide-react';
import { Product, Store } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  stores: Store[];
  activeStore: Store;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  stores,
  activeStore,
}) => {
  if (!isOpen || !product) return null;

  const currentStock = product.storeInventory[activeStore.id] ?? 0;
  const isOutOfStock = currentStock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 bg-slate-50 p-6 flex items-center justify-center relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-h-72 object-contain mix-blend-multiply"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
            }}
          />
          {product.discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-lg">
              {product.discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {product.brand}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {product.category}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mb-1">
              {product.name}
            </h2>
            <div className="text-xs font-bold text-slate-500 mb-3">{product.unit}</div>

            {/* Price Box */}
            <div className="flex items-baseline space-x-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-2xl font-black text-slate-900">₹{product.sellingPrice}</span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs font-semibold text-slate-400 line-through">
                  MRP ₹{product.mrp}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-xs font-extrabold text-emerald-700">
                  Save ₹{product.mrp - product.sellingPrice}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Shelf Life & Specifications */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {product.shelfLife && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Shelf Life</span>
                  <span className="font-bold text-slate-800">{product.shelfLife}</span>
                </div>
              )}
              {product.countryOfOrigin && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Origin</span>
                  <span className="font-bold text-slate-800">{product.countryOfOrigin}</span>
                </div>
              )}
            </div>

            {/* Dark Store Availability Breakdown */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Live Dark Store Inventory
              </span>
              <div className="space-y-1.5 text-xs">
                {stores.map((s) => {
                  const stock = product.storeInventory[s.id] ?? 0;
                  const isCurrent = s.id === activeStore.id;

                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg ${
                        isCurrent ? 'bg-white font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        <span>{s.name}</span>
                        {isCurrent && <span className="text-[10px] text-emerald-600">(Your Store)</span>}
                      </span>
                      <span className={stock > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Delivered in {activeStore.etaMinutes} mins</span>
            </div>

            {isOutOfStock ? (
              <button
                disabled
                className="px-6 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : quantityInCart === 0 ? (
              <button
                onClick={() => onAddToCart(product)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                ADD TO CART
              </button>
            ) : (
              <div className="flex items-center bg-emerald-600 text-white rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="p-2 hover:bg-emerald-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-xs px-3">{quantityInCart}</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  className="p-2 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

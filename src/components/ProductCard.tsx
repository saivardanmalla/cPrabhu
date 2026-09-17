import React from 'react';
import { Plus, Minus, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
  storeEtaMinutes?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onSelectProduct,
  storeEtaMinutes = 10,
}) => {
  const isOutOfStock = !product.inStock;
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      {/* Image Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative w-full aspect-square bg-[#F7F7F7] cursor-pointer overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Discount Badge — Top Left */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 z-10">
            <div className="bg-[#538B53] text-white font-extrabold text-[10px] px-2 py-1 rounded-br-lg">
              {product.discountPercentage}% OFF
            </div>
          </div>
        )}

        {/* Veg/Non-Veg Indicator — Top Right */}
        <div className="absolute top-2 right-2 z-10 bg-white p-0.5 rounded-[3px] shadow-sm border border-gray-100">
          {product.isVegetarian !== false ? (
            <div className="w-3.5 h-3.5 border-[1.5px] border-[#0C831F] flex items-center justify-center rounded-[2px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0C831F]" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 border-[1.5px] border-red-600 flex items-center justify-center rounded-[2px]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            </div>
          )}
        </div>

        {/* Delivery Speed Badge — Bottom Left */}
        <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-sm text-[#1a1a2e] text-[10px] font-bold px-2 py-1 rounded-md flex items-center space-x-1 shadow-sm border border-gray-100">
          <Zap className="w-2.5 h-2.5 text-[#F8CB46] fill-[#F8CB46]" />
          <span>{storeEtaMinutes} MINS</span>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-gray-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate mb-0.5">
            {product.brand}
          </div>
          {/* Product Name */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-xs sm:text-[13px] font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-[#0C831F] transition-colors leading-snug mb-1"
          >
            {product.name}
          </h3>
          {/* Unit/Weight */}
          <div className="text-[11px] font-medium text-gray-400 mb-2">
            {product.unit}
          </div>
        </div>

        {/* Price Row + ADD Button */}
        <div className="flex items-end justify-between mt-auto pt-2">
          {/* Prices */}
          <div>
            <div className="text-sm sm:text-[15px] font-extrabold text-gray-900 leading-tight">
              ₹{product.sellingPrice}
            </div>
            {product.mrp > product.sellingPrice && (
              <div className="text-[11px] font-medium text-gray-400 line-through leading-tight">
                ₹{product.mrp}
              </div>
            )}
          </div>

          {/* ADD / Quantity Stepper */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-[11px] font-bold cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantityInCart === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="px-4 py-1.5 rounded-lg border-2 border-[#0C831F] bg-[#0C831F]/5 hover:bg-[#0C831F] text-[#0C831F] hover:text-white font-extrabold text-xs transition-all duration-150 active:scale-95 shadow-sm"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center bg-[#0C831F] text-white rounded-lg overflow-hidden shadow-md">
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                className="p-1.5 hover:bg-[#0a7119] active:bg-[#096015] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-xs px-2.5 select-none min-w-[22px] text-center">
                {quantityInCart}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                className="p-1.5 hover:bg-[#0a7119] active:bg-[#096015] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

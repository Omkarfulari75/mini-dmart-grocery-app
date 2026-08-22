import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Star, ShoppingCart, RefreshCw, Store, Check, AlertCircle } from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentPrice = product.discount_price || product.price;
  const originalPrice = product.price;
  const discountPercent = product.discount_price 
    ? Math.round(((originalPrice - product.discount_price) / originalPrice) * 100) 
    : 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center p-6">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full max-h-64 object-contain rounded-2xl drop-shadow-md hover:scale-105 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
                {product.category_name}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Unit: {product.unit}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
                  {product.rating || 4.5}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                ({product.review_count || 12} verified reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{currentPrice}
              </span>
              {product.discount_price && (
                <span className="text-lg text-slate-400 line-through font-medium">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Product Metadata Badges */}
            <div className="space-y-2 mb-6 text-xs font-medium">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <RefreshCw className="w-4 h-4 text-emerald-500" />
                <span>Return Policy: <strong>{product.return_window_days || 7} Days Returnable</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Store className="w-4 h-4 text-amber-500" />
                <span>Store Pickup: <strong>{product.is_pickup_eligible ? 'Eligible' : 'Home Delivery Only'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                {product.stock_quantity > 0 ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>In Stock: <strong className="text-emerald-600 dark:text-emerald-400">{product.stock_quantity} units available</strong></span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-rose-500 font-bold">Currently Out of Stock</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div>
            {product.stock_quantity > 0 ? (
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart (₹{currentPrice * quantity})
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-sm cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

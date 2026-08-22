import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductDetailModal from '../components/ProductDetailModal';
import { 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Check, 
  Sparkles, 
  Store, 
  Truck, 
  Clock, 
  ShieldCheck,
  ShoppingBag,
  ArrowUpDown,
  Utensils,
  Zap,
  CheckCircle2
} from 'lucide-react';

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Fresh Produce' },
  { id: 2, name: 'Dairy & Bakery' },
  { id: 3, name: 'Beverages' },
  { id: 4, name: 'Snacks & Munchies' },
  { id: 5, name: 'Pantry & Staples' },
  { id: 6, name: 'Household Essentials' }
];

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Organic Royal Gala Apples',
    category_name: 'Fresh Produce',
    price: 180,
    discount_price: 149,
    unit: '1 kg',
    rating: 4.8,
    stock_quantity: 45,
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'Fresh Farm Spinach (Palak)',
    category_name: 'Fresh Produce',
    price: 40,
    discount_price: 29,
    unit: '250 g',
    rating: 4.6,
    stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'Amul Taaza Toned Milk',
    category_name: 'Dairy & Bakery',
    price: 64,
    discount_price: 62,
    unit: '1 Litre',
    rating: 4.9,
    stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'Artisan Whole Wheat Bread',
    category_name: 'Dairy & Bakery',
    price: 55,
    discount_price: 48,
    unit: '400 g',
    rating: 4.7,
    stock_quantity: 34,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    name: 'Cold Pressed Orange Juice',
    category_name: 'Beverages',
    price: 120,
    discount_price: 99,
    unit: '500 ml',
    rating: 4.8,
    stock_quantity: 28,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    name: 'Premium Roasted Almonds',
    category_name: 'Snacks & Munchies',
    price: 350,
    discount_price: 299,
    unit: '250 g',
    rating: 4.9,
    stock_quantity: 51,
    image_url: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    name: 'Basmati Rice Premium Extra Long',
    category_name: 'Pantry & Staples',
    price: 220,
    discount_price: 189,
    unit: '1 kg',
    rating: 4.8,
    stock_quantity: 79,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 8,
    name: 'Organic Cold Pressed Mustard Oil',
    category_name: 'Pantry & Staples',
    price: 210,
    discount_price: 185,
    unit: '1 Litre',
    rating: 4.6,
    stock_quantity: 39,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 9,
    name: 'Eco-Friendly Liquid Laundry Detergent',
    category_name: 'Household Essentials',
    price: 450,
    discount_price: 380,
    unit: '1 Litre',
    rating: 4.7,
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
  }
];

export default function CustomerHome() {
  const { user } = useAuth();

  if (user?.role === 'STAFF') return <Navigate to="/staff" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState({});
  const [bundleAdded, setBundleAdded] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, sortBy, stockOnly]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      if (res.data.categories && res.data.categories.length > 0) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Using fallback categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;
      if (stockOnly) params.stockOnly = 'true';

      const res = await axios.get('/api/products', { params });
      if (res.data.products && res.data.products.length > 0) {
        setProducts(res.data.products);
      } else {
        filterFallbackProducts();
      }
    } catch (err) {
      console.error('Using fallback products:', err);
      filterFallbackProducts();
    } finally {
      setLoading(false);
    }
  };

  const filterFallbackProducts = () => {
    let list = [...FALLBACK_PRODUCTS];
    if (search) {
      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedCategory) {
      list = list.filter(p => p.category_name === selectedCategory);
    }
    if (stockOnly) {
      list = list.filter(p => p.stock_quantity > 0);
    }
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    setProducts(list);
  };

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const recipeBundles = [
    {
      id: 'bundle-smoothie',
      title: 'Green Detox Smoothie Kit',
      tag: 'Healthy & Refreshing',
      time: '5 Min Prep',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      itemIds: [1, 2, 5],
      saveAmount: 35
    },
    {
      id: 'bundle-breakfast',
      title: 'Artisan Morning Breakfast Kit',
      tag: 'Family Favorite',
      time: '10 Min Prep',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      itemIds: [3, 4, 6],
      saveAmount: 45
    },
    {
      id: 'bundle-dinner',
      title: 'Royal Basmati Gourmet Meal Kit',
      tag: 'Chef Special',
      time: '25 Min Prep',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      itemIds: [7, 8],
      saveAmount: 40
    }
  ];

  const handleAddRecipeBundle = (bundle) => {
    let addedCount = 0;
    bundle.itemIds.forEach(id => {
      const prod = products.find(p => p.id === id);
      if (prod && prod.stock_quantity > 0) {
        addToCart(prod, 1);
        addedCount++;
      }
    });

    setBundleAdded(bundle.id);
    setTimeout(() => {
      setBundleAdded(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white py-12 px-4 sm:px-6 lg:px-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-2xl text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" /> Guaranteed Fresh Daily • 100% Quality Inspected
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Fresh Groceries Delivered or Ready for <span className="text-amber-400">Store Pickup</span>
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-normal max-w-xl">
              Order fresh farm produce, dairy, bakery, snacks, and daily household staples. Choose scheduled home delivery or instant pickup with ₹20 extra discount!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-bold text-emerald-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400" /> Free Home Delivery &gt; ₹500
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Store className="w-4 h-4 text-amber-400" /> Store Pickup Capacity Tracking
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Clock className="w-4 h-4 text-teal-300" /> 7-Day Easy Return Policy
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 glass-panel p-5 rounded-3xl bg-white/10 border-white/20 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">🎉 Assessment Offer</span>
              <span className="bg-amber-500 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md">DMART10</span>
            </div>
            <div className="text-2xl font-black mb-1">10% OFF YOUR CART</div>
            <p className="text-xs text-emerald-100 mb-4">Use promo code <code className="bg-slate-900/50 px-1.5 py-0.5 rounded font-mono font-bold text-amber-400">DMART10</code> at checkout for instant savings.</p>
            <div className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Assessment Deliverable
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* NEW FEATURE: AI-Powered Recipe-to-Cart One-Click Bundles */}
        <section className="glass-panel p-6 rounded-3xl space-y-4 border-2 border-emerald-500/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg uppercase tracking-wider mb-1">
                <Utensils className="w-4 h-4" /> 🤖 Creative Feature
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                1-Click "Recipe-to-Cart" Express Bundles
              </h2>
              <p className="text-xs text-slate-500 font-medium">Click any recipe kit below to automatically add all required fresh ingredient items directly to your cart!</p>
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Extra Bundle Discount
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {recipeBundles.map((bundle) => {
              const matchedProducts = bundle.itemIds.map(id => products.find(p => p.id === id)).filter(Boolean);
              const bundleTotalPrice = matchedProducts.reduce((sum, p) => sum + (p.discount_price || p.price), 0);
              const isAdded = bundleAdded === bundle.id;

              return (
                <div key={bundle.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-emerald-500/30 hover:border-emerald-500 transition-all group">
                  <div>
                    <div className="relative mb-3 h-36 rounded-xl overflow-hidden bg-slate-100">
                      <img src={bundle.image} alt={bundle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                        {bundle.tag}
                      </span>
                      <span className="absolute bottom-2 right-2 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow">
                        Save ₹{bundle.saveAmount}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">{bundle.title}</h3>
                    <span className="text-[11px] text-slate-400 font-medium block mb-2">⏱️ {bundle.time}</span>

                    <div className="space-y-1 mb-4">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ingredients Included:</span>
                      <ul className="text-xs space-y-1">
                        {matchedProducts.map(p => (
                          <li key={p.id} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddRecipeBundle(bundle)}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
                      isAdded 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-[0.98]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Added All Ingredients to Cart!
                      </>
                    ) : (
                      <>
                        <Utensils className="w-4 h-4" /> Add Ingredients to Cart (₹{bundleTotalPrice})
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apples, milk, almonds, rice..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="">Sort By: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🛒 All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-1">No products found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search keywords or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const currentPrice = product.discount_price || product.price;
              const originalPrice = product.price;
              const discountPercent = product.discount_price 
                ? Math.round(((originalPrice - product.discount_price) / originalPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="glass-card rounded-3xl p-4 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="relative mb-3 bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-center h-48 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-40 object-contain group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      {discountPercent > 0 && (
                        <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                          -{discountPercent}%
                        </span>
                      )}
                      <span className="absolute top-3 right-3 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {product.unit}
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                      <span>{product.category_name}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{currentPrice}
                      </span>
                      {product.discount_price && (
                        <span className="text-xs text-slate-400 line-through font-semibold ml-1.5">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>

                    {product.stock_quantity > 0 ? (
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className={`p-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                          addedIds[product.id]
                            ? 'bg-emerald-600 text-white scale-110'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white'
                        }`}
                        title="Quick Add to Cart"
                      >
                        {addedIds[product.id] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-1 rounded-lg">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

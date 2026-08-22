import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layers, 
  Store, 
  Truck, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  Edit,
  Save,
  Search,
  RotateCw
} from 'lucide-react';

const FALLBACK_METRICS = {
  totalOrders: 18,
  pendingPickups: 2,
  pendingDeliveries: 3,
  pendingReturns: 1,
  lowStockCount: 2
};

const FALLBACK_ORDERS = [
  {
    id: 1,
    order_number: 'ORD-98214',
    user_name: 'Rahul Customer',
    user_email: 'customer@dmart.com',
    status: 'Ready for Pickup',
    fulfillment_type: 'STORE_PICKUP',
    pickup_branch: 'Mini D-Mart Express (Andheri East Branch)',
    scheduled_date: '2026-08-25',
    scheduled_slot: '10:00 AM - 12:00 PM',
    items: [
      { name: 'Organic Royal Gala Apples', quantity: 2, price: 149 },
      { name: 'Amul Taaza Toned Milk', quantity: 3, price: 62 }
    ]
  },
  {
    id: 2,
    order_number: 'ORD-25221',
    user_name: 'Omkar Fulari',
    user_email: 'omkar@gmail.com',
    status: 'Preparing',
    fulfillment_type: 'HOME_DELIVERY',
    delivery_address: 'Flat 402, Sunshine Heights, MG Road, Mumbai',
    scheduled_date: '2026-08-25',
    scheduled_slot: '02:00 PM - 04:00 PM',
    items: [
      { name: 'Artisan Whole Wheat Bread', quantity: 1, price: 48 },
      { name: 'Premium Roasted Almonds', quantity: 1, price: 299 }
    ]
  }
];

const FALLBACK_RETURNS = [
  {
    id: 1,
    return_number: 'RET-7821',
    order_number: 'ORD-98215',
    user_name: 'Rahul Customer',
    item_name: 'Premium Roasted Almonds',
    quantity: 1,
    reason: 'Packaging Damaged / Broken Seal',
    type: 'Refund',
    status: 'Pending',
    photo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    notes: 'Seal was damaged on delivery.',
    updated_at: new Date().toISOString()
  }
];

const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Organic Royal Gala Apples', category_name: 'Fresh Produce', price: 149, stock_quantity: 45 },
  { id: 2, name: 'Fresh Farm Spinach (Palak)', category_name: 'Fresh Produce', price: 29, stock_quantity: 8 },
  { id: 3, name: 'Amul Taaza Toned Milk', category_name: 'Dairy & Bakery', price: 62, stock_quantity: 80 },
  { id: 4, name: 'Artisan Whole Wheat Bread', category_name: 'Dairy & Bakery', price: 48, stock_quantity: 5 }
];

export default function StaffDashboard() {
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [orders, setOrders] = useState(FALLBACK_ORDERS);
  const [returns, setReturns] = useState(FALLBACK_RETURNS);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [returnStatusFilter, setReturnStatusFilter] = useState('');

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [managerNote, setManagerNote] = useState('');
  const [restockItem, setRestockItem] = useState(true);

  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [orderStatusFilter, fulfillmentFilter, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [mRes, oRes, rRes, pRes] = await Promise.all([
        axios.get('/api/admin/metrics', { timeout: 3000 }),
        axios.get('/api/orders', { params: { status: orderStatusFilter, fulfillment_type: fulfillmentFilter }, timeout: 3000 }),
        axios.get('/api/returns', { timeout: 3000 }),
        axios.get('/api/products', { timeout: 3000 })
      ]);

      if (mRes.data.metrics) setMetrics(mRes.data.metrics);
      if (oRes.data.orders && oRes.data.orders.length > 0) setOrders(oRes.data.orders);
      if (rRes.data.returns && rRes.data.returns.length > 0) setReturns(rRes.data.returns);
      if (pRes.data.products && pRes.data.products.length > 0) setProducts(pRes.data.products);
    } catch (err) {
      console.warn('Staff API using local fallback queue:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, { timeout: 3000 });
    } catch (err) {}
  };

  const handleProcessReturn = async (returnId, status) => {
    setReturns(returns.map(r => r.id === returnId ? { ...r, status, manager_notes: managerNote } : r));
    setSelectedReturn(null);
    setManagerNote('');
    try {
      await axios.put(`/api/returns/${returnId}/process`, {
        status,
        manager_notes: managerNote,
        restock: restockItem
      }, { timeout: 3000 });
    } catch (err) {}
  };

  const handleSaveStock = async (productId) => {
    setProducts(products.map(p => p.id === productId ? { ...p, stock_quantity: Number(newStockVal) } : p));
    setEditingStockId(null);
    try {
      await axios.put(`/api/products/${productId}`, { stock_quantity: Number(newStockVal) }, { timeout: 3000 });
    } catch (err) {}
  };

  const filteredReturns = returnStatusFilter 
    ? returns.filter(r => r.status === returnStatusFilter)
    : returns;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Store Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Staff & Manager Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage order fulfillment, pickup queues, return approvals, and inventory stock levels.</p>
        </div>

        {/* Tab Switcher & Manual Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 shadow-sm transition-all"
            title="Refresh Data"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Orders Queue ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'returns'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Return Requests ({returns.filter(r => r.status === 'Pending').length} Pending)
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Inventory Stock ({products.filter(p => p.stock_quantity <= 10).length} Low Stock)
            </button>
          </div>
        </div>
      </div>

      {/* Operations Metric Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-4 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>TOTAL ORDERS</span>
              <Layers className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{orders.length}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-l-4 border-amber-500">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>PENDING PICKUPS</span>
              <Store className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{orders.filter(o => o.fulfillment_type === 'STORE_PICKUP').length}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-l-4 border-teal-500">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>PENDING DELIVERIES</span>
              <Truck className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{orders.filter(o => o.fulfillment_type === 'HOME_DELIVERY').length}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-l-4 border-rose-500">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>PENDING RETURNS</span>
              <RefreshCw className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{returns.filter(r => r.status === 'Pending').length}</div>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-xs font-semibold text-slate-500">Loading operational queue...</span>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="space-y-6">
          <div className="glass-panel p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 dark:text-slate-300">Filter Queue:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={fulfillmentFilter}
                onChange={(e) => setFulfillmentFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="">All Fulfillment</option>
                <option value="STORE_PICKUP">Store Pickups Only</option>
                <option value="HOME_DELIVERY">Home Deliveries Only</option>
              </select>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-3xl">
              <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-500">No orders match the selected queue filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="glass-card rounded-3xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{order.order_number}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        order.fulfillment_type === 'STORE_PICKUP'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                      }`}>
                        {order.fulfillment_type === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'}
                      </span>

                      <span className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Customer: <strong>{order.user_name}</strong> ({order.user_email}) • Scheduled: <strong>{order.scheduled_date} ({order.scheduled_slot})</strong>
                    </div>

                    {order.fulfillment_type === 'STORE_PICKUP' ? (
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        Pickup Location: {order.pickup_branch}
                      </div>
                    ) : (
                      <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        Delivery Address: {order.delivery_address}
                      </div>
                    )}

                    <div className="text-xs font-semibold text-slate-500">
                      Items ({order.items?.length || 0}): {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200 dark:border-slate-800">
                    {order.status === 'Placed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all"
                      >
                        Start Preparing ➔
                      </button>
                    )}

                    {order.status === 'Preparing' && order.fulfillment_type === 'STORE_PICKUP' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Ready for Pickup')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        Mark Ready for Pickup ➔
                      </button>
                    )}

                    {order.status === 'Preparing' && order.fulfillment_type === 'HOME_DELIVERY' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        Send Out for Delivery ➔
                      </button>
                    )}

                    {['Ready for Pickup', 'Out for Delivery'].includes(order.status) && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'Completed')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all"
                      >
                        Complete Order ✓
                      </button>
                    )}

                    {order.status === 'Completed' && (
                      <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'returns' ? (
        <div className="space-y-4">
          <div className="glass-panel p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Filter Returns:</span>
              <select
                value={returnStatusFilter}
                onChange={(e) => setReturnStatusFilter(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
              >
                <option value="">All Statuses ({returns.length})</option>
                <option value="Pending">Pending Only ({returns.filter(r => r.status === 'Pending').length})</option>
                <option value="Approved">Approved Only ({returns.filter(r => r.status === 'Approved').length})</option>
                <option value="Rejected">Rejected Only ({returns.filter(r => r.status === 'Rejected').length})</option>
              </select>
            </div>
          </div>

          {filteredReturns.length === 0 ? (
            <div className="py-16 text-center glass-panel rounded-3xl">
              <RefreshCw className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-500">No return or exchange requests found.</p>
            </div>
          ) : (
            filteredReturns.map((ret) => (
              <div key={ret.id} className="glass-card rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {ret.photo_url && (
                    <img src={ret.photo_url} alt="Proof" className="w-16 h-16 object-cover rounded-2xl bg-slate-100 p-1 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-black text-slate-900 dark:text-white">{ret.return_number}</span>
                      <span className="text-xs font-bold text-slate-500">(Order #{ret.order_number})</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        ret.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : ret.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {ret.status}
                      </span>
                    </div>

                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      Customer: {ret.user_name} • Item: {ret.quantity} x {ret.item_name} ({ret.type})
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Reason: <strong>{ret.reason}</strong></p>
                    {ret.notes && <p className="text-xs text-slate-400 italic">"{ret.notes}"</p>}
                    {ret.manager_notes && (
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                        Manager Remark: {ret.manager_notes}
                      </p>
                    )}
                  </div>
                </div>

                {ret.status === 'Pending' ? (
                  <button
                    onClick={() => setSelectedReturn(ret)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shrink-0"
                  >
                    Process Return Request ➔
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 font-semibold shrink-0">
                    Processed: {new Date(ret.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Inventory Stock Control</h3>
            <span className="text-xs text-slate-500 font-semibold">Update stock quantities in real time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock Quantity</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="p-3">{p.category_name}</td>
                    <td className="p-3 font-bold">₹{p.discount_price || p.price}</td>
                    <td className="p-3">
                      {editingStockId === p.id ? (
                        <input
                          type="number"
                          value={newStockVal}
                          onChange={(e) => setNewStockVal(e.target.value)}
                          className="w-20 p-1.5 rounded-lg border border-emerald-500 bg-white dark:bg-slate-900 font-bold"
                        />
                      ) : (
                        <span className={`font-black ${p.stock_quantity <= 10 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {p.stock_quantity} units
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingStockId === p.id ? (
                        <button
                          onClick={() => handleSaveStock(p.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setEditingStockId(p.id); setNewStockVal(p.stock_quantity); }}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Approval Drawer Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Process Return #{selectedReturn.return_number}</h3>
            <p className="text-xs text-slate-500 mb-4">Customer requested <strong>{selectedReturn.type}</strong> for {selectedReturn.quantity} x {selectedReturn.item_name}.</p>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Store Manager Remarks:</label>
                <textarea
                  rows={2}
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                  placeholder="Reason for approval or rejection..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restockItem}
                  onChange={(e) => setRestockItem(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Restock returned item into inventory</span>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleProcessReturn(selectedReturn.id, 'Approved')}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold"
                >
                  Approve Return ✓
                </button>
                <button
                  onClick={() => handleProcessReturn(selectedReturn.id, 'Rejected')}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold"
                >
                  Reject Request ✕
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedReturn(null)}
              className="mt-4 w-full py-2 text-xs text-slate-500 font-bold hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

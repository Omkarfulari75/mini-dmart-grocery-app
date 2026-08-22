import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReturnModal from '../components/ReturnModal';
import { 
  ClipboardList, 
  Truck, 
  Store, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertCircle,
  Package,
  ArrowRight
} from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'returns'

  const [returnModalOrder, setReturnModalOrder] = useState(null);

  useEffect(() => {
    fetchOrdersAndReturns();
  }, []);

  const fetchOrdersAndReturns = async () => {
    setLoading(true);
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        axios.get('/api/orders/my'),
        axios.get('/api/returns/my')
      ]);
      setOrders(ordersRes.data.orders || []);
      setReturns(returnsRes.data.returns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, orderNum) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderNum}? Stock will be automatically restored.`)) return;

    try {
      const res = await axios.post(`/api/orders/${orderId}/cancel`);
      alert(res.data.message);
      fetchOrdersAndReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const getStatusSteps = (status, type) => {
    const isPickup = type === 'STORE_PICKUP';
    const steps = isPickup 
      ? ['Placed', 'Preparing', 'Ready for Pickup', 'Completed']
      : ['Placed', 'Preparing', 'Out for Delivery', 'Completed'];

    if (status === 'Cancelled') {
      return (
        <div className="flex items-center gap-2 text-rose-500 font-extrabold text-xs bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl">
          <XCircle className="w-4 h-4" /> Order Cancelled (Inventory Stock Restored)
        </div>
      );
    }

    const currentIndex = steps.indexOf(status);

    return (
      <div className="w-full py-3">
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                  isCurrent 
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 scale-110' 
                    : isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={isCompleted ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400'}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            My Orders & Return Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Track real-time order lifecycle, manage cancellations, and request return refunds.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Order Tracking ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'returns'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Return Requests ({returns.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-xs font-semibold text-slate-500">Loading order details...</span>
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders List */
        orders.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl max-w-md mx-auto">
            <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Browse our store catalog and place your first grocery order!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="glass-card rounded-3xl p-6 space-y-4">
                {/* Top Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{order.order_number}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        order.fulfillment_type === 'STORE_PICKUP'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {order.fulfillment_type === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Placed on: {new Date(order.created_at).toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{order.total_amount}</span>
                    <span className="text-[11px] text-slate-500 block font-medium">({order.items.length} items)</span>
                  </div>
                </div>

                {/* Fulfillment Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl font-medium">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Scheduled Date: <strong>{order.scheduled_date}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>Slot: <strong>{order.scheduled_slot}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    {order.fulfillment_type === 'STORE_PICKUP' ? (
                      <>
                        <Store className="w-4 h-4 text-amber-500" />
                        <span className="truncate">Branch: <strong>{order.pickup_branch}</strong></span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="truncate">Address: <strong>{order.delivery_address}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar Timeline */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Order Lifecycle Status</div>
                  {getStatusSteps(order.status, order.fulfillment_type)}
                </div>

                {/* Purchased Items Thumbnail Row */}
                <div className="flex items-center gap-3 overflow-x-auto py-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-8 h-8 object-cover rounded-lg bg-white p-0.5" />
                      <div className="text-xs font-semibold">
                        <div className="text-slate-900 dark:text-white truncate max-w-[120px]">{item.name}</div>
                        <span className="text-[10px] text-slate-500">{item.quantity} x ₹{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {['Placed', 'Preparing'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.id, order.order_number)}
                      className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs hover:bg-rose-100 transition-colors"
                    >
                      Cancel Order & Restore Stock
                    </button>
                  )}

                  {order.status === 'Completed' && (
                    <button
                      onClick={() => setReturnModalOrder(order)}
                      className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-xs hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Request Return / Exchange
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Returns List */
        returns.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl max-w-md mx-auto">
            <RefreshCw className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Return Requests</h3>
            <p className="text-xs text-slate-500 mt-1">If you receive damaged or expired items, you can request returns here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => (
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
                        ret.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : ret.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {ret.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {ret.type}: {ret.quantity} x {ret.item_name}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Reason: <strong>{ret.reason}</strong></p>
                    {ret.notes && <p className="text-[11px] text-slate-400 italic mt-1">"{ret.notes}"</p>}
                    
                    {ret.manager_notes && (
                      <div className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-700 dark:text-slate-300 font-semibold">
                        Store Manager Remark: {ret.manager_notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium shrink-0">
                  Requested: {new Date(ret.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Return Modal */}
      {returnModalOrder && (
        <ReturnModal
          order={returnModalOrder}
          onClose={() => setReturnModalOrder(null)}
          onSuccess={fetchOrdersAndReturns}
        />
      )}
    </div>
  );
}

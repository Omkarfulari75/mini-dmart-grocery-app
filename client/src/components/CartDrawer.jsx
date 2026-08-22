import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Store, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

export default function CartDrawer({ isOpen, onClose }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    tax, 
    deliveryFee, 
    pickupDiscount, 
    promoDiscount,
    grandTotal, 
    fulfillmentType, 
    setFulfillmentType,
    pickupBranch, 
    setPickupBranch,
    scheduledDate, 
    setScheduledDate,
    scheduledSlot, 
    setScheduledSlot,
    deliveryAddress, 
    setDeliveryAddress,
    applyPromo,
    isPromoApplied
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!isOpen) return null;

  const handlePromoSubmit = (e) => {
    e.preventDefault();
    const res = applyPromo(promoInput);
    setPromoMsg(res);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Please sign in or select a demo role to complete checkout.');
      navigate('/login');
      onClose();
      return;
    }

    if (cartItems.length === 0) return;

    if (fulfillmentType === 'HOME_DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      alert('Please enter a valid home delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
        fulfillment_type: fulfillmentType,
        pickup_branch: fulfillmentType === 'STORE_PICKUP' ? pickupBranch : null,
        scheduled_date: scheduledDate,
        scheduled_slot: scheduledSlot,
        delivery_address: fulfillmentType === 'HOME_DELIVERY' ? deliveryAddress : null,
        promo_code: isPromoApplied ? 'DMART10' : null
      };

      const res = await axios.post('/api/orders', payload);
      setOrderSuccess(res.data.order);
      clearCart();
      setTimeout(() => {
        setOrderSuccess(null);
        onClose();
        navigate('/orders');
      }, 2500);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">Shopping Cart</span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Overlay */}
          {orderSuccess ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-emerald-50 dark:bg-emerald-950/40">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 animate-bounce shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Order Confirmed!</h3>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                Order #{orderSuccess.order_number}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Your order is scheduled for {orderSuccess.fulfillment_type === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'} on {orderSuccess.scheduled_date} ({orderSuccess.scheduled_slot}).
              </p>
              <span className="text-xs font-semibold text-slate-400">Redirecting to order tracking...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Store className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Your Cart is Empty</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Explore our fresh grocery catalog and add items to get started!</p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                        <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-white p-1" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.unit} • ₹{item.price} each</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 px-1">
                              <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-emerald-500">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-emerald-500">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white block">₹{item.price * item.quantity}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700 p-1 text-xs transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fulfillment Type Toggle */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Choose Delivery Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFulfillmentType('HOME_DELIVERY')}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          fulfillmentType === 'HOME_DELIVERY'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <Truck className={`w-5 h-5 mt-0.5 ${fulfillmentType === 'HOME_DELIVERY' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Home Delivery</div>
                          <span className="text-[10px] text-slate-500">Scheduled to door</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setFulfillmentType('STORE_PICKUP')}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          fulfillmentType === 'STORE_PICKUP'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <Store className={`w-5 h-5 mt-0.5 ${fulfillmentType === 'STORE_PICKUP' ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Store Pickup</div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">₹20 Discount!</span>
                        </div>
                      </button>
                    </div>

                    {/* Store Pickup Branch selector */}
                    {fulfillmentType === 'STORE_PICKUP' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-emerald-500" /> Select Store Branch:
                        </label>
                        <select
                          value={pickupBranch}
                          onChange={(e) => setPickupBranch(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                        >
                          <option value="Mini D-Mart Express (Andheri East Branch)">Mini D-Mart Express (Andheri East Branch)</option>
                          <option value="Mini D-Mart Superstore (Bandra West Branch)">Mini D-Mart Superstore (Bandra West Branch)</option>
                          <option value="Mini D-Mart Hub (Powai Central Branch)">Mini D-Mart Hub (Powai Central Branch)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Delivery Address:
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium resize-none"
                          placeholder="Enter your flat/street address..."
                        />
                      </div>
                    )}

                    {/* Schedule Date & Slot Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" /> Date:
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" /> Time Slot:
                        </label>
                        <select
                          value={scheduledSlot}
                          onChange={(e) => setScheduledSlot(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                        >
                          <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                          <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                          <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                          <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Box */}
                  <form onSubmit={handlePromoSubmit} className="pt-2">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                      <Tag className="w-3 h-3 text-amber-500" /> Apply Coupon (Try: DMART10)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Promo code"
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase font-semibold"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMsg && (
                      <p className={`text-[11px] font-semibold mt-1 ${promoMsg.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {promoMsg.message}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          )}

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && !orderSuccess && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST Tax (5%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{tax}</span>
                </div>
                {fulfillmentType === 'HOME_DELIVERY' && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}
                    </span>
                  </div>
                )}
                {fulfillmentType === 'STORE_PICKUP' && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Store Pickup Discount</span>
                    <span>-₹{pickupDiscount}</span>
                  </div>
                )}
                {isPromoApplied && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Promo DMART10 (10%)</span>
                    <span>-₹{promoDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{grandTotal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

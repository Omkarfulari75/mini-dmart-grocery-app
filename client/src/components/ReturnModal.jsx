import React, { useState } from 'react';
import axios from 'axios';
import { X, RefreshCw, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReturnModal({ order, onClose, onSuccess }) {
  const [selectedItem, setSelectedItem] = useState(order?.items[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Packaging Damaged / Broken Seal');
  const [type, setType] = useState('Refund');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        order_id: order.id,
        item_name: selectedItem,
        quantity: Number(quantity),
        reason,
        type,
        photo_url: photoUrl,
        notes
      };

      const res = await axios.post('/api/returns', payload);
      alert(res.data.message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Request Return / Exchange</h3>
              <span className="text-xs text-slate-500 font-semibold">Order #{order.order_number}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Select Item */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Select Item to Return:</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              {order.items.map((item, idx) => (
                <option key={idx} value={item.name}>
                  {item.name} ({item.quantity} purchased - ₹{item.price} each)
                </option>
              ))}
            </select>
          </div>

          {/* Return Type & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Return Preference:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="Refund">Full Money Refund</option>
                <option value="Exchange">Replacement / Exchange</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Quantity:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Reason for Return:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
            >
              <option value="Packaging Damaged / Broken Seal">Packaging Damaged / Broken Seal</option>
              <option value="Expired or Near Expiry Product">Expired or Near Expiry Product</option>
              <option value="Wrong Item Received">Wrong Item Received</option>
              <option value="Quality / Taste Defect">Quality / Taste Defect</option>
              <option value="Item No Longer Needed">Item No Longer Needed</option>
            </select>
          </div>

          {/* Photo Proof URL */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-emerald-500" /> Photo Proof URL (Optional demo link):
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="https://..."
            />
          </div>

          {/* Customer Explanation Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Additional Customer Remarks:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          {/* Submit button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting Request...' : `Submit ${type} Request`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

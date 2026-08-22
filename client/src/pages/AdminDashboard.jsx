import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, 
  Users, 
  Package, 
  DollarSign, 
  Activity, 
  Search, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit, 
  FileText,
  Lock
} from 'lucide-react';

const FALLBACK_METRICS = {
  totalRevenue: 14580,
  totalOrders: 18,
  totalUsers: 6,
  totalProducts: 9,
  pendingPickups: 2,
  pendingDeliveries: 3,
  pendingReturns: 1,
  lowStockCount: 2
};

const FALLBACK_USERS = [
  { id: 1, name: 'Rahul Customer', email: 'customer@dmart.com', role: 'CUSTOMER', phone: '+91 9876543210' },
  { id: 2, name: 'Priya Store Staff', email: 'staff@dmart.com', role: 'STAFF', phone: '+91 9876543211' },
  { id: 3, name: 'Vikram Admin', email: 'admin@dmart.com', role: 'ADMIN', phone: '+91 9876543212' },
  { id: 4, name: 'Omkar Fulari', email: 'omkar@gmail.com', role: 'CUSTOMER', phone: '+91 7507150511' }
];

const FALLBACK_AUDIT_LOGS = [
  { id: 1, created_at: new Date().toISOString(), user_name: 'Vikram Admin', user_role: 'ADMIN', action: 'USER_LOGIN_SUCCESS', details: 'User admin@dmart.com logged in with role [ADMIN]', ip_address: '127.0.0.1' },
  { id: 2, created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Priya Store Staff', user_role: 'STAFF', action: 'ORDER_STATUS_UPDATED', details: 'Order #ORD-99133 status changed to Ready for Pickup', ip_address: '127.0.0.1' },
  { id: 3, created_at: new Date(Date.now() - 7200000).toISOString(), user_name: 'Rahul Customer', user_role: 'CUSTOMER', action: 'RETURN_REQUESTED', details: 'Return request RET-7821 created for order #ORD-98215 (Refund)', ip_address: '127.0.0.1' },
  { id: 4, created_at: new Date(Date.now() - 10800000).toISOString(), user_name: 'Omkar Fulari', user_role: 'CUSTOMER', action: 'USER_REGISTERED', details: 'New account registered as [CUSTOMER]: omkar@gmail.com', ip_address: '127.0.0.1' }
];

const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Organic Royal Gala Apples', category_name: 'Fresh Produce', price: 180, discount_price: 149, stock_quantity: 45, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Fresh Farm Spinach (Palak)', category_name: 'Fresh Produce', price: 40, discount_price: 29, stock_quantity: 60, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Amul Taaza Toned Milk', category_name: 'Dairy & Bakery', price: 64, discount_price: 62, stock_quantity: 80, image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Artisan Whole Wheat Bread', category_name: 'Dairy & Bakery', price: 55, discount_price: 48, stock_quantity: 34, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Cold Pressed Orange Juice', category_name: 'Beverages', price: 120, discount_price: 99, stock_quantity: 28, image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Premium Roasted Almonds', category_name: 'Snacks & Munchies', price: 350, discount_price: 299, stock_quantity: 51, image_url: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=600&q=80' }
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(FALLBACK_METRICS);
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [auditLogs, setAuditLogs] = useState(FALLBACK_AUDIT_LOGS);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('audit');
  const [auditSearch, setAuditSearch] = useState('');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: 1,
    stock_quantity: 50,
    unit: '1 kg',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  });

  useEffect(() => {
    fetchAdminData();
  }, [auditSearch]);

  const fetchAdminData = async () => {
    try {
      const [mRes, uRes, aRes, pRes, cRes] = await Promise.all([
        axios.get('/api/admin/metrics', { timeout: 3000 }),
        axios.get('/api/admin/users', { timeout: 3000 }),
        axios.get('/api/admin/audit-logs', { params: { search: auditSearch }, timeout: 3000 }),
        axios.get('/api/products', { timeout: 3000 }),
        axios.get('/api/categories', { timeout: 3000 })
      ]);

      if (mRes.data.metrics) setMetrics(mRes.data.metrics);
      if (uRes.data.users && uRes.data.users.length > 0) setUsers(uRes.data.users);
      if (aRes.data.audit_logs && aRes.data.audit_logs.length > 0) setAuditLogs(aRes.data.audit_logs);
      if (pRes.data.products && pRes.data.products.length > 0) setProducts(pRes.data.products);
      if (cRes.data.categories) setCategories(cRes.data.categories);
    } catch (err) {
      console.warn('Admin API using local fallback dataset:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, { timeout: 3000 });
    } catch (err) {}
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    setProducts(products.filter(p => p.id !== productId));
    try {
      await axios.delete(`/api/products/${productId}`, { timeout: 3000 });
    } catch (err) {}
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      name: newProd.name,
      category_name: 'General',
      price: Number(newProd.price),
      discount_price: newProd.discount_price ? Number(newProd.discount_price) : null,
      stock_quantity: Number(newProd.stock_quantity),
      image_url: newProd.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    };
    setProducts([created, ...products]);
    setShowAddProduct(false);

    try {
      await axios.post('/api/products', {
        ...newProd,
        price: Number(newProd.price),
        discount_price: newProd.discount_price ? Number(newProd.discount_price) : undefined,
        category_id: Number(newProd.category_id),
        stock_quantity: Number(newProd.stock_quantity)
      }, { timeout: 3000 });
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> System Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Admin & Security Audit Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage user RBAC permissions, product master catalog, and inspect real-time system audit logs.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-500" /> Security Audit Logs ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" /> User RBAC ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-500" /> Product Master ({products.length})
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-4 border-l-4 border-emerald-500">
            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center justify-between">
              <span>TOTAL REVENUE</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">₹{metrics.totalRevenue}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-l-4 border-purple-500">
            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center justify-between">
              <span>REGISTERED USERS</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-l-4 border-amber-500">
            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center justify-between">
              <span>ACTIVE PRODUCTS</span>
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{products.length}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border-l-4 border-rose-500">
            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center justify-between">
              <span>SECURITY AUDITS</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{auditLogs.length}</div>
          </div>
        </div>
      )}

      {/* Tab Panels */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span className="text-xs font-semibold text-slate-500">Loading admin dataset...</span>
        </div>
      ) : activeTab === 'audit' ? (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">System Security & Audit Trail</h3>
              <p className="text-xs text-slate-500">Real-time log of security events, role switches, login attempts, and order state updates.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit actions or users..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{log.user_name || 'SYSTEM'}</td>
                    <td className="p-3">
                      <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.user_role || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-purple-600 dark:text-purple-400">{log.action}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 text-slate-400 font-mono">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) Manager</h3>
            <span className="text-xs text-slate-500 font-semibold">Promote or demote user roles dynamically</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Update Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-3 text-slate-500">{u.phone || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'STAFF' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="STAFF">STAFF / MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Product Catalog Master</h3>
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Original Price</th>
                  <th className="p-3">Discount Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={p.image_url} alt={p.name} className="w-8 h-8 object-cover rounded-lg bg-white" />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3">{p.category_name}</td>
                    <td className="p-3">₹{p.price}</td>
                    <td className="p-3 font-bold text-emerald-600">{p.discount_price ? `₹${p.discount_price}` : '-'}</td>
                    <td className="p-3 font-bold">{p.stock_quantity}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Add New Product Master</h3>
            
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Product Name:</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Category:</label>
                  <select
                    value={newProd.category_id}
                    onChange={(e) => setNewProd({ ...newProd, category_id: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Unit Size:</label>
                  <input
                    type="text"
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">MRP Price (₹):</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Discount Price (₹):</label>
                  <input
                    type="number"
                    value={newProd.discount_price}
                    onChange={(e) => setNewProd({ ...newProd, discount_price: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Initial Stock:</label>
                  <input
                    type="number"
                    value={newProd.stock_quantity}
                    onChange={(e) => setNewProd({ ...newProd, stock_quantity: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Image URL:</label>
                <input
                  type="text"
                  value={newProd.image_url}
                  onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold"
                >
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

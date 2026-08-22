import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, User, Lock, Mail, Phone, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('customer@dmart.com');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, register, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    const modeParam = searchParams.get('mode');

    if (modeParam === 'register') {
      setIsRegister(true);
    } else if (modeParam === 'login') {
      setIsRegister(false);
    }

    if (roleParam) {
      setSelectedRole(roleParam);
      if (roleParam === 'STAFF') {
        setEmail('staff@dmart.com');
        setPassword('Password123!');
      } else if (roleParam === 'ADMIN') {
        setEmail('admin@dmart.com');
        setPassword('Password123!');
      } else {
        setEmail('customer@dmart.com');
        setPassword('Password123!');
      }
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const userData = await register(name, email, password, phone, selectedRole);
        if (userData.role === 'ADMIN') navigate('/admin');
        else if (userData.role === 'STAFF') navigate('/staff');
        else navigate('/');
      } else {
        const userData = await login(email, password);
        if (userData.role === 'ADMIN') navigate('/admin');
        else if (userData.role === 'STAFF') navigate('/staff');
        else navigate('/');
      }
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.message) || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantRoleSignIn = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await switchDemoRole(role);
      if (userData.role === 'ADMIN') navigate('/admin');
      else if (userData.role === 'STAFF') navigate('/staff');
      else navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {isRegister ? 'Register New Account' : 'Sign In to Mini D-Mart'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isRegister 
              ? 'Select your role and create a new account below.' 
              : 'Click any 1-click role button below or enter your email & password.'}
          </p>
        </div>

        {/* Demo 1-Click Role Direct Sign-In Selector */}
        {!isRegister && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-500/20 space-y-2.5">
            <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <span>⚡ Instant 1-Click Sign In:</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleInstantRoleSignIn('CUSTOMER')}
                disabled={loading}
                className="py-2.5 px-1.5 rounded-xl text-[11px] font-black shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 active:scale-95"
              >
                🛒 Customer
              </button>

              <button
                type="button"
                onClick={() => handleInstantRoleSignIn('STAFF')}
                disabled={loading}
                className="py-2.5 px-1.5 rounded-xl text-[11px] font-black shadow-sm transition-all bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-1 active:scale-95"
              >
                📦 Staff
              </button>

              <button
                type="button"
                onClick={() => handleInstantRoleSignIn('ADMIN')}
                disabled={loading}
                className="py-2.5 px-1.5 rounded-xl text-[11px] font-black shadow-sm transition-all bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1 active:scale-95"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {isRegister && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Select Role to Register As:
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-xs"
              >
                <option value="CUSTOMER">🛒 Customer (Shop, Checkout, Return)</option>
                <option value="STAFF">📦 Store Staff / Manager (Process Orders & Returns)</option>
                <option value="ADMIN">🛡️ Admin (System Overview, Audit Logs & RBAC)</option>
              </select>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Name:</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Omkar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@dmart.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">Password:</label>
              {isRegister && <span className="text-[10px] text-slate-400 font-semibold">(Minimum 6 characters)</span>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Mobile Number (Optional):</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7507150511"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : isRegister ? `Register as ${selectedRole} ➔` : 'Sign In ➔'}
          </button>
        </form>

        {/* Toggle Login vs Register */}
        <div className="text-center text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
          {isRegister ? (
            <span>Already have an account? <button onClick={() => { setIsRegister(false); setError(null); }} className="text-emerald-600 dark:text-emerald-400 font-extrabold underline">Sign In</button></span>
          ) : (
            <span>Need an account? <button onClick={() => { setIsRegister(true); setError(null); }} className="text-emerald-600 dark:text-emerald-400 font-extrabold underline">Create New Account</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

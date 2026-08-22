import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingCart, 
  ShieldAlert, 
  ClipboardList, 
  Moon, 
  Sun, 
  LogOut, 
  Store, 
  Layers,
  Sparkles,
  LogIn
} from 'lucide-react';

export default function Navbar({ onOpenCart, darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const { totalItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleClick = (role) => {
    // Log out current session so the user goes to the Sign-In page to authenticate
    logout();
    navigate(`/login?role=${role}&mode=login`);
  };

  const getHomeLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'STAFF') return '/staff';
    return '/';
  };

  const isCustomerOrGuest = !user || user.role === 'CUSTOMER';
  const isStaffOrAdmin = user && ['STAFF', 'ADMIN'].includes(user.role);
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      {/* Top Banner: Assessment Role Selection Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Choose Sign In Role:
            </span>
            <span>Select Role Credentials:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleRoleClick('CUSTOMER')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                user?.role === 'CUSTOMER'
                  ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              🛒 Customer Login
            </button>

            <button
              onClick={() => handleRoleClick('STAFF')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                user?.role === 'STAFF'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              📦 Store Staff Login
            </button>

            <button
              onClick={() => handleRoleClick('ADMIN')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              🛡️ Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to={getHomeLink()} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400">Mini</span>
              <span className="text-slate-900 dark:text-white">D-Mart</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest block -mt-1">Express Grocery</span>
          </div>
        </Link>

        {/* Center Nav Links - Filtered by User Role */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
          {isCustomerOrGuest && (
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Shop Grocery
            </Link>
          )}

          {user && user.role === 'CUSTOMER' && (
            <Link
              to="/orders"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/orders'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> My Orders & Returns
            </Link>
          )}

          {isStaffOrAdmin && (
            <Link
              to="/staff"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/staff'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-semibold'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 font-semibold'
              }`}
            >
              <Layers className="w-4 h-4" /> Store Ops Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/admin'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 font-semibold'
                  : 'text-purple-700 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-950/30 font-semibold'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Admin & Audit Logs
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {isCustomerOrGuest && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-amber-500 text-slate-900 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center -mr-1 animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</p>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : user.role === 'STAFF' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                to="/login?mode=register"
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors hidden sm:block"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

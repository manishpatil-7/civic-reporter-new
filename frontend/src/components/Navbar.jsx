import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, Home, Map, Activity, ShieldAlert, LogIn, LogOut, User, Menu, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, userData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
      isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0 border-b-white/10 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-2" onClick={closeMobile}>
          <motion.div
            whileHover={{ rotate: 15 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-500/30"
          >
            <Activity className="w-6 h-6" />
          </motion.div>
          <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">
            Smart Civic Reporter
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-2 items-center">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="w-4 h-4" />
            <span className="font-medium">Home</span>
          </NavLink>

          <NavLink to="/dashboard" className={navLinkClass}>
            <Map className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </NavLink>

          {user && (
            <NavLink to="/my-complaints" className={navLinkClass}>
              <FileText className="w-4 h-4" />
              <span className="font-medium">My Complaints</span>
            </NavLink>
          )}

          {isAdmin && (
            <>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/submit"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all shadow-lg ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-purple-500/25'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Camera className="w-4 h-4" />
            <span className="font-medium">Report Issue</span>
          </NavLink>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {(userData?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-200 max-w-[100px] truncate">
                  {userData?.name || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <NavLink
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <LogIn className="w-4 h-4" />
                <span className="font-medium">Login</span>
              </NavLink>
              <NavLink
                to="/signup"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 border-t border-white/10 pt-4 space-y-2"
          >
            <NavLink to="/" end className={navLinkClass} onClick={closeMobile}>
              <Home className="w-4 h-4" /><span>Home</span>
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass} onClick={closeMobile}>
              <Map className="w-4 h-4" /><span>Dashboard</span>
            </NavLink>
            <NavLink to="/submit" className={navLinkClass} onClick={closeMobile}>
              <Camera className="w-4 h-4" /><span>Report Issue</span>
            </NavLink>
            {user && (
              <NavLink to="/my-complaints" className={navLinkClass} onClick={closeMobile}>
                <FileText className="w-4 h-4" /><span>My Complaints</span>
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass} onClick={closeMobile}>
                <ShieldAlert className="w-4 h-4" /><span>Admin</span>
              </NavLink>
            )}
            <div className="border-t border-white/10 pt-3 mt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 text-gray-300">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {(userData?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{userData?.name || 'User'}</span>
                    <span className="text-xs text-gray-500">({userData?.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full"
                  >
                    <LogOut className="w-4 h-4" /><span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <NavLink to="/login" className={navLinkClass} onClick={closeMobile}>
                    <LogIn className="w-4 h-4" /><span>Login</span>
                  </NavLink>
                  <NavLink to="/signup" className={navLinkClass} onClick={closeMobile}>
                    <User className="w-4 h-4" /><span>Sign Up</span>
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

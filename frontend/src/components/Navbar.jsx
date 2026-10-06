import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Camera, Home, Map, ShieldAlert, LogIn, LogOut, User,
  Menu, X, FileText, Shield, Bell, Check, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, userData, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {}
  };

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {}
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 font-semibold'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-sm border-b border-gray-200' : 'bg-white/95 border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMobile}>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <Leaf className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-gray-900 tracking-tight">Civic Reporter</span>
          </div>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            <Home className="w-4 h-4" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/dashboard" className={navLinkClass}>
            <Map className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          {user && (
            <NavLink to="/my-complaints" className={navLinkClass}>
              <FileText className="w-4 h-4" />
              <span>My Complaints</span>
            </NavLink>
          )}

          {isAdmin && (
            <>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 text-slate-800 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </NavLink>
            </>
          )}

          {!isAdmin && (
            <>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <NavLink
                to="/submit"
                onClick={(e) => {
                  if (window.location.pathname === '/submit') {
                    e.preventDefault();
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span>Report Issue</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
                      style={{ boxShadow: '0 0 0 2px #fff' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs font-medium text-emerald-600">{unreadCount} new</span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-400">
                            No notifications yet
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map(n => (
                              <div
                                key={n.id}
                                className={`p-3.5 flex gap-3 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-emerald-50/60' : ''}`}
                              >
                                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.read ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-snug ${!n.read ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {n.message}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    {new Date(n.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!n.read && (
                                  <button
                                    onClick={() => handleRead(n.id)}
                                    className="p-1 self-start rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                title="Go to Dashboard"
              >
                <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(userData?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-gray-800 max-w-[100px] truncate leading-tight">
                    {userData?.name || 'User'}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide flex items-center gap-0.5 ${
                    userData?.role === 'admin' ? 'text-slate-500' : 'text-emerald-600'
                  }`}>
                    {userData?.role === 'admin' ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                    {userData?.role === 'admin' ? 'Admin' : 'Citizen'}
                  </span>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <NavLink to="/" end className={navLinkClass} onClick={closeMobile}>
                <Home className="w-4 h-4" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass} onClick={closeMobile}>
                <Map className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              {user && (
                <NavLink to="/my-complaints" className={navLinkClass} onClick={closeMobile}>
                  <FileText className="w-4 h-4" />
                  <span>My Complaints</span>
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass} onClick={closeMobile}>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin</span>
                </NavLink>
              )}
              {!isAdmin && (
                <NavLink
                  to="/submit"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white transition-all"
                  onClick={(e) => {
                    if (window.location.pathname === '/submit') {
                      e.preventDefault();
                      window.location.reload();
                    }
                    closeMobile();
                  }}
                >
                  <Camera className="w-4 h-4" />
                  <span>Report Issue</span>
                </NavLink>
              )}

              <div className="pt-3 mt-2 border-t border-gray-200">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 px-3 py-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {(userData?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{userData?.name || 'User'}</p>
                        <p className="text-xs text-emerald-600 font-medium capitalize">{userData?.role || 'citizen'}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <NavLink to="/login" className={navLinkClass} onClick={closeMobile}>
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </NavLink>
                    <NavLink to="/signup" className={navLinkClass} onClick={closeMobile}>
                      <User className="w-4 h-4" />
                      <span>Sign Up</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

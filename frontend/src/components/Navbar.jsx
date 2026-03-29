import { NavLink } from 'react-router-dom';
import { Camera, Home, Map, Activity, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none !border-t-0 !border-l-0 !border-r-0 border-b-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink to="/" className="flex items-center space-x-2">
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

        <div className="flex space-x-2 sm:space-x-6 items-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span className="font-medium hidden md:inline">Home</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Map className="w-4 h-4" />
            <span className="font-medium hidden md:inline">Dashboard</span>
          </NavLink>
          
          <div className="w-px h-6 bg-white/10 mx-1"></div>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                isActive ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
              }`
            }
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="font-medium hidden md:inline">Admin</span>
          </NavLink>

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

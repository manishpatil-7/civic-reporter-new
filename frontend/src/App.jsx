import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';
import Admin from './pages/Admin';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/details/:id" element={<Details />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-slate-900 overflow-x-hidden text-slate-100 font-sans">
        {/* Glow effect globally */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/10 blur-[150px] rounded-full mix-blend-screen" />
        </div>
        
        <Navbar />
        
        <main className="relative z-10 w-full h-full">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;

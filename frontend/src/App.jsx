import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyComplaints from './pages/MyComplaints';
import AuthorityLogin from './pages/authority/Login';
import AuthorityDashboard from './pages/authority/Dashboard';
import AuthorityComplaintDetail from './pages/authority/ComplaintDetail';
import AIChatbot from './components/AIChatbot';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/details/:id" element={<Details />} />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <Submit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* Authority routes */}
        <Route path="/authority/login" element={<AuthorityLogin />} />
        <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
        <Route path="/authority/complaint/:id" element={<AuthorityComplaintDetail />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div
            className="relative min-h-screen font-sans overflow-x-hidden"
            style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
          >
            <Navbar />
            <AIChatbot />
            <main className="relative w-full h-full">
              <AnimatedRoutes />
            </main>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

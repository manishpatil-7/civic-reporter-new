import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthorityStats, getAuthorityComplaints } from '../../services/authorityApi';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Badge from '../../components/Badge';

const AuthorityDashboard = () => {
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [authFilter, setAuthFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsRes = await getAuthorityStats();
        setStats(statsRes.data);
        const compRes = await getAuthorityComplaints(filter, authFilter);
        setComplaints(compRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('authorityToken');
          navigate('/authority/login');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [filter, authFilter, navigate]);

  if (loading) return <div className="pt-24 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Authority Dashboard</h1>
        <button 
          onClick={() => { localStorage.removeItem('authorityToken'); navigate('/authority/login'); }}
          className="bg-red-500/20 text-red-300 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Complaints', value: stats.total, color: 'text-blue-400' },
          { label: 'Open', value: stats.open, color: 'text-yellow-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-purple-400' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-xl border text-center ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</h3>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 flex-1">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'Pending', 'In Progress', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-gray-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {f === '' ? 'All Status' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        
        <div className={`flex space-x-2 overflow-x-auto pb-2 border-l pl-0 md:pl-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          {[
            { id: '', label: 'All Authorities' },
            { id: 'municipal_corporation', label: 'Municipal Corp' },
            { id: 'municipal_council', label: 'Municipal Council' },
            { id: 'gram_panchayat', label: 'Gram Panchayat' }
          ].map((a) => (
            <button
              key={a.id}
              onClick={() => setAuthFilter(a.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                authFilter === a.id ? 'bg-purple-600 text-white' : isDark ? 'bg-slate-800 text-gray-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complaints.map((c, i) => (
          <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`border rounded-xl overflow-hidden flex flex-col ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}
          >
            <img src={c.imageUrl} alt={c.problemType} className="w-full h-48 object-cover" />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.problemType}</h3>
                <div className="flex flex-col items-end gap-1">
                  <Badge>{c.status}</Badge>
                  <Badge>{c.authorityType?.replace('_', ' ') || 'Unknown'}</Badge>
                </div>
              </div>
              <p className={`text-sm mb-4 flex-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{c.location?.address || `${c.area}, ${c.city}`}</p>
              <button onClick={() => navigate(`/authority/complaints/${c._id}`)} className={`w-full py-2 rounded-lg transition-colors text-sm ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                View & Update
              </button>
            </div>
          </motion.div>
        ))}
        {complaints.length === 0 && <div className={`col-span-full text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No complaints found.</div>}
      </div>
    </div>
  );
};

export default AuthorityDashboard;

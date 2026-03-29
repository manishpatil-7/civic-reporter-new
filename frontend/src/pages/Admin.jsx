import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getComplaints, updateComplaint } from '../services/api';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const Admin = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting logic: High -> Medium -> Low, then by Upvotes
  const severityValue = { High: 3, Medium: 2, Low: 1 };

  const fetchAndSort = async () => {
    try {
      const res = await getComplaints();
      const sorted = res.data.sort((a, b) => {
        if (severityValue[b.severity] !== severityValue[a.severity]) {
          return severityValue[b.severity] - severityValue[a.severity];
        }
        return b.upvotes - a.upvotes;
      });
      setComplaints(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSort();
  }, []);

  const handleStatusChange = async (id, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    let updateData = { status: newStatus };
    
    if (newStatus === 'Resolved') {
      const afterUrl = prompt('Enter image URL for resolution evidence (leave blank for placeholder):');
      updateData.afterImageUrl = afterUrl || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80';
    } else if (currentStatus === 'Resolved') {
      // Removing resolved status means removing the after image
      updateData.afterImageUrl = null;
    }

    try {
      await updateComplaint(id, updateData);
      fetchAndSort(); // refresh list
    } catch (err) {
      console.error('Failed to update', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-white">
        <div className="w-12 h-12 border-4 border-purple-500 border-b-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-24">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
          <ShieldCheck className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Admin <span className="text-gradient">Control Panel</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage issues. Sorted automatically by severity and public upvotes.</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm tracking-wider uppercase">
                <th className="p-6 font-semibold">Issue Details</th>
                <th className="p-6 font-semibold text-center">Priority</th>
                <th className="p-6 font-semibold text-center">Upvotes</th>
                <th className="p-6 font-semibold text-center">Date Reported</th>
                <th className="p-6 font-semibold text-right">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complaints.map((c, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={c.id} 
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img src={c.imageUrl} alt="Issue" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{c.problemType}</p>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{c.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full ${
                      c.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                      c.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center justify-center bg-white/5 px-3 py-1 rounded-full border border-white/10">
                      <span className="font-bold text-pink-400">{c.upvotes}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center text-sm text-gray-400 font-medium">
                     {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right">
                    <div className="inline-flex relative glass-panel rounded-xl overflow-hidden p-1">
                      {['Pending', 'In Progress', 'Resolved'].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => handleStatusChange(c.id, c.status, statusOption)}
                          className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                            c.status === statusOption 
                              ? statusOption === 'Resolved' ? 'bg-green-500 text-white shadow-lg' : 
                                statusOption === 'In Progress' ? 'bg-blue-500 text-white shadow-lg' : 
                                'bg-orange-500 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {statusOption === 'Resolved' && <CheckCircle2 className="w-3 h-3" />}
                          {statusOption === 'In Progress' && <Clock className="w-3 h-3" />}
                          {statusOption === 'Pending' && <AlertTriangle className="w-3 h-3" />}
                          <span>{statusOption}</span>
                        </button>
                      ))}
                    </div>
                    {c.afterImageUrl && (
                       <div className="mt-2 text-xs text-green-400 font-medium tracking-wide">
                          ✓ Evidence Attached
                       </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
             <div className="p-12 text-center text-gray-500">No complaints reported yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

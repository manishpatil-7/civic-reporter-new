import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComplaints, updateComplaint } from '../services/api';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, MapPin, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Admin = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState(null);
  const [afterUrl, setAfterUrl] = useState('');

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
    
    if (newStatus === 'Resolved') {
      setModalTarget({ id, currentStatus, newStatus });
      setAfterUrl('');
      setModalOpen(true);
      return;
    }

    let updateData = { status: newStatus };
    if (currentStatus === 'Resolved') {
      updateData.afterImageUrl = null;
    }

    try {
      await updateComplaint(id, updateData);
      toast.success(`Status updated to ${newStatus}`);
      fetchAndSort();
    } catch (err) {
      console.error('Failed to update', err);
      toast.error('Failed to update status');
    }
  };

  const handleResolveConfirm = async () => {
    if (!modalTarget) return;
    try {
      await updateComplaint(modalTarget.id, {
        status: 'Resolved',
        afterImageUrl: afterUrl || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80',
      });
      toast.success('Issue marked as Resolved ✅');
      setModalOpen(false);
      setModalTarget(null);
      fetchAndSort();
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve');
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

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-400">{complaints.length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-orange-400">{complaints.filter(c => c.status === 'Pending').length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-400">{complaints.filter(c => c.status === 'In Progress').length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">In Progress</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-green-400">{complaints.filter(c => c.status === 'Resolved').length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Resolved</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-300 text-sm tracking-wider uppercase">
                <th className="p-6 font-semibold">Issue Details</th>
                <th className="p-6 font-semibold">Location</th>
                <th className="p-6 font-semibold">Reporter</th>
                <th className="p-6 font-semibold text-center">Priority</th>
                <th className="p-6 font-semibold text-center">Upvotes</th>
                <th className="p-6 font-semibold text-center">Date</th>
                <th className="p-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complaints.map((c, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  key={c.id || c._id} 
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
                        {c.department && (
                          <p className="text-xs text-green-400 mt-1">📋 {c.department}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="max-w-[150px] truncate">
                        {c.locationAddress || (c.location && Array.isArray(c.location)
                          ? `${c.location[0]?.toFixed?.(2) || '—'}, ${c.location[1]?.toFixed?.(2) || '—'}`
                          : '—')}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <User className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>{c.userName || 'Anonymous'}</span>
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
                          onClick={() => handleStatusChange(c.id || c._id, c.status, statusOption)}
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

      {/* Resolution Evidence Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Resolve Issue</h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-400">Provide an image URL showing the resolved issue as evidence.</p>
              <input
                type="url"
                value={afterUrl}
                onChange={(e) => setAfterUrl(e.target.value)}
                placeholder="https://example.com/resolved-image.jpg"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              {!afterUrl && (
                <p className="text-xs text-yellow-400/80 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>No evidence URL provided — a placeholder image will be used.</span>
                </p>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveConfirm}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                >
                  Mark Resolved ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;

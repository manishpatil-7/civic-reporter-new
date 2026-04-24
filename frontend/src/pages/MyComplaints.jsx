import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getComplaintsByUser } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import { FileText, Inbox, Loader2, Search } from 'lucide-react';

const MyComplaints = () => {
  const { user, userData } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMyComplaints = async () => {
      if (!user) return;
      try {
        const res = await getComplaintsByUser(user.uid);
        setComplaints(res.data);
      } catch (err) {
        console.error('Error fetching my complaints:', err);
        setError('Failed to load your complaints. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyComplaints();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <p className="text-gray-400">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  const filteredComplaints = complaints.filter(c => 
    (c.id || c._id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            My <span className="text-gradient">Complaints</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Track the status of issues you've reported, {userData?.name || 'User'}.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            placeholder="Search by Complaint ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-blue-400">{complaints.length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Filed</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-orange-400">
            {complaints.filter(c => c.status === 'Pending').length}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-sky-400">
            {complaints.filter(c => c.status === 'In Progress').length}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">In Progress</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-2xl font-extrabold text-green-400">
            {complaints.filter(c => c.status === 'Resolved').length}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Resolved</p>
        </div>
      </div>

      {/* Complaints Grid or Empty State */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center border border-dashed border-red-500/30"
        >
          <p className="text-red-400 text-lg">{error}</p>
        </motion.div>
      ) : complaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-16 text-center border border-dashed border-gray-600"
        >
          <Inbox className="w-16 h-16 mx-auto mb-6 text-gray-600" />
          <h3 className="text-2xl font-bold text-gray-300 mb-2">No complaints yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You haven't reported any civic issues yet. Head over to the{' '}
            <a href="/submit" className="text-blue-400 hover:text-blue-300 underline transition-colors">
              Report Issue
            </a>{' '}
            page to file your first complaint.
          </p>
        </motion.div>
      ) : (
        <>
          {filteredComplaints.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No complaints found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id || complaint._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ComplaintCard complaint={complaint} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyComplaints;

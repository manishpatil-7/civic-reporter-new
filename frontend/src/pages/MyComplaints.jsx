import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getComplaintsByUser } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import EmptyState from '../components/EmptyState';
import { FileText, Inbox, Loader2, Search, SearchX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MyComplaints = () => {
  const { user, userData } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
      <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-24">
        {/* Header Skeleton */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 shimmer rounded-xl"></div>
          <div>
            <div className="h-10 shimmer rounded w-64 mb-2"></div>
            <div className="h-4 shimmer rounded w-48"></div>
          </div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-2xl border bg-white shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 shimmer rounded-full mb-4"></div>
              <div className="h-8 shimmer rounded w-16 mb-2"></div>
              <div className="h-4 shimmer rounded w-24"></div>
            </div>
          ))}
        </div>

        {/* Complaints Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl border bg-white shadow-sm flex flex-col gap-4">
              <div className="h-48 shimmer rounded-xl w-full"></div>
              <div className="flex gap-2">
                <div className="w-16 h-6 shimmer rounded-full"></div>
                <div className="w-20 h-6 shimmer rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 shimmer rounded w-3/4"></div>
                <div className="h-4 shimmer rounded w-1/2"></div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="w-24 h-4 shimmer rounded"></div>
                <div className="w-8 h-8 shimmer rounded-full"></div>
              </div>
            </div>
          ))}
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
          <h1 className={`text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My <span className="text-gradient">Complaints</span>
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
            className={`w-full border rounded-xl pl-10 pr-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            placeholder="Search by Complaint ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 text-center border rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <p className="text-2xl font-extrabold text-blue-400">{complaints.length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Filed</p>
        </div>
        <div className={`p-4 text-center border rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <p className="text-2xl font-extrabold text-orange-400">
            {complaints.filter(c => c.status === 'Pending').length}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className={`p-4 text-center border rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <p className="text-2xl font-extrabold text-sky-400">
            {complaints.filter(c => c.status === 'In Progress').length}
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">In Progress</p>
        </div>
        <div className={`p-4 text-center border rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
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
          className={`p-12 text-center border border-dashed rounded-2xl ${isDark ? 'glass-panel border-red-500/30' : 'bg-white shadow-sm border-red-500/30'}`}
        >
          <p className="text-red-400 text-lg">{error}</p>
        </motion.div>
      ) : complaints.length === 0 ? (
        <EmptyState 
          icon={Inbox}
          heading="No complaints yet"
          message="You haven't reported any civic issues yet. File your first complaint today."
          ctaText="Report Issue"
          ctaHref="/submit"
          isDark={isDark}
        />
      ) : (
        <>
          {filteredComplaints.length === 0 && searchTerm ? (
            <EmptyState 
              icon={SearchX}
              heading="No matches found"
              message={`No complaints found matching "${searchTerm}".`}
              isDark={isDark}
            />
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

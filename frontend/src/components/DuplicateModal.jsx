/**
 * DuplicateModal.jsx — Premium Duplicate Complaint Detection Modal
 * 
 * Shows when the AI detects similar existing complaints.
 * Allows users to upvote existing complaints or submit anyway.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, ThumbsUp, Plus, X, MapPin, Clock, 
  TrendingUp, Shield, ChevronDown, ChevronUp, Sparkles,
  CheckCircle2, Users
} from 'lucide-react';
import { upvoteComplaint } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DuplicateModal = ({ 
  isOpen, 
  onClose, 
  similarComplaints = [], 
  onSubmitAnyway, 
  isSubmitting = false 
}) => {
  const { userData } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [upvotingId, setUpvotingId] = useState(null);
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [localComplaints, setLocalComplaints] = useState(similarComplaints);

  if (!isOpen) return null;

  // Handle upvote action
  const handleUpvote = async (complaintId) => {
    if (!userData?.uid) {
      toast.error('Please log in to upvote complaints');
      return;
    }

    setUpvotingId(complaintId);
    try {
      const res = await upvoteComplaint(complaintId);
      const updated = res.data;

      // Update local state
      setLocalComplaints(prev => prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            upvotes: updated.upvotes,
            upvotedBy: updated.upvotedBy || [],
          };
        }
        return c;
      }));

      const alreadyUpvoted = upvotedIds.has(complaintId);
      if (alreadyUpvoted) {
        setUpvotedIds(prev => { const next = new Set(prev); next.delete(complaintId); return next; });
        toast('Vote removed', { icon: '👎' });
      } else {
        setUpvotedIds(prev => new Set(prev).add(complaintId));
        toast.success('Thanks for supporting this issue! 👍', { duration: 3000 });
      }
    } catch (err) {
      console.error('Upvote failed:', err);
      toast.error('Failed to upvote. Please try again.');
    } finally {
      setUpvotingId(null);
    }
  };

  const hasUserUpvoted = (complaint) => {
    return upvotedIds.has(complaint.id) || (complaint.upvotedBy || []).includes(userData?.uid);
  };

  // Get severity color based on similarity %
  const getSimilarityColor = (percent) => {
    if (percent >= 95) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    if (percent >= 90) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' };
    return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl relative overflow-hidden">
              
              {/* Header Section */}
              <div className="relative px-8 pt-8 pb-6 border-b border-gray-100 bg-gray-50/50">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-colors group shadow-sm"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
                </button>

                {/* Icon + Title */}
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 shadow-sm"
                  >
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                      Similar Issues Found
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Our AI detected <span className="text-amber-600 font-bold">{localComplaints.length}</span> existing complaint{localComplaints.length !== 1 ? 's' : ''} that appear similar to yours. 
                      Help reduce duplicates by supporting existing reports instead.
                    </p>
                  </div>
                </div>

                {/* Info Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-5 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <span className="font-bold">Why upvote?</span> Upvoting existing complaints increases their priority and helps authorities address issues faster without diluting focus.
                  </p>
                </motion.div>
              </div>

              {/* Complaints List */}
              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4">
                {localComplaints.map((complaint, index) => {
                  const colors = getSimilarityColor(complaint.similarityPercent);
                  const isExpanded = expandedId === complaint.id;
                  const userUpvoted = hasUserUpvoted(complaint);
                  const isUpvoting = upvotingId === complaint.id;

                  return (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden transition-all shadow-sm hover:shadow-md`}
                    >
                      {/* Complaint Header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Similarity Badge + Problem Type */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${colors.text} bg-white border ${colors.border} shadow-sm`}
                              >
                                <Sparkles className="w-3 h-3" />
                                {complaint.similarityPercent}% Match
                              </motion.span>

                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-gray-600 bg-white border border-gray-200 capitalize shadow-sm">
                                {complaint.problemType}
                              </span>

                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                complaint.status === 'Resolved' ? 'text-green-700 bg-green-50 border border-green-200' :
                                complaint.status === 'IN_PROGRESS' ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                                'text-gray-600 bg-gray-50 border border-gray-200'
                              }`}>
                                {complaint.status}
                              </span>
                            </div>

                            {/* Description preview */}
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                              {complaint.description}
                            </p>

                            {/* Metadata row */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                              {complaint.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {complaint.area ? `${complaint.area}, ` : ''}{complaint.city}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {getTimeAgo(complaint.createdAt)}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {complaint.upvotes} upvote{complaint.upvotes !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Upvote Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpvote(complaint.id)}
                            disabled={isUpvoting}
                            className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0 min-w-[76px] ${
                              userUpvoted
                                ? 'bg-emerald-100 border border-emerald-200 text-emerald-700 shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 shadow-sm'
                            }`}
                          >
                            {isUpvoting ? (
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : userUpvoted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <ThumbsUp className="w-5 h-5" />
                            )}
                            <span className="text-xs">{complaint.upvotes}</span>
                          </motion.button>
                        </div>

                        {/* Expand/Collapse toggle */}
                        {complaint.imageUrl && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-3 font-medium transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {isExpanded ? 'Hide image' : 'Show image'}
                          </button>
                        )}
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && complaint.imageUrl && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-gray-200/50 bg-white"
                          >
                            <div className="p-4 pt-3">
                              <img
                                src={complaint.imageUrl}
                                alt="Complaint evidence"
                                className="w-full h-48 object-cover rounded-xl border border-gray-100 shadow-sm"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Submit Anyway */}
                  <button
                    onClick={onSubmitAnyway}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Submit Anyway
                      </>
                    )}
                  </button>

                  {/* Close / Done */}
                  <button
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    {upvotedIds.size > 0 ? "Done — Thanks for Supporting!" : "Close"}
                  </button>
                </div>

                {upvotedIds.size > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-emerald-600 font-semibold mt-4 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    You supported {upvotedIds.size} existing complaint{upvotedIds.size !== 1 ? 's' : ''}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DuplicateModal;

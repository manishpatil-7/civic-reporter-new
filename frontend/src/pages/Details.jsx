import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getComplaintById, upvoteComplaint } from '../services/api';
import { ThumbsUp, MapPin, ArrowLeft, Clock, AlertTriangle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const Details = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [showAfterImage, setShowAfterImage] = useState(false); // Toggle state

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await getComplaintById(id);
        setComplaint(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const res = await upvoteComplaint(id);
      setComplaint(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpvoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 text-white">
        <div className="w-12 h-12 border-4 border-purple-500 border-b-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen pt-24 px-6 text-center text-white">
        <h2 className="text-2xl font-bold bg-white/10 p-12 rounded-2xl glass-panel inline-block">Complaint Not Found</h2>
      </div>
    );
  }

  const hasAfterImage = complaint.status === 'Resolved' && complaint.afterImageUrl;

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Visual Evidence Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl overflow-hidden glass-panel border border-white/10 p-2 shadow-2xl h-fit sticky top-28"
        >
          {hasAfterImage && (
             <div className="flex bg-slate-900 rounded-t-xl overflow-hidden p-1 border-b border-white/10 justify-between items-center mb-2">
               <span className="text-xs font-bold uppercase tracking-wider text-gray-400 pl-3">Image View</span>
               <div className="flex bg-slate-800 rounded-lg p-1 space-x-1">
                 <button 
                   onClick={() => setShowAfterImage(false)}
                   className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center space-x-1 ${!showAfterImage ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   <ImageIcon className="w-4 h-4" />
                   <span>Before</span>
                 </button>
                 <button 
                   onClick={() => setShowAfterImage(true)}
                   className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center space-x-1 ${showAfterImage ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   <CheckCircle2 className="w-4 h-4" />
                   <span>After ✨</span>
                 </button>
               </div>
             </div>
          )}
          
          <div className="relative min-h-[400px] w-full bg-slate-800 rounded-2xl overflow-hidden">
             <AnimatePresence mode="popLayout" initial={false}>
               <motion.img 
                  key={showAfterImage ? 'after' : 'before'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  src={showAfterImage ? complaint.afterImageUrl : complaint.imageUrl} 
                  alt="Evidence" 
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
               />
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Text Details Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-1 text-sm font-bold uppercase rounded-full ${
                complaint.severity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                complaint.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {complaint.severity} Priority
              </span>
              
              <span className={`px-4 py-1 text-sm font-semibold rounded-full border border-white/10 glass-panel ${
                complaint.status === 'Resolved' ? 'text-green-400 bg-green-500/10' : 
                complaint.status === 'In Progress' ? 'text-blue-400 bg-blue-500/10' : 'text-orange-400'
              }`}>
                Status: {complaint.status}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-white mb-2">{complaint.problemType}</h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400 border-b border-white/10 pb-6 mt-4">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{complaint.location[0].toFixed(4)}, {complaint.location[1].toFixed(4)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Formal English Complaint</span>
              </h3>
              <div className="glass-panel p-6 rounded-2xl text-gray-300 leading-relaxed font-serif bg-white/5 border-l-4 border-l-purple-500 border-t border-r border-b border-white/5">
                {complaint.description}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Hindi Translation</h3>
              <div className="glass-panel p-6 rounded-2xl text-gray-300 leading-relaxed font-sans bg-white/5 text-lg">
                {complaint.hindiDescription}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="glass-panel p-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-blue-500/20">
              <div>
                <p className="font-bold text-lg">Support this issue</p>
                <p className="text-sm text-gray-400">Higher upvotes flag this to authorities faster.</p>
              </div>
              
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleUpvote}
                disabled={upvoting}
                className="flex items-center space-x-3 bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-3 rounded-xl font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow"
              >
                <ThumbsUp className={`w-5 h-5 ${upvoting && 'animate-ping'}`} />
                <span className="text-xl">{upvoting ? '...' : complaint.upvotes}</span>
                <span className="text-sm font-normal opacity-80 pl-1 border-l border-white/20">Upvotes</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Details;

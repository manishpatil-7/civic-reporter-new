import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock } from 'lucide-react';
import StatusTracker from './StatusTracker';

const severityColors = {
  High: 'bg-red-500/10 text-red-400 border-red-500/30',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Low: 'bg-green-500/10 text-green-400 border-green-500/30',
};

const statusConfig = {
  'Pending': { icon: '🟡', color: 'bg-yellow-500/20 text-yellow-300' },
  'In Progress': { icon: '🔵', color: 'bg-blue-500/20 text-blue-300' },
  'Resolved': { icon: '🟢', color: 'bg-green-500/20 text-green-300' },
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  // Resolve address display
  const displayAddress = complaint.locationAddress || 
    (complaint.location && Array.isArray(complaint.location)
      ? `${complaint.location[0]?.toFixed?.(2) || '—'}, ${complaint.location[1]?.toFixed?.(2) || '—'}`
      : '—');

  const activeStatus = statusConfig[complaint.status] || statusConfig['Pending'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.01 }}
      onClick={() => navigate(`/details/${complaint.id || complaint._id}`)}
      className="glass-panel overflow-hidden cursor-pointer group shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={complaint.imageUrl}
          alt={complaint.problemType}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        
        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border backdrop-blur-md shadow-lg ${activeStatus.color}`}>
            {activeStatus.icon} {complaint.status || 'Pending'}
          </span>
        </div>
        
        {/* Bottom Image Overlay text */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-end">
            <div>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border backdrop-blur-md mb-2 ${severityColors[complaint.severity] || severityColors.Medium}`}>
                {complaint.severity} Severity
              </span>
              <h3 className="text-xl font-extrabold text-white leading-tight">{complaint.problemType}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col h-full">
        {/* Status Tracker (compact) */}
        <div className="mb-4">
          <StatusTracker status={complaint.status} compact />
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-4 mt-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 hover:text-blue-300 transition-colors">
              <MapPin className="w-3.5 h-3.5" />
              <span className="max-w-[120px] truncate">{displayAddress}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/10"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            <span className="font-bold text-white text-xs">{complaint.upvotes || 0}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;

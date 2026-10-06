import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import StatusTracker from './StatusTracker';
import { useTheme } from '../context/ThemeContext';
import Badge from './Badge';

const severityConfig = {
  High: { 
    bg: 'bg-red-500/10', 
    text: 'text-red-400', 
    border: 'border-red-500/30',
    glow: 'group-hover:shadow-red-500/20',
    gradient: 'from-red-500/20 to-red-600/10'
  },
  Medium: { 
    bg: 'bg-yellow-500/10', 
    text: 'text-yellow-400', 
    border: 'border-yellow-500/30',
    glow: 'group-hover:shadow-yellow-500/20',
    gradient: 'from-yellow-500/20 to-yellow-600/10'
  },
  Low: { 
    bg: 'bg-green-500/10', 
    text: 'text-green-400', 
    border: 'border-green-500/30',
    glow: 'group-hover:shadow-green-500/20',
    gradient: 'from-green-500/20 to-green-600/10'
  },
};

const statusConfig = {
  'Pending': { 
    icon: '⏳', 
    pulse: true
  },
  'In Progress': { 
    icon: '🚀', 
    pulse: true
  },
  'Resolved': { 
    icon: '✅', 
    pulse: false
  },
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  // Using forced light theme as per UI spec

  const displayAddress = complaint.locationAddress || 
    (complaint.location && Array.isArray(complaint.location)
      ? `${complaint.location[0]?.toFixed?.(2) || '—'}, ${complaint.location[1]?.toFixed?.(2) || '—'}`
      : '—');

  const activeStatus = statusConfig[complaint.status] || statusConfig['Pending'];
  const severityStyle = severityConfig[complaint.severity] || severityConfig.Medium;

  return (
    <motion.div
      onClick={() => navigate(`/details/${complaint.id || complaint._id}`)}
      className="relative group cursor-pointer h-full"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Subtle border and shadow for depth instead of glow */}
      <div className="relative h-full overflow-hidden rounded-2xl border bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-52 overflow-hidden">
          <motion.img
            src={complaint.imageUrl}
            alt={complaint.problemType}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <motion.div animate={activeStatus.pulse ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>
              <Badge icon={<span>{activeStatus.icon}</span>}>
                {complaint.status || 'Pending'}
              </Badge>
            </motion.div>
          </div>
          
          {/* Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <motion.span 
                  className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-sm mb-2 ${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
                >
                  {complaint.severity} Priority
                </motion.span>
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-gradient transition-all">
                  {complaint.problemType}
                </h3>
              </div>
              
              {/* View Icon */}
              <motion.div
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5">
          {/* Status Tracker */}
          <div className="mb-4">
            <StatusTracker status={complaint.status} compact />
          </div>
          
          {/* Footer Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <motion.div 
                className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                whileHover={{ x: 2 }}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{displayAddress}</span>
              </motion.div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Upvotes */}
            <motion.div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border group-hover:border-emerald-500/30 group-hover:bg-emerald-50 transition-all bg-gray-50 border-gray-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-xs text-gray-800">{complaint.upvotes || 0}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;

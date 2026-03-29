import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock } from 'lucide-react';

const severityColors = {
  High: 'bg-red-500/20 text-red-400 border-red-500/50',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  Low: 'bg-green-500/20 text-green-400 border-green-500/50',
};

const statusColors = {
  Pending: 'text-orange-400',
  Resolved: 'text-green-400',
  'In Progress': 'text-blue-400'
};

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/details/${complaint.id}`)}
      className="glass-panel overflow-hidden cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={complaint.imageUrl}
          alt={complaint.problemType}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${severityColors[complaint.severity]}`}>
            {complaint.severity}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-100">{complaint.problemType}</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {complaint.description}
        </p>
        
        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Lat: {complaint.location[0].toFixed(2)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className={statusColors[complaint.status] || 'text-gray-300'}>
              {complaint.status}
            </span>
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 rounded-full">
            <ThumbsUp className="w-3 h-3 text-pink-400" />
            <span className="font-medium text-white">{complaint.upvotes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplaintCard;

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  heading = 'No results found', 
  message = 'Try adjusting your filters or search terms.',
  ctaText,
  ctaAction,
  ctaHref,
  isDark = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-16 text-center border border-dashed rounded-3xl flex flex-col items-center justify-center ${
        isDark 
          ? 'glass-panel border-gray-600' 
          : 'bg-white shadow-sm border-slate-200'
      }`}
    >
      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className={`text-2xl font-bold mb-2 tracking-tight ${
        isDark ? 'text-gray-300' : 'text-slate-900'
      }`}>
        {heading}
      </h3>
      <p className={`max-w-md mx-auto mb-8 leading-relaxed ${
        isDark ? 'text-gray-500' : 'text-slate-500'
      }`}>
        {message}
      </p>
      
      {ctaText && (
        ctaHref ? (
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {ctaText}
          </a>
        ) : ctaAction ? (
          <button
            onClick={ctaAction}
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {ctaText}
          </button>
        ) : null
      )}
    </motion.div>
  );
};

export default EmptyState;

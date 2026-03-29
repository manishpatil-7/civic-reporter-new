import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Loader = ({ text = "AI is analyzing your image..." }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50"></div>
        <Loader2 className="w-16 h-16 text-blue-400 relative z-10" />
      </motion.div>
      
      <div className="flex items-center space-x-2 text-xl font-medium">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <span className="text-gradient min-h-[1.5em]">{displayedText}</span>
      </div>
      
      <p className="text-sm text-gray-400 opacity-70">
        Extracting problem type, severity, and details...
      </p>
    </div>
  );
};

export default Loader;

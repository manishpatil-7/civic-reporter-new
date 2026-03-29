import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Map, FileText, Camera } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen pt-24 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center"
      >
        <motion.div variants={itemVariants} className="inline-block mb-4 items-center">
          <span className="glass-panel px-4 py-2 text-sm font-medium rounded-full text-blue-300 border border-blue-500/30 inline-flex">
            AI-Powered Civic Reporting
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Report Civic Issues <br />
          <span className="text-gradient">with AI Precision</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Empowering citizens to build better cities. Snap a photo of potholes, 
          broken lights, or uncollected garbage, and our AI will automatically classify, 
          localize, and analyze the issue.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button 
            onClick={() => navigate('/submit')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2 group"
          >
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Report an Issue Now</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center space-x-2"
          >
            <Map className="w-5 h-5" />
            <span>View Dashboard</span>
          </button>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="mt-24 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
        >
          <div className="glass-panel p-6">
            <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Snap a Photo</h3>
            <p className="text-gray-400">Capture the issue clearly. Our AI supports various civic problems like road damages and waste.</p>
          </div>
          
          <div className="glass-panel p-6">
            <div className="bg-purple-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. AI Auto-Fills</h3>
            <p className="text-gray-400">Our advanced model generates a formal complaint, extracts severity, and translates to Hindi.</p>
          </div>
          
          <div className="glass-panel p-6">
            <div className="bg-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Map className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">3. Track & Resolve</h3>
            <p className="text-gray-400">View your complaint on the live city map, upvote pressing issues, and track resolutions.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;

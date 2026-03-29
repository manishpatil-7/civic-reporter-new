import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import Loader from '../components/Loader';
import { analyzeImage, createComplaint, checkDuplicate } from '../services/api';

const Submit = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Upload, 2: Load/Analyze, 3: Form
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [formData, setFormData] = useState({
    problemType: '',
    severity: 'Medium',
    description: '',
    hindiDescription: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [finalImageUrl, setFinalImageUrl] = useState(null);

  const handleUpload = async (uploadedFile, url) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setPreview(url);
    setStep(2);
    
    try {
      // 1. Upload to Cloudinary & Fake AI analysis
      const res = await analyzeImage(uploadedFile);
      const data = res.data;
      
      setFinalImageUrl(data.imageUrl);

      setFormData({
        problemType: data.problemType,
        severity: data.severity,
        description: data.description,
        hindiDescription: data.hindiDescription
      });

      // 2. Check for duplicates
      const dupeRes = await checkDuplicate(data.problemType, [0, 0]);
      if (dupeRes.data.isDuplicate) {
        setDuplicateWarning({
          confidence: dupeRes.data.confidence,
          similarId: dupeRes.data.similarId
        });
      } else {
        setDuplicateWarning(null);
      }

      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Error analyzing image: ' + (err.response?.data?.message || err.message));
      setStep(1); // fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        imageUrl: finalImageUrl || preview,
      };
      await createComplaint(dataToSubmit);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 relative max-w-4xl mx-auto pb-24">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold mb-8 text-center"
      >
        <span className="text-gradient">Report an Issue</span>
      </motion.h1>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <UploadBox onUpload={handleUpload} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center flex-col items-center mt-20"
          >
            <div className="w-48 h-48 rounded-2xl overflow-hidden mb-8 border-4 border-white/10 shadow-lg relative">
              <img src={preview} className="w-full h-full object-cover blur-sm opacity-50" alt="Preview hidden" />
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay"></div>
            </div>
            <Loader />
          </motion.div>
        )}

        {step === 3 && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto space-y-6"
          >
            {/* Duplicate Warning Banner */}
            {duplicateWarning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3 mb-6"
              >
                <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-yellow-400">Wow Feature: Duplicate Detected!</h4>
                  <p className="text-sm text-yellow-200 mt-1">
                    Our AI has detected a similar issue ({duplicateWarning.confidence}% visual match) reported previously.
                  </p>
                  <Link to={`/details/${duplicateWarning.similarId}`} target="_blank" className="flex items-center space-x-1 mt-2 text-sm text-yellow-400 hover:text-yellow-300 font-medium pb-0.5 border-b border-yellow-400/50 inline-flex">
                    <FileText className="w-4 h-4" />
                    <span>View Existing Complaint</span>
                  </Link>
                </div>
              </motion.div>
            )}

            <div className="flex gap-6 mb-6">
              <div className="w-1/3 rounded-xl overflow-hidden">
                <img src={preview} alt="Thumb" className="w-full h-full object-cover aspect-square" />
              </div>
              <div className="w-2/3 flex flex-col justify-center">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                  AI Analysis Complete.
                </h3>
                <p className="text-gray-400 mt-2 text-sm">Please verify the AI extracted details below.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Problem Type</label>
              <input 
                type="text" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={formData.problemType}
                onChange={(e) => setFormData({...formData, problemType: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Severity</label>
              <select 
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
              >
                <option value="Low">Low - Not Urgent</option>
                <option value="Medium">Medium - Needs Attention</option>
                <option value="High">High - Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description (AI Generated)</label>
              <textarea 
                required
                rows="4"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Hindi Translation</label>
              <textarea 
                rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-4 text-white font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={formData.hindiDescription}
                onChange={(e) => setFormData({...formData, hindiDescription: e.target.value})}
              />
            </div>

            <motion.button 
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-bold flex justify-center text-white mt-8 transition-colors ${
                isSubmitting ? 'bg-gray-600' : 
                duplicateWarning ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40'
              }`}
            >
              {isSubmitting ? 'Submitting...' : duplicateWarning ? 'Submit Anyway (Ignore Warning)' : 'Submit Complaint to Dashboard'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Submit;

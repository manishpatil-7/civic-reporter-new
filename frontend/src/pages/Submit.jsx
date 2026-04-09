import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, FileText, MapPin, Navigation, Building2, User, Download, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import UploadBox from '../components/UploadBox';
import Loader from '../components/Loader';
import { analyzeImage, createComplaint, checkDuplicate } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useUserLocation from '../hooks/useLocation';
import { getDepartment } from '../utils/departments';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import html2pdf from 'html2pdf.js';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '1rem' };
const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi as fallback

const Submit = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const location = useUserLocation();

  const [step, setStep] = useState(1); // 1: Upload, 2: Load/Analyze, 3: Form, 4: Success
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [formData, setFormData] = useState({
    problemType: '',
    severity: 'Medium',
    description: '',
    formalLetter: '',
    hindiFormalLetter: '',
    department: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPos, setMarkerPos] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const letterRef = useRef();

  // Auto-detect location on mount
  useEffect(() => {
    location.detectLocation();
  }, []);

  useEffect(() => {
    if (location.lat && location.lng) {
      setMapCenter({ lat: location.lat, lng: location.lng });
      setMarkerPos({ lat: location.lat, lng: location.lng });
    }
  }, [location.lat, location.lng]);

  const handleUpload = async (uploadedFile, url) => {
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setPreview(url);
    setStep(2);
    
    try {
      let locationAddress = location.address || '';
      if (!locationAddress && !location.loading) {
        try {
          await location.detectLocation();
          await new Promise(r => setTimeout(r, 500));
        } catch {}
        locationAddress = location.address || '';
      }

      const userName = userData?.name || '';
      const res = await analyzeImage(uploadedFile, { userName, locationAddress });
      const data = res.data;

      setAiData(data);
      setFinalImageUrl(data.imageUrl);

      if (
        data.problemType === "None" ||
        (data.confidence || 0) < 0.75 ||
        !data.problemType
      ) {
        toast('⚠️ AI is not confident. Please select problem manually.', { icon: '🤔' });
        setFormData({
          problemType: '',
          severity: 'Medium',
          formalLetter: '',
          hindiFormalLetter: '',
          department: 'General Municipal Department',
        });
      } else {
        setFormData({
          problemType: data.problemType,
          severity: data.severity,
          formalLetter: data.formalLetter,
          hindiFormalLetter: data.hindiFormalLetter || '',
          department: getDepartment(data.problemType),
        });
      }

      // Check for duplicates
      const dupeRes = await checkDuplicate(data.problemType, [
        markerPos?.lat || location.lat || 0,
        markerPos?.lng || location.lng || 0,
      ]);
      
      if (dupeRes.data.isDuplicate) {
        setDuplicateWarning({
          confidence: dupeRes.data.confidence,
          similarId: dupeRes.data.similarId,
        });
      } else {
        setDuplicateWarning(null);
      }

      setStep(3);
    } catch (err) {
      console.error(err);
      toast.error('Error analyzing image: ' + (err.response?.data?.message || err.message));
      setStep(1);
    }
  };

  const handleProblemTypeChange = (value) => {
    setFormData({ ...formData, problemType: value, department: getDepartment(value) });
  };

  const onMarkerDragEnd = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    // Note: To automatically update `location.address` based on new lat/lng,
    // a reverse geocoding call would be needed. For this scope, the lat/lng is updated for submission.
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        imageUrl: finalImageUrl || preview,
        userId: userData?.uid || '',
        userName: userData?.name || 'Anonymous',
        location: {
          lat: markerPos?.lat || location.lat || 0,
          lng: markerPos?.lng || location.lng || 0,
          address: location.address || 'User Specified Location',
        },
      };
      const res = await createComplaint(dataToSubmit);
      setSubmittedId(res.data?._id || res.data?.id || 'CMP-10X');
      setStep(4);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    const element = letterRef.current;
    if (!element) return;
    
    // We clone the element to modify its style for PDF specifically
    const clone = element.cloneNode(true);
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#000000';
    clone.style.padding = '40px';
    
    html2pdf().from(clone).set({
      margin: 1,
      filename: `Complaint_${formData.problemType}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };

  const steps = ["Upload", "Analyze", "Submit"];

  return (
    <div className="min-h-screen pt-24 px-6 relative max-w-5xl mx-auto pb-24">
      {/* Progress Indicator */}
      {step < 4 && (
        <div className="flex items-center justify-center space-x-4 mb-10 w-full max-w-lg mx-auto">
          {steps.map((s, idx) => {
            const num = idx + 1;
            const isActive = step === num;
            const isCompleted = step > num;
            return (
              <div key={s} className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-300 ${
                  isActive ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                  : isCompleted ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : num}
                </div>
                <span className={`font-semibold text-sm ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                  {s}
                </span>
                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-500 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold mb-2 text-center"
          >
            <span className="text-gradient">Report an Issue</span>
          </motion.h1>
          <p className="text-gray-400 text-center mb-8">Upload a photo, and our AI will document the rest.</p>
        </motion.div>
      )}

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
            <div className="w-48 h-48 rounded-2xl overflow-hidden mb-8 shadow-lg relative group">
              <img src={preview} className="w-full h-full object-cover blur-sm opacity-50" alt="Preview hidden" />
              <div className="absolute inset-0 bg-blue-500/20 animate-pulse mix-blend-overlay"></div>
              {/* Scanline effect */}
              <motion.div 
                animate={{ y: ['-10%', '110%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-b-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10 w-full"
              />
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
            className="glass-panel p-8 rounded-3xl max-w-4xl mx-auto space-y-8"
          >
            {duplicateWarning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-start space-x-4 mb-6 shadow-lg shadow-yellow-500/5"
              >
                <AlertCircle className="w-7 h-7 text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-lg font-bold text-yellow-400">⚠️ Similar issue already reported ({duplicateWarning.confidence}% visual match)</h4>
                  <p className="text-sm text-yellow-200 mt-1">
                    It looks like someone has already reported something similar here.
                  </p>
                  <Link to={`/details/${duplicateWarning.similarId}`} target="_blank" className="inline-flex items-center space-x-2 mt-3 px-4 py-2 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 rounded-xl transition-all font-semibold">
                    <FileText className="w-4 h-4" />
                    <span>View Existing Complaint</span>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Top Analysis Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-white/10">
              <div className="w-full md:w-1/4 rounded-2xl overflow-hidden shadow-lg relative h-40 flex-shrink-0">
                <img src={preview} alt="Thumb" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur text-xs font-bold rounded-lg text-white">
                  Evidence
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                  AI Analysis Complete
                </h3>
                {aiData && (
                  <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-gray-400 font-medium tracking-wide">Confidence Score</span>
                      <span className="text-md font-bold text-blue-400">{Math.round((aiData.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((aiData.confidence || 0) * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Metadata & Map */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center space-x-2 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Exact Location</span>
                  </label>
                  <div className="glass-panel p-2 rounded-2xl border-white/5 mb-2 overflow-hidden relative">
                    {!isLoaded ? (
                      <div className="h-[300px] w-full flex items-center justify-center bg-white/5"><Loader /></div>
                    ) : (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={15}
                        options={{ disableDefaultUI: true, zoomControl: true }}
                      >
                        {markerPos && <MarkerF position={markerPos} draggable={true} onDragEnd={onMarkerDragEnd} />}
                      </GoogleMap>
                    )}
                    <div className="absolute top-4 left-4 right-4 bg-gray-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-sm shadow-xl flex items-start space-x-2">
                       <MapPin className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                       <span className="flex-1 font-medium">{location.address || "Drag marker to adjust location"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Problem Type</label>
                    <input 
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                      value={formData.problemType}
                      onChange={(e) => handleProblemTypeChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Severity</label>
                    <select 
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    >
                      <option value="Low">Low - Not Urgent</option>
                      <option value="Medium">Medium - Needs Attention</option>
                      <option value="High">High - Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-green-400" />
                    <span>Suggested Department</span>
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column: Formal Letters */}
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-[-0.5rem]">
                  <label className="block text-sm font-semibold text-gray-400 flex items-center space-x-2 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Formal Complaints</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={downloadPDF}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PDF</span>
                  </button>
                </div>

                {/* Printable container for PDF (also styled visually as paper) */}
                <div ref={letterRef} className="space-y-4">
                  <div className="bg-[#fdfdfd] text-gray-800 p-6 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">English Document</p>
                    <textarea
                      value={formData.formalLetter || ""}
                      onChange={(e) => setFormData({...formData, formalLetter: e.target.value})}
                      rows="8"
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium resize-y leading-relaxed"
                    />
                  </div>

                  <div className="bg-[#fdfdfd] text-gray-800 p-6 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">हिंदी दस्तावेज़</p>
                    <textarea
                      value={formData.hindiFormalLetter || ""}
                      onChange={(e) => setFormData({...formData, hindiFormalLetter: e.target.value})}
                      rows="6"
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium resize-y leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            <motion.button 
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-5 rounded-2xl text-lg font-bold flex justify-center text-white mt-8 transition-all ${
                isSubmitting ? 'bg-gray-600' : 
                duplicateWarning ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-xl shadow-yellow-600/20 hover:shadow-yellow-600/40' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]'
              }`}
            >
              {isSubmitting ? 'Submitting to Authority...' : duplicateWarning ? 'Submit Anyway (Ignore Warning)' : 'Submit Official Complaint'}
            </motion.button>
          </motion.form>
        )}

        {/* Status Step 4: Success Screen */}
        {step === 4 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-3xl max-w-xl mx-auto text-center border-t-4 border-t-green-500 shadow-2xl shadow-green-500/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full"></div>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-green-500/30 mb-8"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-4xl font-extrabold mb-4 text-white">Submitted!</h2>
            <p className="text-lg text-gray-300 font-medium mb-8">
              Thank you for helping improve your city 🙌. Your report has been officially logged with the municipal authority.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left mb-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-gray-400 font-medium">Complaint ID</span>
                <span className="text-white font-bold tracking-wider font-mono bg-white/10 px-3 py-1 rounded-lg">#{submittedId}</span>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-gray-300 leading-relaxed font-medium">{location.address || 'User Specified Location'}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={() => navigate('/dashboard')} className="flex-1 py-4 px-6 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10">
                View Dashboard
              </button>
              <button onClick={() => navigate('/my-complaints')} className="flex-1 py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 text-white transition-all">
                Track Status
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Submit;

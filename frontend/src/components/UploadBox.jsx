import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, X, Camera } from 'lucide-react';

const UploadBox = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file, url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onUpload(null, null);
  };

  const handleCameraCapture = (e) => {
    e.stopPropagation();
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <motion.div
        whileHover={!preview ? { scale: 1.01 } : {}}
        className={`relative bg-white rounded-3xl p-10 border-2 transition-all duration-300 ${
          dragActive 
            ? "border-emerald-400 bg-emerald-50 shadow-md" 
            : "border-dashed border-gray-300 hover:border-emerald-400 hover:bg-gray-50 shadow-sm"
        } cursor-pointer min-h-[360px] flex flex-col items-center justify-center text-center overflow-hidden`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {preview ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden group border border-gray-200 shadow-sm"
            >
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button 
                  onClick={removeImage}
                  className="bg-white text-red-600 p-3 rounded-full hover:bg-red-50 hover:text-red-700 shadow-md transform hover:scale-105 transition-all"
                  aria-label="Remove image"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center space-y-5"
            >
              <motion.div 
                animate={dragActive ? { y: -5, scale: 1.05 } : { y: 0, scale: 1 }}
                className="p-5 bg-emerald-50 rounded-full inline-block border border-emerald-100"
              >
                <UploadCloud className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  Upload issue evidence
                </p>
                <p className="text-sm text-gray-500 font-medium">Drag & drop or click to browse</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>JPG, PNG up to 10MB</span>
                </div>
                
                <button
                  onClick={handleCameraCapture}
                  className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-all font-semibold text-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UploadBox;

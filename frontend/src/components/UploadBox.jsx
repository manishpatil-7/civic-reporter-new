import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const UploadBox = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

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
    onUpload(null, null);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative glass-panel rounded-2xl p-8 border-2 border-dashed transition-colors duration-300 ${
          dragActive ? "border-blue-400 bg-blue-500/10" : "border-gray-500/50 hover:border-blue-300 pointer-events-auto"
        } cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[250px] rounded-xl overflow-hidden group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={removeImage}
                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-white/5 rounded-full inline-block backdrop-blur-sm">
              <UploadCloud className="w-12 h-12 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-semibold mb-2">Drag & Drop visual evidence</p>
              <p className="text-sm text-gray-400">or click to browse your files</p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-4">
              <ImageIcon className="w-4 h-4" />
              <span>Supports JPG, PNG</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadBox;

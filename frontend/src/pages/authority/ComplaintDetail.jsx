import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateComplaintStatus } from '../../services/authorityApi';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const AuthorityComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data);
        setStatus(res.data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await updateComplaintStatus(id, status);
      alert('Status updated successfully');
      navigate('/authority/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading...</div>;
  if (!complaint) return <div className="pt-24 text-center">Complaint not found</div>;

  return (
    <div className="min-h-screen pt-24 px-6 max-w-4xl mx-auto pb-24">
      <button onClick={() => navigate(-1)} className={`mb-6 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>← Back to Dashboard</button>
      
      <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{complaint.problemType}</h1>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{complaint.location?.address || 'Location not provided'}</p>
        
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1">
            <img src={complaint.imageUrl} alt="Issue" className={`w-full h-64 object-cover rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <button 
              onClick={handleUpdateStatus} 
              disabled={updating || status === complaint.status}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Description</h3>
            <p className={`p-4 rounded-xl border ${isDark ? 'text-gray-300 bg-slate-900/50 border-white/5' : 'text-gray-800 bg-gray-50 border-gray-200'}`}>{complaint.description}</p>
          </div>
          
          {complaint.formalLetter && (
            <div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Formal Letter</h3>
              <pre className={`p-4 rounded-xl border whitespace-pre-wrap font-sans text-sm ${isDark ? 'text-gray-300 bg-slate-900/50 border-white/5' : 'text-gray-800 bg-gray-50 border-gray-200'}`}>{complaint.formalLetter}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityComplaintDetail;

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { getComplaints } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import { Filter, Layers, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

/* Dark mode map style */
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#a8b2d1' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4ade80' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b3b6b' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const severityColor = {
  High: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  Medium: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  Low: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
};

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await getComplaints();
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filtered = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.severity === filter);

  // Stats
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  const onMapLoad = useCallback((map) => {
    if (filtered.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      filtered.forEach(c => {
        if (c.location && c.location.length === 2) {
          bounds.extend({ lat: c.location[0], lng: c.location[1] });
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [filtered]);

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            City <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-2">Live view of civic issues reported in your area.</p>
        </div>
        
        <div className="flex space-x-2 bg-white/5 p-1 rounded-xl border border-white/10 md:self-end">
          {['All', 'High', 'Medium', 'Low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics & Map View */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Overview</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <p className="text-3xl font-extrabold text-blue-400">{complaints.length}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Issues</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <p className="text-3xl font-extrabold text-green-400">{resolvedCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Resolved</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <p className="text-3xl font-extrabold text-orange-400">{pendingCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Pending</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <p className="text-3xl font-extrabold text-sky-400">{inProgressCount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">In Progress</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 h-80 relative overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-3 px-2 flex items-center space-x-2">
              <MapIcon />
              <span>Issue Heatmap</span>
            </h3>
            <div className="flex-1 rounded-xl overflow-hidden shadow-inner border border-white/5">
              {!isLoaded ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={12}
                  onLoad={onMapLoad}
                  options={{
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    zoomControlOptions: {
                      position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM,
                    },
                    gestureHandling: 'cooperative',
                  }}
                >
                  {filtered.map(c => {
                    const getMarkerIcon = (complaint) => {
                      if (complaint.status === 'Resolved') return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                      if (complaint.severity === 'High') return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                      return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                    };
                    
                    return c.location && c.location.length === 2 && (
                      <MarkerF
                        key={c._id || c.id}
                        position={{ lat: c.location[0], lng: c.location[1] }}
                        icon={getMarkerIcon(c)}
                        onClick={() => setSelectedMarker(c)}
                      />
                    );
                  })}

                  {selectedMarker && (
                    <InfoWindowF
                      position={{ lat: selectedMarker.location[0], lng: selectedMarker.location[1] }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div style={{ padding: '4px', fontFamily: 'system-ui, sans-serif' }}>
                        <p style={{ fontWeight: 700, color: '#1a1a2e', margin: 0, fontSize: '14px' }}>
                          {selectedMarker.problemType}
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                          {selectedMarker.severity} Severity
                        </p>
                      </div>
                    </InfoWindowF>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel p-12 text-center text-gray-400 border border-dashed border-gray-600">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No complaints found matching this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map(complaint => (
                <ComplaintCard key={complaint.id || complaint._id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* SVG icon helper */
const MapIcon = () => (
  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

export default Dashboard;

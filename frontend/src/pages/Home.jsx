import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera, MapPin, Search, CheckCircle2, ArrowRight,
  Zap, ShieldCheck, Users, TrendingUp, Clock,
  AlertTriangle, Droplets, Trash2, Lightbulb, Construction,
  TreePine, Phone, Wifi, CircleDot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ---- Framer Motion Variants ---- */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ---- Step Data (Workflow) ---- */
const WORKFLOW_STEPS = [
  { icon: Camera, title: 'Capture Evidence', desc: 'Upload a photo of the civic issue. GPS or EXIF data is extracted automatically.' },
  { icon: Zap, title: 'AI Analysis', desc: 'Our AI identifies the issue type, severity, and generates a formal complaint letter.' },
  { icon: MapPin, title: 'Location Pinned', desc: 'Your location is used to find the exact city, ward, and jurisdiction.' },
  { icon: Users, title: 'Authority Routed', desc: 'The complaint is directed to the correct municipal body — panchayat, council, or corporation.' },
  { icon: Clock, title: 'Track Progress', desc: 'Get real-time status updates: Pending → In Progress → Resolved.' },
  { icon: CheckCircle2, title: 'Issue Resolved', desc: 'Close the loop with before/after photos once the authority resolves the issue.' },
];

/* ---- Issue Categories ---- */
const CATEGORIES = [
  { icon: Construction, label: 'Potholes & Roads', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { icon: Trash2, label: 'Garbage & Waste', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { icon: Droplets, label: 'Drainage & Flooding', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { icon: Lightbulb, label: 'Street Lights', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { icon: Droplets, label: 'Water Supply', color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { icon: TreePine, label: 'Parks & Trees', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { icon: Phone, label: 'Public Utilities', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { icon: Wifi, label: 'Other Issues', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
];

/* ---- Platform Features ---- */
const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    desc: 'Automated issue detection, severity scoring, and formal complaint letter generation in seconds.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: ShieldCheck,
    title: 'Duplicate Prevention',
    desc: 'Semantic search detects existing complaints for the same issue, reducing redundancy.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: MapPin,
    title: 'Smart Authority Routing',
    desc: 'GPS + jurisdiction mapping routes every complaint to the correct gram panchayat, council, or corporation.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Status',
    desc: 'Track every complaint from submission to resolution with a timestamped status timeline.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="pt-28 pb-20 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">

          {/* Platform badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-semibold text-emerald-700 mb-6"
          >
            <CircleDot className="w-3.5 h-3.5" />
            CivicTech Platform for India
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5"
          >
            Report civic issues.{' '}
            <span className="text-emerald-700">Route them right.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload a photo, let AI analyze the problem, and have your complaint automatically routed
            to the right municipal authority — with a tracking number.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate(user ? '/submit' : '/signup')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-base rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <Camera className="w-5 h-5" />
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
              <span>View Live Dashboard</span>
            </button>
          </motion.div>

          {/* Quick Info Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 text-sm text-slate-500"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Free to use
            </span>
            <span className="hidden sm:block text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              No forms — just a photo
            </span>
            <span className="hidden sm:block text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Supports 13 Indian languages
            </span>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              From photo to resolution in 6 steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Civic Reporter handles the complexity — you just capture the issue.
            </p>
          </motion.div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="bg-white border border-slate-100 rounded-3xl p-8 h-full flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                      <step.icon className="w-6 h-6 text-emerald-700" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT CAN YOU REPORT
          ============================================================ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
              Issue Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What can you report?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Any civic infrastructure or public services issue that needs government attention.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.label} variants={fadeInUp}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`w-full flex flex-col items-center gap-3 p-5 rounded-2xl border ${cat.bg} ${cat.border} hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200 group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/80 ${cat.border} border`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <span className={`text-sm font-semibold text-center leading-tight ${cat.color}`}>
                    {cat.label}
                  </span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          PLATFORM FEATURES
          ============================================================ */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for trust and accountability
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every complaint is transparent, tracked, and routed to the accountable authority.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {FEATURES.map(f => (
              <motion.div key={f.title} variants={fadeInUp}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex gap-4 hover:shadow-md hover:border-gray-300 hover:-translate-y-1 transition-all duration-200">
                  <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section className="py-24 px-4 bg-emerald-800 border-t border-emerald-900 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-700/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/40 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex w-16 h-16 bg-emerald-700/50 rounded-2xl border border-emerald-600 items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-emerald-200" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            See a problem in your city?
          </h2>
          <p className="text-emerald-100 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            It takes under 2 minutes to submit a complaint. No paperwork, no phone queues —
            just a photo and your location.
          </p>
          <button
            onClick={() => navigate(user ? '/submit' : '/signup')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 text-emerald-800 font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Camera className="w-5 h-5" />
            <span>Report an Issue Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {!user && (
            <p className="mt-6 text-sm text-emerald-200/70">
              Free account required.{' '}
              <button onClick={() => navigate('/login')} className="text-white hover:underline font-semibold">
                Already have one? Sign in
              </button>
            </p>
          )}
        </motion.div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="py-8 px-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="font-medium text-gray-600">Civic Reporter</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/dashboard')} className="hover:text-gray-700 transition-colors">Dashboard</button>
            <button onClick={() => navigate('/login')} className="hover:text-gray-700 transition-colors">Login</button>
            <button onClick={() => navigate('/authority/login')} className="hover:text-gray-700 transition-colors">Authority Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

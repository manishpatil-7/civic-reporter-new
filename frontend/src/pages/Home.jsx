import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Map, FileText, Camera, Sparkles, Zap, Shield, Activity } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';
import { useAuth } from '../context/AuthContext';

// Typewriter Effect Hook
const useTypewriter = (text, speed = 50, delay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1000);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, showCursor };
};

// Floating 3D Element Component
const FloatingElement = ({ children, delay = 0, duration = 6, yOffset = 20 }) => (
  <motion.div
    animate={{
      y: [0, -yOffset, 0],
      rotateY: [0, 5, 0, -5, 0],
      rotateX: [0, -3, 0, 3, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
    style={{ transformStyle: 'preserve-3d' }}
  >
    {children}
  </motion.div>
);

// Parallax Wrapper
const ParallaxSection = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
};

const Home = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  const { displayText: titleText } = useTypewriter('Report Civic Issues', 60, 500);
  const { displayText: subtitleText, showCursor } = useTypewriter('with AI Precision', 60, 1200);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const stats = [
    { value: '10K+', label: 'Issues Reported', icon: Activity },
    { value: '85%', label: 'Resolution Rate', icon: Zap },
    { value: '50+', label: 'Cities Covered', icon: Map },
  ];

  return (
    <div className="min-h-screen pt-24 font-sans relative overflow-x-hidden">
      {/* 3D Floating Elements - Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingElement delay={0} duration={8} yOffset={30}>
          <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-sm border border-white/10"
            style={{ transform: 'rotateY(15deg) rotateX(-10deg)' }} />
        </FloatingElement>

        <FloatingElement delay={2} duration={10} yOffset={25}>
          <div className="absolute top-[40%] left-[5%] w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-sm border border-white/10"
            style={{ transform: 'rotateY(-20deg) rotateX(15deg)' }} />
        </FloatingElement>

        <FloatingElement delay={1} duration={7} yOffset={35}>
          <div className="absolute bottom-[30%] right-[15%] w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl blur-sm border border-white/10"
            style={{ transform: 'rotateY(25deg) rotateX(-5deg)' }} />
        </FloatingElement>

        {/* Glowing orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-[15%] left-[20%] w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[20%] right-[25%] w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Hero Section with Parallax */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative min-h-[90vh] flex items-center"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-6 text-center relative z-10"
        >
          {/* Badge with Glow */}
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <motion.span
              className="glass-premium px-5 py-2.5 text-sm font-semibold rounded-full text-blue-300 border border-blue-500/30 inline-flex items-center gap-2 glow-blue"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              AI-Powered Civic Reporting
            </motion.span>
          </motion.div>

          {/* Main Heading with Typewriter */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight">
              <span className="block mb-2">{titleText}</span>
              <span className="block text-gradient relative inline-block">
                {subtitleText}
                {showCursor && (
                  <motion.span
                    className="absolute -right-1 top-0 w-1 h-full bg-blue-500"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                )}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Empowering citizens to build better cities.
            <span className="text-blue-300">Snap a photo</span> of civic issues,
            and our <span className="text-purple-300">AI</span> will automatically
            classify, localize, and analyze them.
          </motion.p>

          {/* CTA Buttons with Magnetic Effect */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            {!isAdmin && (
              <MagneticButton strength={0.2}>
                <motion.button
                  onClick={() => navigate('/submit')}
                  className="relative group px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-white font-bold rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-blue-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative flex items-center gap-3">
                    <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Report an Issue</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </MagneticButton>
            )}

            <MagneticButton strength={0.15}>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="group px-8 py-4 glass-premium text-white font-bold rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-blue-400" />
                  <span>View Dashboard</span>
                </span>
              </motion.button>
            </MagneticButton>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + index * 0.2 }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-3xl md:text-4xl font-bold text-gradient stat-counter">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section with Parallax */}
      <ParallaxSection offset={30}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-blue-400 font-semibold text-sm tracking-wider uppercase">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              Three Steps to <span className="text-gradient">Better Cities</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                step: '01',
                title: 'Snap a Photo',
                desc: 'Capture any civic issue clearly. Our AI recognizes potholes, broken lights, garbage, and more.',
                color: 'blue',
                delay: 0
              },
              {
                icon: FileText,
                step: '02',
                title: 'AI Auto-Fills',
                desc: 'Advanced AI generates formal complaints, extracts severity levels, and translates to local languages.',
                color: 'purple',
                delay: 0.2
              },
              {
                icon: Shield,
                step: '03',
                title: 'Track & Resolve',
                desc: 'Monitor progress on the live city map, upvote urgent issues, and celebrate resolutions.',
                color: 'green',
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: feature.delay }}
              >
                <TiltCard className="h-full" tiltAmount={8}>
                  <div className="glass-premium p-8 rounded-3xl h-full relative overflow-hidden group hover-glow">
                    {/* Step Number */}
                    <div className={`absolute top-4 right-4 text-6xl font-bold text-${feature.color}-500/10`}>
                      {feature.step}
                    </div>

                    {/* Icon with Glow */}
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/20 flex items-center justify-center mb-6 glow-${feature.color}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <feature.icon className={`w-8 h-8 text-${feature.color}-400`} />
                    </motion.div>

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-gradient transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>

                    {/* Hover Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxSection>

      {/* Tech Stack / Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="glass-premium rounded-3xl p-8 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Powered by <span className="text-gradient">Cutting-Edge AI</span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Our platform leverages state-of-the-art machine learning models
                to automatically detect, classify, and prioritize civic issues
                with unprecedented accuracy.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Computer Vision', desc: 'YOLO-based object detection', icon: Sparkles },
                  { label: 'Natural Language', desc: 'GPT-powered letter generation', icon: FileText },
                  { label: 'Smart Detection', desc: 'Geolocation & duplicate checking', icon: Zap },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Animated Tech Visualization */}
            <div className="relative h-80 md:h-96">
              <FloatingElement delay={0} duration={8}>
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl border border-white/10 backdrop-blur-sm"
                  style={{ transform: 'translate(-50%, -50%) rotateY(15deg) rotateX(-10deg)' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-16 h-16 text-blue-400" />
                  </div>
                </motion.div>
              </FloatingElement>

              {/* Orbiting Elements */}
              {[0, 120, 240].map((deg, i) => (
                <motion.div
                  key={deg}
                  className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full"
                  animate={{
                    x: [0, Math.cos((deg * Math.PI) / 180) * 120, 0],
                    y: [0, Math.sin((deg * Math.PI) / 180) * 120, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear"
                  }}
                  style={{ translateX: '-50%', translateY: '-50%' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;

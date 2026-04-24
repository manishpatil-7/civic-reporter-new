import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOTP, verifyOTP } from '../services/api';
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff, Zap, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import MagneticButton from '../components/MagneticButton';

const FloatingBlob = ({ color, size, top, left, delay, duration }) => (
  <motion.div
    className={`absolute rounded-full blur-[80px] opacity-30 pointer-events-none ${color}`}
    style={{ width: size, height: size, top, left }}
    animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0], scale: [1, 1.1, 0.95, 1] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;
    return score;
  };
  const strength = getStrength(password);
  const levels = [
    { label: 'Weak', color: 'bg-red-500', width: '25%' },
    { label: 'Fair', color: 'bg-orange-500', width: '50%' },
    { label: 'Good', color: 'bg-yellow-500', width: '75%' },
    { label: 'Strong', color: 'bg-green-500', width: '100%' },
  ];
  if (password.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Password Strength</span>
        <span className={`text-xs font-medium ${strength === 0 ? 'text-red-400' : strength === 1 ? 'text-orange-400' : strength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
          {levels[strength]?.label || 'Weak'}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${levels[strength]?.color || 'bg-red-500'}`} initial={{ width: 0 }} animate={{ width: levels[strength]?.width || '25%' }} transition={{ duration: 0.3 }} />
      </div>
      <p className="text-xs text-gray-500 mt-1">{strength < 2 && 'Use 8+ chars with uppercase, numbers & symbols'}</p>
    </motion.div>
  );
};

const AnimatedInput = ({ type, value, onChange, label, icon: Icon, showToggle, onToggle, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  return (
    <div className="relative">
      <motion.label className="absolute left-11 text-sm font-medium pointer-events-none z-10 bg-[#0B0F19] px-1" initial={false}
        animate={{ y: isFocused || hasValue ? -28 : 12, scale: isFocused || hasValue ? 0.85 : 1, color: isFocused ? '#a855f7' : '#9ca3af' }}
        transition={{ duration: 0.2 }}>{label}</motion.label>
      <motion.div className="relative" animate={{ boxShadow: isFocused ? '0 0 0 3px rgba(168, 85, 247, 0.2), 0 0 20px rgba(168, 85, 247, 0.1)' : '0 0 0 0px rgba(168, 85, 247, 0)' }} style={{ borderRadius: '1rem' }}>
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-purple-400' : 'text-gray-500'}`} />
        <input type={type} value={value} onChange={onChange} disabled={disabled}
          onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-transparent focus:outline-none focus:border-purple-500/50 transition-all disabled:opacity-50" />
        {showToggle && (
          <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {type === 'password' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </motion.div>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP states
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verify
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Validate form & send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setOtpSending(true);
    try {
      await sendOTP(email, name);
      toast.success('OTP sent to your email! 📧');
      setStep(2);
      setCountdown(300); // 5 min
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  // Handle OTP input with auto-advance
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Step 2: Verify OTP then create account
  const handleVerifyAndSignup = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) return setError('Please enter the complete 6-digit OTP.');

    setError('');
    setOtpVerifying(true);
    try {
      const verifyRes = await verifyOTP(email, otpString);
      if (!verifyRes.data.verified) {
        setError('Invalid OTP. Please try again.');
        setOtpVerifying(false);
        return;
      }
      // OTP verified — now create Firebase account
      await signup(name, email, password);
      toast.success('Account created successfully! 🚀');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.code;
      const messages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      setError(messages[msg] || msg || 'Signup failed. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtpSending(true);
    setError('');
    try {
      await sendOTP(email, name);
      toast.success('New OTP sent! 📧');
      setCountdown(300);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center relative overflow-hidden">
      <FloatingBlob color="bg-purple-600" size={300} top="10%" left="-10%" delay={0} duration={15} />
      <FloatingBlob color="bg-blue-600" size={250} top="60%" left="-5%" delay={2} duration={18} />
      <FloatingBlob color="bg-pink-600" size={200} top="-5%" left="40%" delay={4} duration={12} />
      <FloatingBlob color="bg-cyan-600" size={180} top="70%" left="80%" delay={1} duration={20} />

      <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="glass-premium p-8 md:p-12 rounded-3xl w-full max-w-md relative z-10 border border-white/10">
        <div className="relative z-10">

          <AnimatePresence mode="wait">
            {/* ===================== STEP 1: REGISTRATION FORM ===================== */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                {/* Header */}
                <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <motion.div className="inline-flex p-4 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl mb-6 relative" whileHover={{ scale: 1.05, rotate: -5 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl" />
                    <UserPlus className="w-8 h-8 text-purple-400 relative z-10" />
                  </motion.div>
                  <h1 className="text-4xl font-extrabold mb-2">Create <span className="text-gradient">Account</span></h1>
                  <p className="text-gray-400 text-sm">Join thousands making their cities better</p>
                </motion.div>

                {/* Error */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0"><AlertCircle className="w-5 h-5 text-red-400" /></div>
                      <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <AnimatedInput type="text" value={name} onChange={(e) => setName(e.target.value)} label="Full Name" icon={User} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <AnimatedInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} label="Email Address" icon={Mail} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <AnimatedInput type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} label="Password" icon={Lock} showToggle onToggle={() => setShowPassword(!showPassword)} />
                    <PasswordStrength password={password} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <MagneticButton strength={0.15} className="w-full">
                      <motion.button type="submit" disabled={otpSending} className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-blue-600" animate={{ backgroundPosition: otpSending ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%' }}
                          transition={{ duration: 3, repeat: otpSending ? Infinity : 0, ease: "linear" }} style={{ backgroundSize: '200% 200%' }} />
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12" initial={{ x: '-200%' }} whileHover={{ x: '200%' }} transition={{ duration: 0.6 }} />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {otpSending ? (
                            <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /><span>Sending OTP...</span></>
                          ) : (
                            <><Mail className="w-5 h-5" /><span>Send Verification OTP</span></>
                          )}
                        </span>
                      </motion.button>
                    </MagneticButton>
                  </motion.div>
                </form>

                {/* Footer */}
                <motion.div className="mt-8 pt-6 border-t border-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <p className="text-center text-sm text-gray-400">Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors relative group">Sign in
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* ===================== STEP 2: OTP VERIFICATION ===================== */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div className="inline-flex p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl mb-6 relative"
                    animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl" />
                    <ShieldCheck className="w-8 h-8 text-green-400 relative z-10" />
                  </motion.div>
                  <h1 className="text-3xl font-extrabold mb-2 text-white">Verify Your <span className="text-gradient">Email</span></h1>
                  <p className="text-gray-400 text-sm">We sent a 6-digit code to</p>
                  <p className="text-purple-400 font-semibold text-sm mt-1">{email}</p>
                </div>

                {/* Error */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* OTP Input Grid */}
                <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <motion.input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-white/5 text-white focus:outline-none transition-all ${
                        digit ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10' : 'border-white/10 focus:border-purple-500/50'
                      }`}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center mb-6">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-500">Code expires in <span className="text-purple-400 font-bold">{formatTime(countdown)}</span></p>
                  ) : (
                    <p className="text-xs text-red-400 font-medium">OTP expired!</p>
                  )}
                </div>

                {/* Verify Button */}
                <MagneticButton strength={0.15} className="w-full">
                  <motion.button onClick={handleVerifyAndSignup} disabled={otpVerifying || otp.join('').length !== 6}
                    className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {otpVerifying ? (
                        <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /><span>Verifying...</span></>
                      ) : (
                        <><ShieldCheck className="w-5 h-5" /><span>Verify & Create Account</span></>
                      )}
                    </span>
                  </motion.button>
                </MagneticButton>

                {/* Resend & Back */}
                <div className="flex items-center justify-between mt-6">
                  <button onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handleResendOTP} disabled={countdown > 240 || otpSending}
                    className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    <RefreshCw className={`w-4 h-4 ${otpSending ? 'animate-spin' : ''}`} /> Resend OTP
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

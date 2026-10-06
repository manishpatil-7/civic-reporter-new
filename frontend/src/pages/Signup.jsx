import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOTP, verifyOTP } from '../services/api';
import {
  UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff,
  ShieldCheck, ArrowLeft, RefreshCw, Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ---- Password Strength ---- */
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
    { label: 'Weak',   color: 'bg-red-500',    width: '25%' },
    { label: 'Fair',   color: 'bg-amber-500',   width: '50%' },
    { label: 'Good',   color: 'bg-yellow-400',  width: '75%' },
    { label: 'Strong', color: 'bg-emerald-500', width: '100%' },
  ];
  if (password.length === 0) return null;
  const level = levels[Math.max(0, strength - 1)] || levels[0];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Password strength</span>
        <span className={`text-xs font-medium ${
          strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-yellow-600' : 'text-emerald-600'
        }`}>{level.label}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${level.color}`}
          initial={{ width: 0 }}
          animate={{ width: level.width }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

/* ---- Signup Component ---- */
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

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setOtpSending(true);
    try {
      await sendOTP(email, name);
      toast.success('OTP sent to your email!');
      setStep(2);
      setCountdown(300);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpSending(false);
    }
  };

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
      await signup(name, email, password);
      toast.success('Account created successfully!');
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

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setOtpSending(true);
    setError('');
    try {
      await sendOTP(email, name);
      toast.success('New OTP sent!');
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
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Value Prop & Social Proof */}
      <div className="hidden lg:flex w-1/2 bg-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-700/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-700" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Civic Reporter</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              Real impact. <br /> Better neighborhoods.
            </h1>
            <p className="text-emerald-100 text-lg max-w-md leading-relaxed">
              Report civic issues instantly, track their progress, and build a better community together with transparency and accountability.
            </p>
          </motion.div>
        </div>

        {/* Trust Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">Join Us</span>
              </div>
              <p className="text-emerald-100 text-sm flex items-center gap-1">
                 Trusted by Citizens
              </p>
            </div>
          </div>
          <p className="text-emerald-50 text-sm italic">
            "We are making our city better, one report at a time."
          </p>
        </motion.div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-emerald-100 rounded-2xl items-center justify-center mb-4">
              {step === 1 ? (
                <Leaf className="w-7 h-7 text-emerald-600" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {step === 1 ? 'Create account' : 'Verify your email'}
            </h1>
            <p className="text-sm text-gray-500">
              {step === 1
                ? 'Join Civic Reporter — help make your city better'
                : `Enter the 6-digit OTP sent to ${email}`}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <button
                type="submit"
                disabled={otpSending}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {otpSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Continue with OTP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Enter the 6-digit code we sent to{' '}
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-11 h-12 text-center text-lg font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Countdown */}
              {countdown > 0 && (
                <p className="text-center text-sm text-gray-500">
                  Resend OTP in <span className="font-semibold text-emerald-600">{formatTime(countdown)}</span>
                </p>
              )}

              {countdown === 0 && (
                <button
                  onClick={handleResendOTP}
                  disabled={otpSending}
                  className="flex items-center justify-center gap-2 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resend OTP</span>
                </button>
              )}

              <button
                onClick={handleVerifyAndSignup}
                disabled={otpVerifying || otp.join('').length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {otpVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Create Account</span>
                  </>
                )}
              </button>

              <button
                onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                className="flex items-center justify-center gap-1.5 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to registration</span>
              </button>
            </div>
          )}

          {/* Footer */}
          {step === 1 && (
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default Signup;

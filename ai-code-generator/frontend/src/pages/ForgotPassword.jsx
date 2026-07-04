import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  // Step 1: Email, Step 2: OTP, Step 3: New Password
  const [step, setStep] = useState(1);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { requestPasswordReset, verifyPasswordResetOtp, resetPassword, resendPasswordResetOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Timer logic for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    
    setIsLoading(true);
    const success = await requestPasswordReset(email);
    setIsLoading(false);
    
    if (success) {
      setStep(2);
      setCountdown(60);
      // Wait for React to render the OTP inputs
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return toast.error('Please enter a 6-digit OTP');
    
    setIsLoading(true);
    const success = await verifyPasswordResetOtp(email, otpValue);
    setIsLoading(false);
    
    if (success) {
      setStep(3);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    
    const otpValue = otp.join('');
    setIsLoading(true);
    const success = await resetPassword(email, otpValue, password);
    setIsLoading(false);
    
    if (success) {
      toast.success('Password successfully changed. Please log in.');
      navigate('/login');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    const success = await resendPasswordResetOtp(email);
    setIsLoading(false);
    
    if (success) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      if (pastedData[i] && !isNaN(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    
    const lastFilledIndex = pastedData.length > 5 ? 5 : pastedData.length - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-transparent">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 w-full lg:w-1/2 mx-auto lg:mx-0">
        <div className="mx-auto w-full max-w-sm lg:w-96 relative min-h-[400px]">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Forgot Password</h2>
                <p className="mt-2 text-sm text-gray-500 mb-8">
                  Enter your email address and we'll send you a code to reset your password.
                </p>

                <div className="mt-8">
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          className="input-field pl-10 bg-white border-gray-200 shadow-sm py-2.5 w-full rounded-xl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full btn-primary py-3 text-base flex justify-center items-center gap-2 shadow-lg shadow-primary/20 group rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : (
                          <>Send OTP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </div>
                  </form>

                  <p className="mt-8 text-center text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
                      Back to login
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-6 mx-auto lg:mx-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center lg:text-left">Verification Code</h2>
                <p className="mt-2 text-sm text-gray-500 mb-8 text-center lg:text-left">
                  We sent a 6-digit verification code to <span className="font-semibold text-gray-800">{email}</span>.
                </p>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none bg-white shadow-sm transition-colors text-gray-900"
                      />
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full btn-primary py-3 text-base flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-sm font-semibold text-primary hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-6 mx-auto lg:mx-0">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center lg:text-left">Set New Password</h2>
                <p className="mt-2 text-sm text-gray-500 mb-8 text-center lg:text-left">
                  Please enter your new password below.
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        className="input-field pl-10 bg-white border-gray-200 shadow-sm py-2.5 w-full rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        className="input-field pl-10 bg-white border-gray-200 shadow-sm py-2.5 w-full rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full btn-primary py-3 text-base flex justify-center items-center gap-2 shadow-lg shadow-primary/20 group rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Right side styling - same as login */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-secondary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-[100px]" />
        
        <div className="h-full flex flex-col justify-center px-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Secure Recovery</span>
            </div>
            
            <h1 className="text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Regain access to your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI workspace</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              We'll send a one-time verification code to your registered email address to securely reset your password.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

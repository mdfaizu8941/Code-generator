import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, Mail, Lock, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  // Step 1: Credentials, Step 2: OTP
  const [step, setStep] = useState(1);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { login, requestLoginOtp } = useContext(AuthContext);
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

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result?.requiresOtp) {
      setStep(2);
      setCountdown(60);
    } else if (result?.success) {
      navigate('/dashboard');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;
    
    setIsLoading(true);
    const result = await login(email, password, otpValue);
    setIsLoading(false);
    
    if (result?.success) {
      navigate('/dashboard');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    const success = await requestLoginOtp(email, password);
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
    // Take only the last character if multiple are entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
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
    
    // Focus last filled input
    const lastFilledIndex = pastedData.length > 5 ? 5 : pastedData.length - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#FAFAFA]">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 w-full lg:w-1/2 mx-auto lg:mx-0">
        <div className="mx-auto w-full max-w-sm lg:w-96 relative min-h-[400px]">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 dark:from-gray-100 to-gray-600 dark:to-gray-400">CodeGen AI</span>
          </div>
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 mb-8">
                  Please enter your details to sign in.
                </p>

                <div className="mt-8">
                  <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1.5">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type="email"
                          required
                          className="input-field pl-10 bg-white dark:bg-gray-900 dark:bg-white border-gray-200 dark:border-gray-800 shadow-sm py-2.5"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-1.5">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                          type="password"
                          required
                          className="input-field pl-10 bg-white dark:bg-gray-900 dark:bg-white border-gray-200 dark:border-gray-800 shadow-sm py-2.5"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 cursor-pointer">
                          Remember for 30 days
                        </label>
                      </div>
                      <div className="text-sm">
                        <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary-hover">
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full btn-primary py-3 text-base flex justify-center items-center gap-2 shadow-lg shadow-primary/20 group"
                      >
                        {isLoading ? 'Checking credentials...' : (
                          <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </div>
                  </form>

                  <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
                      Sign up
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6 mx-auto lg:mx-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight text-center lg:text-left">Two-Factor Authentication</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 mb-8 text-center lg:text-left">
                  We sent a 6-digit verification code to <span className="font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-700">{email}</span>.
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
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-primary focus:ring-0 bg-white dark:bg-gray-900 dark:bg-white shadow-sm transition-colors text-gray-900 dark:text-white"
                      />
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full btn-primary py-3 text-base flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>

                <div className="mt-8 text-center flex flex-col items-center gap-3 text-sm">
                  <p className="text-gray-500 dark:text-gray-500">Didn't receive the code?</p>
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    className="flex items-center gap-2 font-semibold text-primary hover:text-primary-hover disabled:text-gray-400 dark:text-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading && countdown === 0 ? 'animate-spin' : ''}`} />
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Click to resend'}
                  </button>
                  
                  <button
                    onClick={() => setStep(1)}
                    className="mt-4 text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-200 dark:text-gray-700 underline transition-colors"
                  >
                    Return to Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Right Side Image/Hero for Desktop */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gray-900 dark:bg-white">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-gray-900 dark:from-gray-100 to-black p-12 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-gray-900 dark:bg-white/10 border border-white/20 text-sm font-medium text-blue-200 mb-6 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
              AI Code Generation Engine v2.0
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Build software faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Intelligent Automation</span>
            </h1>
            <p className="text-xl text-gray-400 dark:text-gray-500 mb-12 max-w-xl leading-relaxed">
              Generate entire projects, optimize algorithms, and scaffold architecture in seconds. Your premium AI coding assistant is waiting.
            </p>
            
            <div className="glass-panel rounded-2xl p-6 bg-white dark:bg-gray-900 dark:bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">server.js</div>
              </div>
              <pre className="text-sm text-gray-300 dark:text-gray-600 font-mono"><code>
<span className="text-purple-400">const</span> <span className="text-blue-300">express</span> = require(<span className="text-green-300">'express'</span>);{'\n'}
<span className="text-purple-400">const</span> <span className="text-blue-300">app</span> = <span className="text-yellow-200">express</span>();{'\n'}
{'\n'}
<span className="text-blue-300">app</span>.<span className="text-yellow-200">get</span>(<span className="text-green-300">'/api/generate'</span>, <span className="text-purple-400">async</span> (req, res) {`=>`} {'{\n'}
  <span className="text-gray-500 dark:text-gray-500">  // Your AI generated code comes alive here</span>{'\n'}
  <span className="text-purple-400">  const</span> result = <span className="text-purple-400">await</span> <span className="text-blue-300">ai</span>.<span className="text-yellow-200">generate</span>(req.body);{'\n'}
  <span className="text-blue-300">  res</span>.<span className="text-yellow-200">json</span>(result);{'\n'}
{'}'});
              </code></pre>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;

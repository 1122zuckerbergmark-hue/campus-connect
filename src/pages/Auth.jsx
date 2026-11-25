import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false); // For error animation
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    if (isForgot) {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) return setError(error.message);
      setMessage('Recovery link sent! Check your email inbox.');
      return;
    }

    const { error } = isSignUp
      ? await signUp(email, password, fullName)
      : await signIn(email, password);
      
    setLoading(false);
    if (error) {
      setError(error.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    navigate('/dashboard');
  };

  const shakeVariants = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } },
    static: { x: 0 }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-bg">
      
      {/* Dynamic Ambient Background Orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet/20 rounded-full blur-[150px] -z-10" 
      />

      {/* Main Card Container */}
      <motion.div 
        variants={shakeVariants}
        animate={shake ? "shake" : "static"}
        className="w-full max-w-5xl bg-surface/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row relative min-h-[600px] z-10"
      >
        
        {/* LEFT SIDE: FORM SECTION */}
        <div className={`w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center transition-all duration-700 relative z-20 bg-surface/80 md:bg-transparent ${isSignUp ? 'md:translate-x-full' : 'md:translate-x-0'}`}>
          <AnimatePresence mode="wait">
            
            {/* FORGOT PASSWORD VIEW */}
            {isForgot ? (
              <motion.div key="forgot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-10 text-center md:text-left">
                  <h2 className="font-display text-4xl font-bold mb-2 text-white">Reset Password</h2>
                  <p className="text-muted text-sm">Enter your email to recover access to your account.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                    <input className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  {error && <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 p-3 rounded-xl">{error}</div>}
                  {message && <div className="text-green-400 text-sm text-center bg-green-400/10 border border-green-400/20 p-3 rounded-xl">{message}</div>}
                  
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2 text-lg">
                    {loading ? <Loader2 className="animate-spin mx-auto" size={22} /> : 'Send Reset Link'}
                  </button>
                  <button type="button" onClick={() => { setIsForgot(false); setError(''); setMessage(''); }} className="text-sm text-muted hover:text-white mt-2 transition-colors">
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            ) : (
              
              /* MAIN LOGIN / SIGNUP FORM */
              <motion.div key={isSignUp ? 'signup' : 'login'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-10 text-center md:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-violet p-[1px] mb-6 mx-auto md:mx-0 shadow-[0_0_30px_rgba(94,234,212,0.2)]">
                    <div className="w-full h-full bg-bg rounded-2xl flex items-center justify-center">
                      <GraduationCap className="text-teal" size={28} />
                    </div>
                  </div>
                  <h2 className="font-display text-4xl font-bold mb-2 text-white">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-muted text-sm">
                    {isSignUp ? 'Join the ultimate network for students.' : 'Sign in to access your dashboard.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {isSignUp && (
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                      <input className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                  )}
                  
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                    <input className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                    <input 
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-all" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required minLength={6} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-teal hover:text-teal/80 transition-colors font-semibold">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {isSignUp && (
                    <div className="flex items-start gap-2 mt-2">
                      <input type="checkbox" required className="mt-1 accent-teal" />
                      <p className="text-xs text-muted leading-tight">I agree to the <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.</p>
                    </div>
                  )}

                  {error && <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 p-3 rounded-xl">{error}</div>}

                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2 flex justify-center items-center gap-2 text-lg group">
                    {loading ? <Loader2 className="animate-spin" size={22} /> : <>{isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                  </button>
                </form>

                {/* Mobile Toggle Button */}
                <div className="mt-8 text-center md:hidden">
                  <p className="text-muted text-sm">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </p>
                  <button onClick={() => setIsSignUp(!isSignUp)} className="text-teal font-bold mt-1 text-lg">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE: SLIDING OVERLAY PANEL */}
        <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none z-10">
           <motion.div 
             animate={{ x: isSignUp ? '-100%' : '0%' }}
             transition={{ type: 'spring', stiffness: 200, damping: 25 }}
             className="w-[200%] h-full flex"
           >
             {/* RIGHT OVERLAY (Shows when NOT signed up) */}
             <div className="w-1/2 h-full relative flex flex-col items-center justify-center p-12 text-center pointer-events-auto overflow-hidden border-l border-white/10">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} className="absolute -top-20 -right-20 w-80 h-80 bg-teal/30 rounded-full blur-[80px]" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet/30 rounded-full blur-[80px]" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <ShieldCheck className="text-teal" size={32} />
                  </div>
                  <h3 className="font-display text-4xl font-bold mb-4 text-white">Hello, Friend!</h3>
                  <p className="text-gray-300 mb-8 max-w-xs mx-auto text-lg">Enter your personal details and start your journey with us.</p>
                  <button onClick={() => setIsSignUp(true)} className="border-2 border-white/50 hover:border-teal hover:text-teal text-white px-10 py-3 rounded-full font-bold transition-all duration-300 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(94,234,212,0.3)]">
                    Create Account
                  </button>
                </div>
             </div>

             {/* LEFT OVERLAY (Shows when signed up) */}
             <div className="w-1/2 h-full relative flex flex-col items-center justify-center p-12 text-center pointer-events-auto overflow-hidden border-l border-white/10">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 7, repeat: Infinity }} className="absolute -top-20 -left-20 w-80 h-80 bg-violet/30 rounded-full blur-[80px]" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity }} className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal/30 rounded-full blur-[80px]" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
                    <User className="text-violet" size={32} />
                  </div>
                  <h3 className="font-display text-4xl font-bold mb-4 text-white">Welcome Back!</h3>
                  <p className="text-gray-300 mb-8 max-w-xs mx-auto text-lg">To keep connected with us please login with your personal info.</p>
                  <button onClick={() => setIsSignUp(false)} className="border-2 border-white/50 hover:border-violet hover:text-violet text-white px-10 py-3 rounded-full font-bold transition-all duration-300 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                    Sign In
                  </button>
                </div>
             </div>
           </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
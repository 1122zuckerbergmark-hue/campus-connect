import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2, ArrowLeft, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    if (view === 'forgot') {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) return setError(error.message);
      setMessage('Recovery link sent! Check your email inbox.');
      return;
    }

    const { error } = view === 'signup'
      ? await signUp(email, password, fullName)
      : await signIn(email, password);
      
    setLoading(false);
    if (error) return setError(error.message);
    navigate('/dashboard');
  };

  const switchView = (newView) => {
    setView(newView);
    setError('');
    setMessage('');
    setPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 relative overflow-hidden py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/15 rounded-full blur-[120px] -z-10 transition-all duration-700" />
      {view === 'forgot' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/15 rounded-full blur-[120px] -z-10 transition-all duration-700" />}
      
      <div className="glass rounded-3xl p-8 md:p-12 w-full max-w-md relative z-10 overflow-hidden">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: view === 'forgot' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: view === 'forgot' ? -20 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center mb-8 text-center">
              <div className={`w-14 h-14 rounded-2xl p-[1px] mb-6 shadow-[0_0_30px_rgba(94,234,212,0.3)] transition-colors duration-500 ${view === 'forgot' ? 'bg-gradient-to-br from-violet to-teal' : 'bg-gradient-to-br from-teal to-violet'}`}>
                <div className="w-full h-full bg-bg rounded-2xl flex items-center justify-center">
                  {view === 'forgot' ? <Key className="text-violet" size={28} /> : <GraduationCap className="text-teal" size={28} />}
                </div>
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">
                {view === 'forgot' ? 'Reset Password' : view === 'signup' ? 'Create an account' : 'Welcome back'}
              </h1>
              <p className="text-muted text-sm">
                {view === 'forgot' ? 'Enter your email to recover access.' : view === 'signup' ? 'Join the ultimate student network.' : 'Sign in to access your materials.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {view === 'signup' && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                  <input className="input pl-12" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                <input className="input pl-12" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              {view !== 'forgot' && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-teal transition-colors" size={18} />
                  <input className="input pl-12" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
              )}

              {view === 'login' && (
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => switchView('forgot')} className="text-xs text-teal hover:text-teal/80 transition-colors font-semibold">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-center">{error}</motion.div>}
              {message && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl p-3 text-center">{message}</motion.div>}

              <button type="submit" disabled={loading} className="btn-primary mt-4 w-full flex justify-center items-center gap-2 group py-4">
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {view === 'forgot' ? 'Send Reset Link' : view === 'signup' ? 'Create Account' : 'Sign In'} 
                    {view !== 'forgot' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-muted text-sm mt-8">
              {view === 'forgot' ? (
                <button onClick={() => switchView('login')} className="text-teal font-semibold hover:underline flex items-center justify-center gap-2 mx-auto">
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
              ) : (
                <>
                  {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={() => switchView(view === 'signup' ? 'login' : 'signup')} className="text-teal font-semibold hover:underline ml-1">
                    {view === 'signup' ? 'Sign in' : 'Sign up free'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
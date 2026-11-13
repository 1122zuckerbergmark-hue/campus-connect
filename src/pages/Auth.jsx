import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { error } = isSignUp
      ? await signUp(email, password, fullName)
      : await signIn(email, password);
      
    setLoading(false);
    if (error) return setError(error.message);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/15 rounded-full blur-[120px] -z-10" />
      
      <div className="glass rounded-3xl p-8 md:p-12 w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal to-violet p-[1px] mb-6 shadow-[0_0_30px_rgba(94,234,212,0.3)]">
            <div className="w-full h-full bg-bg rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-teal" size={28} />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-muted text-sm">
            {isSignUp ? 'Join the ultimate student network.' : 'Sign in to access your materials.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                className="input pl-12" 
                placeholder="Full name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              className="input pl-12" 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              className="input pl-12" 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6} 
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full flex justify-center items-center gap-2 group">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'} 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center text-muted text-sm mt-8">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-teal font-semibold hover:underline ml-1"
          >
            {isSignUp ? 'Sign in' : 'Sign up free'}
          </button>
        </div>

      </div>
    </div>
  );
}
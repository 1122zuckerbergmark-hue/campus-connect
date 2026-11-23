import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast('Passwords do not match', 'error');
    if (password.length < 6) return toast('Password must be at least 6 characters', 'error');

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast(error.message, 'error');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 3000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet/15 rounded-full blur-[120px] -z-10" />
      
      <div className="glass rounded-3xl p-8 md:p-12 w-full max-w-md relative z-10">
        
        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2 text-white">Password Updated!</h2>
            <p className="text-muted text-sm mb-6">Your account is now secure. Redirecting you to login...</p>
            <Loader2 className="animate-spin text-teal mx-auto" size={24} />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-violet/10 border border-violet/20 flex items-center justify-center mx-auto mb-6 text-violet shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                <ShieldCheck size={28} />
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">Set New Password</h1>
              <p className="text-muted text-sm">Create a strong password to secure your account.</p>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-violet transition-colors" size={18} />
                <input className="input pl-12 focus:border-violet focus:ring-violet/20" type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-violet transition-colors" size={18} />
                <input className="input pl-12 focus:border-violet focus:ring-violet/20" type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-4 w-full flex justify-center items-center gap-2 py-4 bg-gradient-to-r from-violet to-teal">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><span>Update Password</span> <ArrowRight size={18} /></>}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
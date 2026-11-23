import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Clock, BookOpen, DollarSign, 
  ArrowRight, ShieldCheck, Wallet, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'tutor'
  const [loading, setLoading] = useState(true);
  
  const [studentBookings, setStudentBookings] = useState([]);
  const [tutorBookings, setTutorBookings] = useState([]);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      // 1. Fetch Student Bookings (Sessions I paid for)
      const { data: sBookings } = await supabase
        .from('bookings')
        .select('*, tutor_profiles(*, profiles(full_name, university))')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      setStudentBookings(sBookings || []);

      // 2. Fetch My Tutor Profile (If I am a tutor)
      const { data: tProfile } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (tProfile) {
        setTutorProfile(tProfile);
        
        // 3. Fetch Tutor Bookings (Sessions students booked with me)
        const { data: tBookings } = await supabase
          .from('bookings')
          .select('*, profiles(full_name, university)')
          .eq('tutor_id', tProfile.id)
          .order('created_at', { ascending: false });
          
        setTutorBookings(tBookings || []);
        
        // 4. Calculate Earnings (Fixed the unused variable 'b' here)
        const earnings = (tBookings || [])
          .filter(b => b.status === 'paid')
          .reduce((sum) => sum + (tProfile.rate_per_hour || 0), 0);
        setTotalEarnings(earnings);
      }
      
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const handleWithdraw = () => {
    toast('Withdrawal request sent! Admin will process your MoMo/Bank payout shortly.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-teal" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-6 py-12 min-h-screen"
    >
      {/* HEADER */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal to-violet p-[2px]">
          <div className="w-full h-full bg-bg rounded-full flex items-center justify-center">
            <User className="text-teal" size={32} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold">{profile?.full_name || 'Student'}</h1>
          <p className="text-muted">{profile?.university || 'CampusConnect Member'}</p>
        </div>
        {profile?.is_pro && (
          <div className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-teal/20 text-teal border border-teal/30 shadow-[0_0_15px_rgba(94,234,212,0.2)]">
            <ShieldCheck size={16} /> PRO MEMBER
          </div>
        )}
      </div>

      {/* TABS */}
      {tutorProfile && (
        <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-8 max-w-md">
          <button onClick={() => setActiveTab('student')} className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'student' ? 'bg-teal text-black shadow-lg' : 'text-muted hover:text-white'}`}>
            <BookOpen size={16} /> My Bookings
          </button>
          <button onClick={() => setActiveTab('tutor')} className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'tutor' ? 'bg-violet text-white shadow-lg' : 'text-muted hover:text-white'}`}>
            <DollarSign size={16} /> Tutor Dashboard
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STUDENT VIEW */}
        {activeTab === 'student' && (
          <motion.div key="student" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Your Upcoming Sessions</h2>
            {studentBookings.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-muted">You haven't booked any tutors yet.</div>
            ) : (
              studentBookings.map(b => (
                <div key={b.id} className="glass rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">{b.subject}</h3>
                    <p className="text-sm text-muted flex items-center gap-2">
                      <User size={14} /> Tutor: {b.tutor_profiles?.profiles?.full_name || 'Tutor'}
                    </p>
                    {b.preferred_time && (
                      <p className="text-sm text-muted flex items-center gap-2 mt-1">
                        <Clock size={14} /> {new Date(b.preferred_time).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${b.status === 'paid' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'}`}>
                      {b.status || 'Pending'}
                    </span>
                    <span className="text-sm font-bold text-white">GHS {b.tutor_profiles?.rate_per_hour}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* TUTOR VIEW */}
        {activeTab === 'tutor' && (
          <motion.div key="tutor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            
            {/* EARNINGS CARD */}
            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-violet/10 to-transparent border-violet/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet/20 rounded-full blur-[80px] -z-10" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted font-bold mb-1 flex items-center gap-2"><Wallet size={16}/> Total Escrow Earnings</p>
                  <h2 className="font-display text-5xl font-bold text-white">GHS {totalEarnings}</h2>
                </div>
                <button onClick={handleWithdraw} className="btn-primary flex items-center gap-2 py-3 px-6">
                  Withdraw Funds
                </button>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold mb-4">Incoming Sessions</h2>
            {tutorBookings.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-muted">No students have booked you yet.</div>
            ) : (
              tutorBookings.map(b => (
                <div key={b.id} className="glass rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-violet/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1">{b.subject}</h3>
                    <p className="text-sm text-muted flex items-center gap-2">
                      <User size={14} /> Student: {b.profiles?.full_name || 'Student'}
                    </p>
                    <p className="text-sm text-muted mt-1 italic max-w-md">"{b.message || 'No message'}"</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-green-400/10 text-green-400 border border-green-400/20">
                      Paid
                    </span>
                    <button className="text-sm font-bold text-violet hover:text-violet/80 transition-colors flex items-center gap-1 mt-2">
                      Message <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
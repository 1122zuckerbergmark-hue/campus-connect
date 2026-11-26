import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Clock, BookOpen, DollarSign, ArrowRight, ShieldCheck, Wallet, Loader2, PlayCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(true);
  
  const [studentBookings, setStudentBookings] = useState([]);
  const [tutorBookings, setTutorBookings] = useState([]);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Creator Stats
  const [myMaterials, setMyMaterials] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      // 1. Fetch Student Bookings
      const { data: sBookings } = await supabase.from('bookings').select('*, tutor_profiles(*, profiles(full_name))').eq('student_id', user.id).order('created_at', { ascending: false });
      setStudentBookings(sBookings || []);

      // 2. Fetch Tutor Data
      const { data: tProfile } = await supabase.from('tutor_profiles').select('*').eq('user_id', user.id).single();
      if (tProfile) {
        setTutorProfile(tProfile);
        const { data: tBookings } = await supabase.from('bookings').select('*, profiles(full_name)').eq('tutor_id', tProfile.id).order('created_at', { ascending: false });
        setTutorBookings(tBookings || []);
        const earnings = (tBookings || []).filter(b => b.status === 'paid').reduce((sum) => sum + (tProfile.rate_per_hour || 0), 0);
        setTotalEarnings(earnings);
      }

      // 3. Fetch Creator Stats (Materials & Courses)
      const { data: materials } = await supabase.from('materials').select('*').eq('uploaded_by', user.id).order('created_at', { ascending: false });
      const { data: courses } = await supabase.from('courses').select('*').eq('creator_id', user.id).order('created_at', { ascending: false });
      
      setMyMaterials(materials || []);
      setMyCourses(courses || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const handleWithdraw = () => {
    toast('Withdrawal request sent! Admin will process your payout shortly.', 'success');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-teal" size={40} /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
      
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
          <div className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-teal/20 text-teal border border-teal/30">
            <ShieldCheck size={16} /> PRO MEMBER
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-8 max-w-lg overflow-x-auto custom-scrollbar">
        <button onClick={() => setActiveTab('student')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg flex items-center justify-center gap-2 whitespace-nowrap transition-all ${activeTab === 'student' ? 'bg-teal text-black shadow-lg' : 'text-muted hover:text-text'}`}>
          <BookOpen size={16} /> Bookings
        </button>
        {tutorProfile && (
          <button onClick={() => setActiveTab('tutor')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg flex items-center justify-center gap-2 whitespace-nowrap transition-all ${activeTab === 'tutor' ? 'bg-violet text-white shadow-lg' : 'text-muted hover:text-text'}`}>
            <DollarSign size={16} /> Earnings
          </button>
        )}
        <button onClick={() => setActiveTab('creator')} className={`flex-1 py-3 px-4 text-sm font-bold rounded-lg flex items-center justify-center gap-2 whitespace-nowrap transition-all ${activeTab === 'creator' ? 'bg-yellow-400 text-black shadow-lg' : 'text-muted hover:text-text'}`}>
          <PlayCircle size={16} /> Creator Hub
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* STUDENT BOOKINGS */}
        {activeTab === 'student' && (
          <motion.div key="student" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            <h2 className="font-display text-2xl font-bold mb-4">Your Upcoming Sessions</h2>
            {studentBookings.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-muted">You haven't booked any tutors yet.</div>
            ) : (
              studentBookings.map(b => (
                <div key={b.id} className="glass rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-text mb-1">{b.subject}</h3>
                    <p className="text-sm text-muted flex items-center gap-2"><User size={14} /> Tutor: {b.tutor_profiles?.profiles?.full_name || 'Tutor'}</p>
                    {b.preferred_time && <p className="text-sm text-muted flex items-center gap-2 mt-1"><Clock size={14} /> {new Date(b.preferred_time).toLocaleString()}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${b.status === 'paid' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'}`}>{b.status || 'Pending'}</span>
                    <span className="text-sm font-bold text-text">GHS {b.tutor_profiles?.rate_per_hour}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* TUTOR EARNINGS */}
        {activeTab === 'tutor' && (
          <motion.div key="tutor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-violet/10 to-transparent border-violet/30 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted font-bold mb-1 flex items-center gap-2"><Wallet size={16}/> Total Escrow Earnings</p>
                  <h2 className="font-display text-5xl font-bold text-text">GHS {totalEarnings}</h2>
                </div>
                <button onClick={handleWithdraw} className="btn-primary flex items-center gap-2 py-3 px-6">Withdraw Funds</button>
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Incoming Sessions</h2>
            {tutorBookings.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-muted">No students have booked you yet.</div>
            ) : (
              tutorBookings.map(b => (
                <div key={b.id} className="glass rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-violet/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-text mb-1">{b.subject}</h3>
                    <p className="text-sm text-muted flex items-center gap-2"><User size={14} /> Student: {b.profiles?.full_name || 'Student'}</p>
                    <p className="text-sm text-muted mt-1 italic max-w-md">"{b.message || 'No message'}"</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-green-400/10 text-green-400 border border-green-400/20">Paid</span>
                     <button className="text-sm font-bold text-violet hover:text-violet/80 transition-colors flex items-center gap-1 mt-2">Message <ArrowRight size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* CREATOR ANALYTICS */}
        {activeTab === 'creator' && (
          <motion.div key="creator" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-3xl p-6 border-yellow-400/20 bg-yellow-400/5">
                <PlayCircle className="text-yellow-400 mb-2" size={24} />
                <p className="text-3xl font-display font-bold text-text">{myCourses.length}</p>
                <p className="text-xs text-muted">Courses Created</p>
              </div>
              <div className="glass rounded-3xl p-6 border-teal/20 bg-teal/5">
                <BookOpen className="text-teal mb-2" size={24} />
                <p className="text-3xl font-display font-bold text-text">{myMaterials.length}</p>
                <p className="text-xs text-muted">Materials Uploaded</p>
              </div>
            </div>

            {/* Recent Uploads List */}
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Your Most Recent Uploads</h3>
              <div className="space-y-3">
                {myMaterials.slice(0, 3).map(m => (
                  <div key={m.id} className="glass p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-text truncate">{m.title}</p>
                      <p className="text-xs text-muted">{m.course_code}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-teal">
                      <Download size={14} /> {m.downloads || 0} Downloads
                    </div>
                  </div>
                ))}
                {myMaterials.length === 0 && <p className="text-muted text-sm">No materials uploaded yet.</p>}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
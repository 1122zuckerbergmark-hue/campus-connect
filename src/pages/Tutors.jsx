import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePaystackPayment } from 'react-paystack';
import { User, Sparkles, Star, Calendar, X, Search, Clock, MessageSquare, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export default function Tutors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Become tutor form
  const [showForm, setShowForm] = useState(false);
  const [subjects, setSubjects] = useState('');
  const [rate, setRate] = useState('');
  const [bio, setBio] = useState('');

  // Booking & Payment modal
  const [bookingTutor, setBookingTutor] = useState(null);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const loadTutors = async () => {
    const { data } = await supabase
      .from('tutor_profiles')
      .select('*, profiles(full_name, university, is_pro)')
      .eq('is_available', true);
    setTutors(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await supabase
        .from('tutor_profiles')
        .select('*, profiles(full_name, university, is_pro)')
        .eq('is_available', true);
      if (active) {
        setTutors(data || []);
        setLoading(false);
      }
    };
    init();
    return () => { active = false; };
  }, []);

  const becomeTutor = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('tutor_profiles').upsert({
      user_id: user.id,
      subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
      rate_per_hour: parseFloat(rate) || 0,
      bio,
    });
    if (error) {
      toast(error.message, 'error');
      return;
    }
    toast('Tutor profile published!', 'success');
    setShowForm(false);
    loadTutors();
  };

  const openBooking = (tutor) => {
    setBookingTutor(tutor);
    setBookingSubject(tutor.subjects?.[0] || '');
    setBookingTime('');
    setBookingMessage('');
  };

  // PAYSTACK CONFIGURATION FOR ESCROW
  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || 'student@campus.com',
    amount: (bookingTutor?.rate_per_hour || 0) * 100, // Amount in pesewas
    publicKey: 'pk_test_YOUR_PUBLIC_KEY_HERE', // <-- ENSURE YOUR PAYSTACK PUBLIC KEY IS HERE
    metadata: {
      custom_fields: [
        { display_name: "Tutor ID", variable_name: "tutor_id", value: bookingTutor?.id },
        { display_name: "Tutor Name", variable_name: "tutor_name", value: bookingTutor?.profiles?.full_name }
      ]
    }
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // What happens AFTER the student pays
  const onPaymentSuccess = async (reference) => {
    // This fixes the ESLint error by using the reference object
    console.log("Payment Secured. Reference ID:", reference.reference);
    
    setBookingLoading(true);
    const { error } = await supabase.from('bookings').insert({
      student_id: user.id,
      tutor_id: bookingTutor.id,
      subject: bookingSubject,
      preferred_time: bookingTime || null,
      message: bookingMessage,
      status: 'paid'
    });
    
    setBookingLoading(false);
    if (error) {
      toast('Payment succeeded, but booking failed. Contact support.', 'error');
    } else {
      toast(`Payment Successful! GHS ${bookingTutor.rate_per_hour} secured.`, 'success');
      setBookingTutor(null);
    }
  };

  const submitBooking = (e) => {
    e.preventDefault();
    if (!bookingTutor) return;
    
    // Trigger the Paystack Modal instead of just saving to the DB
    initializePayment({ 
      onSuccess: onPaymentSuccess, 
      onClose: () => toast('Payment cancelled.', 'info') 
    });
  };

  const filtered = tutors.filter((t) => {
    const q = search.toLowerCase();
    const name = t.profiles?.full_name?.toLowerCase() || '';
    const subs = (t.subjects || []).join(' ').toLowerCase();
    return name.includes(q) || subs.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            Peer <span className="gradient-text">Tutors</span>
          </h1>
          <p className="text-muted text-lg">Book 1-on-1 sessions. Secure payments guaranteed.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <><X size={18} /> Cancel</> : <><Sparkles size={18} /> Become a Tutor</>}
        </button>
      </div>

      <div className="glass rounded-2xl flex items-center gap-3 px-5 py-4 mb-6 max-w-md focus-within:border-violet/50 transition-all">
        <Search className="text-muted" size={20} />
        <input
          className="bg-transparent flex-1 outline-none text-sm text-white placeholder-muted"
          placeholder="Search by name or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <form onSubmit={becomeTutor} className="glass rounded-3xl p-8 mb-10 flex flex-col gap-5 relative overflow-hidden modal-enter">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet/10 rounded-full blur-[80px] -z-10" />
          <h3 className="font-display text-2xl font-bold mb-2">Create your Tutor Profile</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <input className="input" placeholder="Subjects (e.g. Math, Physics, Coding)" value={subjects} onChange={(e) => setSubjects(e.target.value)} required />
            <input className="input" type="number" placeholder="Rate per hour in GHS (e.g. 50)" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <textarea className="input resize-none" rows={3} placeholder="Write a short bio about your expertise and teaching style..." value={bio} onChange={(e) => setBio(e.target.value)} />
          <button type="submit" className="btn-primary mt-2">Publish Profile</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><p className="text-teal animate-pulse">Loading Tutors...</p></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <User className="text-muted" size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">No tutors available</h3>
          <p className="text-muted">Be the first to offer your expertise!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-up">
          {filtered.map((t) => (
            <div key={t.id} className={`glass rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden ${t.profiles?.is_pro ? 'hover:border-teal/40' : 'hover:border-violet/40'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform ${t.profiles?.is_pro ? 'bg-teal/10 border-teal/20 text-teal' : 'bg-violet/10 border-violet/20 text-violet'}`}>
                  <User size={28} />
                </div>
                <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-bold">
                  <Star size={14} className="fill-yellow-400" /> 5.0
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-2xl truncate">{t.profiles?.full_name || 'Student Tutor'}</h3>
                {t.profiles?.is_pro && (
                  <span className="shrink-0 bg-gradient-to-r from-teal/20 to-violet/20 text-teal text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-teal/30 flex items-center gap-1">
                    <ShieldCheck size={12} /> Pro
                  </span>
                )}
              </div>

              <p className="text-muted text-sm mb-4 flex items-center gap-2">
                <Calendar size={14} /> {t.profiles?.university || 'Campus Connect'}
              </p>

              <div className="flex flex-wrap gap-2 my-5">
                {t.subjects?.map((s) => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white border border-white/10 font-medium">{s}</span>
                ))}
              </div>

              <p className="text-muted text-sm mb-8 line-clamp-2 italic">"{t.bio || 'Ready to help you excel.'}"</p>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div>
                  <span className={`text-2xl font-display font-bold ${t.profiles?.is_pro ? 'text-teal' : 'text-violet'}`}>GHS {t.rate_per_hour}</span>
                  <span className="text-muted text-sm">/hr</span>
                </div>
                <button onClick={() => openBooking(t)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${t.profiles?.is_pro ? 'bg-teal hover:bg-teal/80 text-black' : 'bg-violet hover:bg-violet/80 text-white'}`}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingTutor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-6 backdrop-enter">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !bookingLoading && setBookingTutor(null)} />
          <form onSubmit={submitBooking} className="glass rounded-3xl p-8 max-w-lg w-full relative z-10 modal-enter border-teal/20 shadow-[0_0_50px_rgba(94,234,212,0.1)]">
            <button type="button" onClick={() => !bookingLoading && setBookingTutor(null)} className="absolute top-4 right-4 text-muted hover:text-white"><X size={20} /></button>

            <h3 className="font-display text-2xl font-bold mb-1 text-white">Secure a Session</h3>
            <p className="text-muted text-sm mb-6">With <span className="text-teal font-semibold">{bookingTutor.profiles?.full_name}</span></p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted font-semibold mb-1 block">Subject</label>
                <input className="input" value={bookingSubject} onChange={(e) => setBookingSubject(e.target.value)} required />
              </div>

              <div>
                <label className="text-xs text-muted font-semibold mb-1 flex items-center gap-1"><Clock size={12} /> Preferred Time</label>
                <input className="input" type="datetime-local" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-muted font-semibold mb-1 flex items-center gap-1"><MessageSquare size={12} /> Message</label>
                <textarea className="input resize-none" rows={3} placeholder="What do you need help with?" value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} />
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-bold text-white">Escrow Protection</p>
                  <Lock size={14} className="text-teal" />
                </div>
                <p className="text-xs text-muted mb-3 leading-relaxed">
                  Your payment is held securely by CampusConnect. It will only be released to the tutor after your session is confirmed.
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-sm font-bold text-white">Total Payment</span>
                  <span className="text-2xl font-display font-bold text-teal">GHS {bookingTutor.rate_per_hour}</span>
                </div>
              </div>

              <button type="submit" disabled={bookingLoading} className="btn-primary mt-2 flex items-center justify-center gap-2 py-4 text-lg">
                {bookingLoading ? 'Processing...' : <><CreditCard size={20} /> Pay & Book Session</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
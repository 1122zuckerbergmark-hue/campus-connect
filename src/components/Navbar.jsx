import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ProModal from './ProModal';
import CommandPalette from './CommandPalette';
import { 
  LogOut, Upload, GraduationCap, Users, BookOpen, Zap, Menu, X, ShieldCheck, Trophy, User, Search, Activity
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPro, setShowPro] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0); // NEW: Real-time presence

  // REAL-TIME PRESENCE ENGINE
  useEffect(() => {
    if (!user) return;
    
    // Join a global room called 'campus-online'
    const room = supabase.channel('campus-online', {
      config: { presence: { key: user.id } },
    });

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        // Count how many users are currently in the room
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(room);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Materials', path: '/dashboard', icon: BookOpen },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Tutors', path: '/tutors', icon: Users },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      <CommandPalette /> {/* MOUNT THE PALETTE GLOBALLY */}
      
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-bg/60 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-violet p-[1px] group-hover:shadow-[0_0_20px_rgba(94,234,212,0.4)] transition-all">
                <div className="w-full h-full bg-bg rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-teal" size={22} />
                </div>
              </div>
              <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
                CAMPUS<span className="gradient-text">CONNECT</span>
              </span>
            </Link>

            {/* LIVE ONLINE COUNTER */}
            {user && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <Activity size={12} className="animate-pulse" />
                {onlineCount} Online
              </div>
            )}
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                {/* SEARCH TRIGGER */}
                <button 
                  onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted bg-white/5 border border-white/10 hover:border-white/20 transition-all mr-2"
                >
                  <Search size={14} />
                  <span>Search...</span>
                  <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">Ctrl K</kbd>
                </button>

                <div className="flex items-center gap-1 mr-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} to={link.path} 
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(link.path) ? 'text-teal bg-teal/10' : 'text-muted hover:text-white hover:bg-white/5'}`}
                    >
                      <link.icon size={16} /> {link.name}
                    </Link>
                  ))}
                </div>
                
                {/* PRO LOGIC */}
                {profile?.is_pro ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-teal/20 text-teal border border-teal/30 mr-2 shadow-[0_0_15px_rgba(94,234,212,0.2)]">
                    <ShieldCheck size={16} /> PRO
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowPro(true)} 
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-teal to-violet text-black hover:scale-105 hover:shadow-[0_0_25px_rgba(94,234,212,0.4)] transition-all mr-2"
                  >
                    <Zap size={16} className="fill-black" /> GO PRO
                  </button>
                )}

                <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20">
                  <LogOut size={16} /> 
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm px-8 py-2.5">
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="lg:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION DROPDOWN */}
        <div className={`lg:hidden absolute top-20 left-0 w-full bg-surface/95 backdrop-blur-3xl border-b border-white/10 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col p-6 gap-2">
            {user ? (
              <>
                {/* Mobile Search */}
                <button 
                  onClick={() => { setMobileMenuOpen(false); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium bg-white/5 text-muted mb-2"
                >
                  <Search size={20} /> Search Platform...
                </button>

                {navLinks.map((link) => (
                  <Link 
                    key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center gap-3 ${isActive(link.path) ? 'text-teal bg-teal/10' : 'text-muted hover:text-white hover:bg-white/5'}`}
                  >
                    <link.icon size={20} /> {link.name}
                  </Link>
                ))}
                
                <div className="h-px w-full bg-white/10 my-2" />

                {profile?.is_pro ? (
                  <div className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-bold bg-teal/20 text-teal border border-teal/30">
                    <ShieldCheck size={20} /> PRO MEMBER
                  </div>
                ) : (
                  <button onClick={() => { setShowPro(true); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-teal to-violet text-black">
                    <Zap size={20} className="fill-black" /> GO PRO
                  </button>
                )}

                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 rounded-xl text-base font-medium text-red-400 bg-red-400/5 hover:bg-red-400/10 transition-all">
                  <LogOut size={20} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full py-3 text-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showPro && <ProModal onClose={() => setShowPro(false)} />}
    </>
  );
}
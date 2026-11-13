import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProModal from './ProModal';
import { LogOut, Upload, Users, BookOpen, Zap, Menu, X, ShieldCheck, Trophy } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPro, setShowPro] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-bg/60 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* GENUINE LOGO */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal to-violet p-[1.5px] group-hover:shadow-[0_0_30px_rgba(94,234,212,0.6)] transition-all duration-500 group-hover:scale-105">
              <div className="w-full h-full bg-bg rounded-2xl flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-teal relative z-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-br from-teal/30 to-violet/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
              CAMPUS<span className="gradient-text">CONNECT</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-1 mr-4">
                  {navLinks.map((link) => (
                    <Link key={link.name} to={link.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(link.path) ? 'text-teal bg-teal/10' : 'text-muted hover:text-white hover:bg-white/5'}`}>
                      <link.icon size={16} /> {link.name}
                    </Link>
                  ))}
                </div>
                
                {profile?.is_pro ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-teal/20 text-teal border border-teal/30 mr-2 shadow-[0_0_15px_rgba(94,234,212,0.2)]">
                    <ShieldCheck size={16} /> PRO
                  </div>
                ) : (
                  <button onClick={() => setShowPro(true)} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal to-violet text-black hover:scale-105 hover:shadow-[0_0_25px_rgba(94,234,212,0.4)] transition-all mr-2">
                    <Zap size={16} className="fill-black" /> GO PRO
                  </button>
                )}

                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20">
                  <LogOut size={16} /> <span className="hidden lg:inline">Sign out</span>
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm px-8 py-2.5">Sign In</Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button className="md:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        <div className={`md:hidden absolute top-20 left-0 w-full bg-surface/95 backdrop-blur-3xl border-b border-white/10 transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col p-6 gap-2">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center gap-3 ${isActive(link.path) ? 'text-teal bg-teal/10' : 'text-muted hover:text-white hover:bg-white/5'}`}>
                    <link.icon size={20} /> {link.name}
                  </Link>
                ))}
                <div className="h-px w-full bg-white/10 my-2" />
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 rounded-xl text-base font-medium text-red-400 bg-red-400/5">
                  <LogOut size={20} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full py-3 text-center">Sign In</Link>
            )}
          </div>
        </div>
      </nav>
      {showPro && <ProModal onClose={() => setShowPro(false)} />}
    </>
  );
}
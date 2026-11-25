import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Upload, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: BookOpen, title: 'Verified Materials', desc: 'Past questions, lecture notes, and study guides — all in one secure place.', color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' },
    { icon: Users, title: 'Peer Tutoring', desc: 'Book 1-on-1 sessions with top students from your university.', color: 'text-violet', bg: 'bg-violet/10', border: 'border-violet/20' },
    { icon: Upload, title: 'Instant Upload', desc: 'Share your materials in seconds. Build your reputation and help others.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    { icon: Shield, title: 'Trusted Content', desc: 'Community-verified resources. No more chaotic, unorganized WhatsApp groups.', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Built for pure speed. Search, preview, and download in milliseconds.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  ];

  return (
    <div className="min-h-screen bg-bg overflow-hidden selection:bg-teal/30">
      
      {/* HERO SECTION */}
      <section className="relative px-6 pt-32 pb-24 max-w-7xl mx-auto text-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-violet/20 rounded-full blur-[100px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted mb-8 border-white/10 hover:border-teal/30 transition-colors cursor-default">
            <Sparkles size={16} className="text-teal" /> 
            <span className="font-medium text-white">The #1 Resource Hub for Students</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight mb-8">
            Your campus,<br />
            <span className="gradient-text relative">
              organized.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-teal/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Find past questions, share study notes, and book peer tutors — all in one 
            premium platform built for the modern student.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth" className="btn-primary flex items-center gap-2 text-base px-8 py-4 group">
              Start for free 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/auth" className="btn-ghost text-base px-8 py-4">
              Browse materials
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-6 py-24 max-w-7xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet/10 rounded-full blur-[120px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Built for the <span className="gradient-text">modern student</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto">Everything you need to ace your semester, beautifully designed in one place.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={f.title} 
              className={`glass rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group hover:border-white/20 ${i === 0 ? 'lg:col-span-2' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center ${f.color} mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon size={28} />
              </div>
              <h3 className="font-display font-semibold text-2xl mb-3">{f.title}</h3>
              <p className="text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 text-center text-muted text-sm relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-display font-bold text-lg text-white">CAMPUS<span className="gradient-text">CONNECT</span></span>
        </div>
        <p className="mb-2 font-medium">© {new Date().getFullYear()} CampusConnect. All Rights Reserved.</p>
        <p className="text-xs opacity-60">
          Designed, developed, and 100% owned by <span className="text-teal font-bold">Eugene Osei Tutu Antwi (BIG BOSS)</span>.
        </p>
      </footer>
    </div>
  );
}
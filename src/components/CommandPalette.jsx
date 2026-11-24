import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, Trophy, User, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { icon: BookOpen, name: 'Browse Materials', action: () => navigate('/dashboard') },
    { icon: Upload, name: 'Upload Resource', action: () => navigate('/upload') },
    { icon: Users, name: 'Find a Tutor', action: () => navigate('/tutors') },
    { icon: Trophy, name: 'Campus Leaderboard', action: () => navigate('/leaderboard') },
    { icon: User, name: 'My Profile', action: () => navigate('/profile') },
  ];

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="text-muted mr-3" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none placeholder-muted text-lg"
              />
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white bg-white/5 p-1 rounded-md">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">No results found.</div>
              ) : (
                filteredCommands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => { cmd.action(); setIsOpen(false); setQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-muted hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <cmd.icon size={18} />
                    <span className="font-medium">{cmd.name}</span>
                  </button>
                ))
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-white/10 bg-black/20 text-xs text-muted flex justify-between">
              <span>Navigate with <kbd className="bg-white/10 px-1 rounded">↑</kbd> <kbd className="bg-white/10 px-1 rounded">↓</kbd></span>
              <span>Close with <kbd className="bg-white/10 px-1 rounded">Esc</kbd></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
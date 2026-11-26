import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, BookOpen, Users, Trophy, User, PlayCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dbResults, setDbResults] = useState({ courses: [], materials: [] });
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const defaultCommands = [
    { icon: PlayCircle, name: 'Browse Courses', action: () => navigate('/courses') },
    { icon: BookOpen, name: 'Browse Materials', action: () => navigate('/dashboard') },
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
    const handleOpen = () => setIsOpen(true);
    document.addEventListener('keydown', down);
    document.addEventListener('open-command-palette', handleOpen);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  // REAL-TIME DATABASE SEARCH
  useEffect(() => {
    if (query.length < 2) return;

    const searchDatabase = async () => {
      setIsSearching(true);
      
      const { data: courses } = await supabase.from('courses').select('id, title').ilike('title', `%${query}%`).limit(3);
      const { data: materials } = await supabase.from('materials').select('id, title, course_code').ilike('title', `%${query}%`).limit(3);

      setDbResults({ courses: courses || [], materials: materials || [] });
      setIsSearching(false);
    };

    const debounce = setTimeout(searchDatabase, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // If the query is cleared, we reset the DB results safely during render
  const currentResults = query.length < 2 ? { courses: [], materials: [] } : dbResults;

  const filteredDefault = defaultCommands.filter((cmd) =>
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
                placeholder="Search courses, materials, or actions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-text outline-none placeholder-muted text-lg"
              />
              {isSearching && <Loader2 className="animate-spin text-teal mr-2" size={16} />}
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-text bg-white/5 p-1 rounded-md">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              
              {/* DATABASE RESULTS */}
              {currentResults.courses.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-bold text-violet uppercase tracking-wider">Courses</div>
                  {currentResults.courses.map(course => (
                    <button key={course.id} onClick={() => { navigate(`/course/${course.id}`); setIsOpen(false); setQuery(''); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-muted hover:text-text hover:bg-white/10 transition-colors">
                      <PlayCircle size={16} className="text-violet" />
                      <span className="font-medium truncate">{course.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentResults.materials.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-bold text-teal uppercase tracking-wider">Materials</div>
                  {currentResults.materials.map(material => (
                    <button key={material.id} onClick={() => { navigate(`/dashboard`); setIsOpen(false); setQuery(''); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-muted hover:text-text hover:bg-white/10 transition-colors">
                      <BookOpen size={16} className="text-teal" />
                      <span className="font-medium truncate">{material.title}</span>
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded ml-auto">{material.course_code}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* DEFAULT ACTIONS */}
              {filteredDefault.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-bold text-muted uppercase tracking-wider">Actions</div>
                  {filteredDefault.map((cmd, i) => (
                    <button key={i} onClick={() => { cmd.action(); setIsOpen(false); setQuery(''); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-left text-muted hover:text-text hover:bg-white/10 transition-colors">
                      <cmd.icon size={16} />
                      <span className="font-medium">{cmd.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {filteredDefault.length === 0 && currentResults.courses.length === 0 && currentResults.materials.length === 0 && !isSearching && (
                <div className="text-center py-8 text-muted text-sm">No results found for "{query}".</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
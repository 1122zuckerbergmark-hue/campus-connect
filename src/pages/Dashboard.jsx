import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import MaterialCard from '../components/MaterialCard';
import SponsoredAd from '../components/SponsoredAd';
import ProModal from '../components/ProModal';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, FileText, GraduationCap, Building2, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showPro, setShowPro] = useState(false);
  const loadMoreRef = useRef(null);

  const fetchMaterials = async ({ pageParam = 0 }) => {
    let query = supabase
      .from('materials')
      .select('*, reviews(rating)')
      .range(pageParam, pageParam + 9);

    if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
    if (sortBy === 'oldest') query = query.order('created_at', { ascending: true });
    if (sortBy === 'az') query = query.order('title', { ascending: true });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['materials', sortBy],
    queryFn: fetchMaterials,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
  });

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allMaterials = data?.pages.flat() || [];

  const filtered = allMaterials.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(q) ||
      m.course_code.toLowerCase().includes(q) ||
      (m.university || '').toLowerCase().includes(q);
    const matchesUni = universityFilter === 'all' || m.university === universityFilter;
    return matchesSearch && matchesUni;
  });

  const universities = ['all', ...new Set(allMaterials.map((m) => m.university).filter(Boolean))];
  const stats = {
    total: allMaterials.length,
    courses: new Set(allMaterials.map((m) => m.course_code)).size,
    universities: new Set(allMaterials.map((m) => m.university).filter(Boolean)).size,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-6 py-12 min-h-screen"
    >
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          Study <span className="gradient-text">Materials</span>
        </h1>
        <p className="text-muted text-lg">Browse community-shared notes and past questions.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5 hover:border-teal/30 transition-colors">
          <FileText className="text-teal mb-2" size={22} />
          <div className="text-3xl font-display font-bold">{stats.total}</div>
          <div className="text-xs text-muted mt-1">Loaded Materials</div>
        </div>
        <div className="glass rounded-2xl p-5 hover:border-violet/30 transition-colors">
          <BookOpen className="text-violet mb-2" size={22} />
          <div className="text-3xl font-display font-bold">{stats.courses}</div>
          <div className="text-xs text-muted mt-1">Courses Covered</div>
        </div>
        <div className="glass rounded-2xl p-5 hover:border-teal/30 transition-colors">
          <Building2 className="text-teal mb-2" size={22} />
          <div className="text-3xl font-display font-bold">{stats.universities}</div>
          <div className="text-xs text-muted mt-1">Universities</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="glass rounded-2xl flex items-center gap-3 px-5 py-4 flex-1 focus-within:border-teal/50 transition-all">
          <Search className="text-muted" size={20} />
          <input
            className="bg-transparent flex-1 outline-none text-sm text-white placeholder-muted"
            placeholder="Search by course code, title, or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <div className="glass rounded-2xl flex items-center gap-2 px-4 py-4">
            <Filter className="text-muted" size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-white outline-none cursor-pointer">
              <option value="newest" className="bg-surface">Newest</option>
              <option value="oldest" className="bg-surface">Oldest</option>
              <option value="az" className="bg-surface">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {universities.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {universities.map((uni) => (
            <button
              key={uni}
              onClick={() => setUniversityFilter(uni)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${universityFilter === uni ? 'bg-teal/20 border-teal/50 text-teal' : 'bg-white/5 border-white/10 text-muted hover:border-teal/30 hover:text-white'}`}
            >
              {uni === 'all' ? 'All Universities' : uni}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-3xl p-6">
              <div className="skeleton w-12 h-12 mb-4" />
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-6 w-full mb-2" />
              <div className="skeleton h-4 w-3/4 mb-6" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <GraduationCap className="text-muted" size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">No materials found</h3>
          <p className="text-muted mb-6">{search ? 'Try a different search term.' : 'Be the first to upload a study resource!'}</p>
        </div>
      ) : (
        <>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* INJECT SPONSORED AD FOR FREE USERS */}
            {!profile?.is_pro && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <SponsoredAd onUpgrade={() => setShowPro(true)} />
              </motion.div>
            )}

            {/* MAP MATERIALS */}
            {filtered.map((m) => (
              <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <MaterialCard material={m} />
              </motion.div>
            ))}
          </motion.div>

          <div ref={loadMoreRef} className="py-12 flex justify-center">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-3 text-teal">
                <Loader2 className="animate-spin" size={24} />
                <span className="font-medium">Loading more...</span>
              </div>
            ) : hasNextPage ? (
              <span className="text-muted">Scroll for more</span>
            ) : (
              <span className="text-muted text-sm">You've reached the end</span>
            )}
          </div>
        </>
      )}

      {showPro && <ProModal onClose={() => setShowPro(false)} />}
    </motion.div>
  );
}
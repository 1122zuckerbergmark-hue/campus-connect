import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown, Medal, Flame, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, university, xp, is_pro')
        .order('xp', { ascending: false })
        .limit(20);
      setLeaders(data || []);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="text-yellow-400" size={24} />;
    if (index === 1) return <Medal className="text-gray-300" size={24} />;
    if (index === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-muted font-bold text-lg">#{index + 1}</span>;
  };

  const getLevel = (xp) => {
    if (xp >= 1000) return 'Campus Legend';
    if (xp >= 500) return 'Scholar';
    if (xp >= 200) return 'Achiever';
    if (xp >= 50) return 'Freshman';
    return 'Rookie';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-6 py-12 min-h-screen"
    >
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4 border border-yellow-400/30 shadow-[0_0_40px_rgba(250,204,21,0.2)]">
          <Trophy className="text-yellow-400" size={40} />
        </div>
        <h1 className="font-display text-5xl font-bold mb-3">
          Campus <span className="gradient-text">Legends</span>
        </h1>
        <p className="text-muted text-lg">The top students building the future of education.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal" size={40} /></div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden">
          {leaders.map((leader, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
              key={leader.id} 
              className={`flex items-center justify-between p-6 border-b border-white/5 last:border-0 ${leader.id === user?.id ? 'bg-teal/5' : 'hover:bg-white/5'} transition-colors`}
            >
              <div className="flex items-center gap-6">
                <div className="w-10 flex justify-center">{getRankIcon(index)}</div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white">{leader.full_name || 'Anonymous Student'}</h3>
                    {leader.is_pro && <span className="text-[10px] font-bold bg-teal/20 text-teal px-2 py-0.5 rounded border border-teal/30">PRO</span>}
                    {leader.id === user?.id && <span className="text-xs text-muted italic">(You)</span>}
                  </div>
                  <p className="text-sm text-muted">{leader.university || 'Campus Connect'}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-orange-400 font-bold">
                  <Flame size={16} /> {leader.xp || 0} XP
                </div>
                <div className="text-xs text-teal font-semibold">{getLevel(leader.xp || 0)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
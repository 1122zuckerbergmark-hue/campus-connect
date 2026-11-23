import { useState } from 'react';
import { FileText, Download, Sparkles, Lock, ShieldAlert, MessageSquare, Video, Activity, X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AISummarizer from './AISummarizer';
import ProModal from './ProModal';
import CommunityModal from './CommunityModal';
import StudyRoom from './StudyRoom';
import CreateQuizModal from './CreateQuizModal'; // NEW IMPORT
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function MaterialCard({ material }) {
  const { toast } = useToast();
  const { profile, user } = useAuth(); // Added user to check ownership
  const [showAI, setShowAI] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showStudyRoom, setShowStudyRoom] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false); // NEW STATE

  const isLocked = material.is_premium && !profile?.is_pro;
  const isOwner = user?.id === material.uploaded_by; // Check if user uploaded this

  const handleDownload = async () => {
    if (isLocked) return setShowPro(true);
    if (!material.file_path) return;
    const { data } = supabase.storage.from('materials').getPublicUrl(material.file_path);
    window.open(data.publicUrl, '_blank');
    await supabase.rpc('increment_downloads', { material_id: material.id }).catch(() => {});
    toast('Download started!', 'success');
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`glass rounded-3xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full ${isLocked ? 'border-violet/30' : 'hover:border-teal/40 hover:shadow-[0_10px_40px_rgba(94,234,212,0.1)] group'}`}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-violet/20 flex items-center justify-center mb-3">
              <Lock className="text-violet" size={24} />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Pro Exclusive</h4>
            <button onClick={() => setShowPro(true)} className="mt-2 bg-violet hover:bg-violet/80 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all">Unlock</button>
          </div>
        )}

        <div className={`relative z-10 ${isLocked ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal">
              {material.interactive_url ? <Activity size={24} /> : <FileText size={24} />}
            </div>
            
            <div className="flex flex-col items-end gap-1">
              {material.category && (
                <span className="text-[10px] font-bold text-gray-300 bg-white/10 px-2 py-1 rounded-md uppercase tracking-wider">
                  {material.category}
                </span>
              )}
              {material.is_premium && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-violet bg-violet/10 border border-violet/20 px-2 py-1 rounded-md">
                  <ShieldAlert size={12} /> Pro
                </span>
              )}
            </div>
          </div>
          
          <div className="text-xs text-teal font-mono font-bold mb-2 tracking-wider">{material.course_code}</div>
          <h3 className="font-display font-semibold text-xl mb-2 leading-tight">{material.title}</h3>
          <p className="text-muted text-sm mb-6 line-clamp-2">{material.description || 'No description provided.'}</p>
        </div>
        
        <div className={`flex justify-between items-center pt-4 border-t border-white/5 relative z-10 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCommunity(true)} className="flex items-center gap-1 text-xs text-muted hover:text-teal transition-colors font-medium">
              <MessageSquare size={14} /> Discuss
            </button>
            <button onClick={() => setShowStudyRoom(true)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors font-bold animate-pulse">
              <Video size={14} /> Live
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* QUIZ CREATION BUTTON (Only visible to the owner) */}
            {isOwner && (
              <button onClick={() => setShowQuizCreator(true)} className="flex items-center gap-1 text-xs text-teal hover:text-white bg-teal/10 hover:bg-teal/20 border border-teal/20 px-3 py-2 rounded-xl font-bold transition-all" title="Create Quiz">
                <Plus size={14} /> Quiz
              </button>
            )}

            <button 
              onClick={() => profile?.is_pro ? setShowAI(true) : setShowPro(true)} 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${profile?.is_pro ? 'text-violet bg-violet/10 border border-violet/20' : 'text-muted bg-white/5 border border-white/10'}`}
            >
              {profile?.is_pro ? <Sparkles size={14} /> : <Lock size={14} />} AI
            </button>

            {material.interactive_url ? (
              <button onClick={() => setShowSimulation(true)} className="flex items-center gap-2 text-white bg-violet/20 hover:bg-violet hover:text-black border border-violet/30 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                <Activity size={16} /> Lab
              </button>
            ) : (
              <button onClick={handleDownload} className="flex items-center gap-2 text-white bg-white/5 hover:bg-teal hover:text-black px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                <Download size={16} /> Get
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {showAI && <AISummarizer material={material} onClose={() => setShowAI(false)} />}
      {showPro && <ProModal onClose={() => setShowPro(false)} />}
      {showCommunity && <CommunityModal material={material} onClose={() => setShowCommunity(false)} />}
      {showStudyRoom && <StudyRoom material={material} onClose={() => setShowStudyRoom(false)} />}
      {showQuizCreator && <CreateQuizModal material={material} onClose={() => setShowQuizCreator(false)} />} {/* NEW MODAL */}

      {showSimulation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-enter">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowSimulation(false)} />
          <div className="glass rounded-[2rem] p-4 w-full max-w-6xl h-[90vh] relative z-10 modal-enter border-violet/30 flex flex-col">
            <div className="flex justify-between items-center mb-4 pr-4">
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2"><Activity className="text-violet" /> Interactive Simulation</h3>
              <button onClick={() => setShowSimulation(false)} className="text-muted hover:text-white bg-white/5 p-2 rounded-full"><X size={20} /></button>
            </div>
            <iframe src={material.interactive_url} className="w-full flex-1 rounded-xl border-0 bg-white" title="Interactive Simulation" allowFullScreen={true} />
          </div>
        </div>
      )}
    </>
  );
}
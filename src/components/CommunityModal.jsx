import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Send, MessageSquare, Brain, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommunityModal({ material, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('discuss'); 
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);

  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: cData } = await supabase.from('comments').select('*, profiles(full_name, is_pro)').eq('material_id', material.id).order('created_at', { ascending: true });
      setComments(cData || []);
      setLoadingComments(false);

      const { data: qData } = await supabase.from('quizzes').select('*').eq('material_id', material.id).single();
      if (qData) setQuiz(qData);
    };
    fetchData();
  }, [material.id]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data, error } = await supabase.from('comments').insert({
      material_id: material.id, user_id: user.id, content: newComment
    }).select('*, profiles(full_name, is_pro)').single();

    if (!error) {
      setComments([...comments, data]);
      setNewComment('');
      toast('Comment posted! +5 XP', 'success');
      await supabase.rpc('award_xp', { target_user_id: user.id, amount: 5 });
    }
  };

  const submitQuiz = () => {
    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (quizAnswers[index] === q.correct_answer) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score === quiz.questions.length) {
      toast('Perfect Score! +50 XP', 'success');
      supabase.rpc('award_xp', { target_user_id: user.id, amount: 50 });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass rounded-[2rem] p-6 md:p-8 max-w-2xl w-full relative z-10 modal-enter border-teal/20 shadow-[0_0_50px_rgba(94,234,212,0.1)] flex flex-col h-[85vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
        
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold mb-1 pr-8">{material.title}</h2>
          <p className="text-sm text-teal font-mono">{material.course_code} • {material.category}</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-6">
          <button onClick={() => setActiveTab('discuss')} className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'discuss' ? 'bg-teal text-black shadow-lg' : 'text-muted hover:text-white'}`}>
            <MessageSquare size={16} /> Discussion Board
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'quiz' ? 'bg-violet text-white shadow-lg' : 'text-muted hover:text-white'}`}>
            <Brain size={16} /> Interactive Quiz
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="wait">
            {activeTab === 'discuss' && (
              <motion.div key="discuss" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                {loadingComments ? (
                  <div className="text-center py-10"><Loader2 className="animate-spin text-teal mx-auto" /></div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-20 text-muted text-sm bg-white/5 rounded-2xl border border-white/10">No comments yet. Start the discussion!</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          {c.profiles?.full_name || 'Student'}
                          {c.profiles?.is_pro && <span className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded border border-teal/30">PRO</span>}
                        </span>
                        <span className="text-[10px] text-muted">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!quiz ? (
                  <div className="text-center py-20 text-muted text-sm bg-white/5 rounded-2xl border border-white/10">No quiz available for this material yet.</div>
                ) : quizSubmitted ? (
                  <div className="text-center py-12 bg-black/30 rounded-2xl border border-white/10">
                    <div className={`text-6xl font-display font-bold mb-4 ${quizScore === quiz.questions.length ? 'text-green-400' : 'text-yellow-400'}`}>
                      {quizScore} <span className="text-3xl text-muted">/ {quiz.questions.length}</span>
                    </div>
                    <p className="text-muted mb-8">You scored {Math.round((quizScore / quiz.questions.length) * 100)}%</p>
                    <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="btn-primary">Retake Quiz</button>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {quiz.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-black/30 border border-white/10 p-6 rounded-2xl">
                        <h4 className="font-bold text-base mb-4">{qIndex + 1}. {q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt, oIndex) => (
                            <label key={oIndex} className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${quizAnswers[qIndex] === opt ? 'bg-violet/20 border-violet text-white shadow-[0_0_15px_rgba(167,139,250,0.2)]' : 'bg-white/5 border-transparent text-muted hover:bg-white/10'}`}>
                              <input type="radio" name={`q-${qIndex}`} checked={quizAnswers[qIndex] === opt} onChange={() => setQuizAnswers({ ...quizAnswers, [qIndex]: opt })} className="hidden" />
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${quizAnswers[qIndex] === opt ? 'border-violet' : 'border-muted'}`}>
                                {quizAnswers[qIndex] === opt && <div className="w-2.5 h-2.5 rounded-full bg-violet" />}
                              </div>
                              <span className="font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length !== quiz.questions.length} className="btn-primary w-full py-4 text-lg">Submit Answers</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COMMENT INPUT */}
        {activeTab === 'discuss' && (
          <form onSubmit={postComment} className="mt-4 flex gap-2">
            <input type="text" placeholder="Ask a question or share your thoughts..." className="input flex-1 bg-black/40" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <button type="submit" disabled={!newComment.trim()} className="bg-teal text-black p-3 rounded-xl hover:bg-teal/80 transition-colors disabled:opacity-50"><Send size={20} /></button>
          </form>
        )}
      </div>
    </div>
  );
}
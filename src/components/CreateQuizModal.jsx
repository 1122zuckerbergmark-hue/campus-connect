import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { X, Plus, Trash2, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateQuizModal({ material, onClose }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(`Quiz for ${material.title}`);
  const [loading, setLoading] = useState(false);
  
  // State to hold the dynamic questions
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct_answer: '' }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_answer: '' }]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestionText = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    // If we change the option that is currently marked as correct, update the correct answer
    if (newQuestions[qIndex].correct_answer === newQuestions[qIndex].options[oIndex]) {
       newQuestions[qIndex].correct_answer = value;
    }
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (qIndex, optionValue) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correct_answer = optionValue;
    setQuestions(newQuestions);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        setLoading(false);
        return toast(`Question ${i + 1} is empty.`, 'error');
      }
      if (questions[i].options.some(opt => !opt.trim())) {
        setLoading(false);
        return toast(`All options for Question ${i + 1} must be filled.`, 'error');
      }
      if (!questions[i].correct_answer) {
        setLoading(false);
        return toast(`Please select the correct answer for Question ${i + 1}.`, 'error');
      }
    }

    // Save to Supabase
    const { error } = await supabase.from('quizzes').insert({
      material_id: material.id,
      title,
      questions
    });

    setLoading(false);
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Quiz published successfully!', 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass rounded-[2rem] p-6 md:p-8 max-w-3xl w-full relative z-10 modal-enter border-teal/20 shadow-[0_0_50px_rgba(94,234,212,0.1)] flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center text-violet">
            <Brain size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Create Interactive Quiz</h2>
            <p className="text-sm text-muted">Test the knowledge of your peers.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          <div>
            <label className="text-xs text-muted font-semibold mb-1 block">Quiz Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {questions.map((q, qIndex) => (
                <motion.div 
                  key={qIndex} 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="bg-black/30 border border-white/10 p-5 rounded-2xl relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-teal">Question {qIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <input 
                    className="input mb-4" 
                    placeholder="Enter the question here..." 
                    value={q.question} 
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)} 
                    required 
                  />

                  <div className="grid md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="relative">
                        <input 
                          className="input pr-10" 
                          placeholder={`Option ${oIndex + 1}`} 
                          value={opt} 
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setCorrectAnswer(qIndex, opt)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${q.correct_answer === opt && opt !== '' ? 'text-green-400' : 'text-muted hover:text-white'}`}
                          title="Mark as correct answer"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {q.correct_answer && (
                    <p className="text-xs text-green-400 mt-3 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Correct Answer: {q.correct_answer}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-muted hover:text-teal hover:border-teal/50 hover:bg-teal/5 transition-all flex items-center justify-center gap-2 font-semibold">
            <Plus size={18} /> Add Another Question
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Publish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
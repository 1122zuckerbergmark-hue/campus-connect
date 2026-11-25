import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

export default function CoursePlayer() {
  const { id } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      const { data: cData } = await supabase.from('courses').select('*').eq('id', id).single();
      const { data: lData } = await supabase.from('lessons').select('*').eq('course_id', id).order('order_index', { ascending: true });
      
      setCourse(cData);
      setLessons(lData || []);
      if (lData && lData.length > 0) setActiveLesson(lData[0]);
      setLoading(false);
    };
    fetchCourseData();
  }, [id]);

  const markComplete = async () => {
    if (!completedLessons.includes(activeLesson.id)) {
      setCompletedLessons([...completedLessons, activeLesson.id]);
      toast('Lesson completed! Keep going.', 'success');
      await supabase.rpc('award_xp', { target_user_id: (await supabase.auth.getUser()).data.user.id, amount: 20 });
    }
  };

  if (loading || !course) return <div className="min-h-screen flex justify-center items-center"><div className="text-teal animate-pulse">Loading Classroom...</div></div>;

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-surface border-r border-white/10 flex flex-col h-[50vh] md:h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/courses" className="text-muted hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors">
            <ChevronLeft size={16} /> Back to Courses
          </Link>
          <h2 className="font-display font-bold text-xl leading-tight">{course.title}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isActive = activeLesson?.id === lesson.id;
            
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-l-4 ${isActive ? 'border-teal bg-white/5' : 'border-transparent hover:bg-white/5'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-green-400/20 text-green-400' : isActive ? 'bg-teal text-black' : 'bg-white/10 text-muted'}`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>{lesson.title}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wider">{lesson.content_type}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN PLAYER */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          {activeLesson?.content_type === 'video' ? (
            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 relative">
              <iframe 
                src={activeLesson.content_url} 
                className="w-full h-full"
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          ) : (
            <div className="glass rounded-3xl p-8 md:p-12 max-w-3xl mx-auto prose prose-invert">
              <h1 className="text-3xl font-bold mb-6 text-white">{activeLesson?.title}</h1>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{activeLesson?.content_url}</p>
            </div>
          )}

          <div className="max-w-3xl mx-auto mt-8 flex justify-between items-center bg-surface border border-white/10 p-6 rounded-2xl">
            <div>
              <h3 className="font-bold text-white mb-1">{activeLesson?.title}</h3>
              <p className="text-xs text-muted">Mark this lesson as complete to earn 20 XP.</p>
            </div>
            <button 
              onClick={markComplete} 
              disabled={completedLessons.includes(activeLesson?.id)}
              className={`btn-primary flex items-center gap-2 ${completedLessons.includes(activeLesson?.id) ? 'opacity-50 cursor-not-allowed bg-green-500/20 text-green-400' : ''}`}
            >
              {completedLessons.includes(activeLesson?.id) ? <><CheckCircle2 size={18} /> Completed</> : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
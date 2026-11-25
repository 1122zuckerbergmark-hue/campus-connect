import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlayCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('courses').select('*, profiles(full_name)').order('created_at', { ascending: false });
      setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl font-bold mb-4">Master New Skills</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">Structured learning paths created by top students and tutors. Learn at your own pace.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <motion.div whileHover={{ y: -8 }} key={course.id} className="glass rounded-3xl overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-teal/20 to-violet/20 flex items-center justify-center relative">
                <PlayCircle className="text-white/50 group-hover:text-teal group-hover:scale-110 transition-all duration-300" size={64} />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-teal mb-2">
                  <Star size={14} className="fill-teal" /> Premium Course
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-muted text-sm mb-6 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs text-muted">By {course.profiles?.full_name}</span>
                  <Link to={`/course/${course.id}`} className="btn-primary py-2 px-4 text-sm">Enroll</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
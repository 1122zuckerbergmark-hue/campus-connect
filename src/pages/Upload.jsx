import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Loader2, ArrowLeft, ShieldCheck, Link as LinkIcon } from 'lucide-react';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [university, setUniversity] = useState('');
  const [category, setCategory] = useState('General'); // NEW
  const [interactiveUrl, setInteractiveUrl] = useState(''); // NEW
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file && !interactiveUrl) return setError('Please provide a file or a simulation link.');
    setError('');
    setLoading(true);

    let path = null;
    if (file) {
      path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage.from('materials').upload(path, file);
      if (storageError) { setLoading(false); return setError(storageError.message); }
    }

    const { error: dbError } = await supabase.from('materials').insert({
      title, description, course_code: courseCode, university, category,
      file_path: path, interactive_url: interactiveUrl || null, 
      file_type: file?.type || 'url', uploaded_by: user.id, is_premium: isPremium,
    });

    setLoading(false);
    if (dbError) return setError(dbError.message);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 text-sm font-medium">
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/10 rounded-full blur-[80px] -z-10" />
        
        <h1 className="font-display text-4xl font-bold mb-2">
          Share a <span className="gradient-text">resource</span>
        </h1>
        <p className="text-muted mb-10">Upload a file or share an interactive simulation link.</p>

        <form onSubmit={handleUpload} className="flex flex-col gap-5">
          <div className="grid md:grid-cols-2 gap-5">
            <input className="input" placeholder="Title (e.g. CS101 Final Past Questions)" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input className="input" placeholder="Course code (e.g. CS101)" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required />
          </div>
          
          <div className="grid md:grid-cols-2 gap-5">
            <input className="input" placeholder="University (Optional)" value={university} onChange={(e) => setUniversity(e.target.value)} />
            <select className="input cursor-pointer text-muted" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="General" className="bg-surface">General</option>
              <option value="Past Questions" className="bg-surface">Past Questions</option>
              <option value="Lecture Notes" className="bg-surface">Lecture Notes</option>
              <option value="Simulation" className="bg-surface">Simulation</option>
              <option value="Textbook" className="bg-surface">Textbook</option>
            </select>
          </div>

          <textarea className="input resize-none" rows={3} placeholder="Brief description of what's inside..." value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* SIMULATION LINK INPUT */}
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-teal" size={18} />
            <input 
              className="input pl-12 border-teal/30 focus:border-teal" 
              placeholder="Interactive Link (Optional: PhET, GeoGebra, Desmos)" 
              value={interactiveUrl} 
              onChange={(e) => setInteractiveUrl(e.target.value)} 
              type="url"
            />
          </div>

          {/* PREMIUM TOGGLE */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsPremium(!isPremium)}>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isPremium ? 'bg-teal' : 'bg-gray-600'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isPremium ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck size={16} className="text-teal"/> Make this a PRO exclusive resource</p>
            </div>
          </div>

          <label className="glass rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition-all duration-300 group border-dashed border-2 border-white/10">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="text-teal" size={32} />
            </div>
            <div className="text-center">
              <span className="text-white font-semibold block mb-1">
                {file ? file.name : 'Click to select a file (Optional)'}
              </span>
              <span className="text-muted text-sm">PDF, DOCX up to 10MB</span>
            </div>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
          </label>

          {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-center">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary mt-4 flex justify-center items-center gap-2 text-lg py-4">
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Publish Resource'}
          </button>
        </form>
      </div>
    </div>
  );
}
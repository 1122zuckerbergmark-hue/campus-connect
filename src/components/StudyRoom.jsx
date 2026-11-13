import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { X, Send, Video, PenTool, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyRoom({ material, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Move scrollToBottom ABOVE the useEffect
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Generate a unique, secure room name based on the material ID
  const roomId = `CampusConnect_${material.id.replace(/-/g, '')}`;

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(full_name, is_pro)')
        .eq('material_id', material.id)
        .order('created_at', { ascending: true });
      
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // Subscribe to Realtime WebSockets
    const channel = supabase.channel(`room:${material.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `material_id=eq.${material.id}` 
      }, async (payload) => {
        // Fetch the user profile for the new message
        const { data: profile } = await supabase.from('profiles').select('full_name, is_pro').eq('id', payload.new.user_id).single();
        
        const newMsg = { ...payload.new, profiles: profile };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [material.id, scrollToBottom]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const content = newMessage;
    setNewMessage(''); // Clear instantly for fast UX

    await supabase.from('messages').insert({
      material_id: material.id,
      user_id: user.id,
      content
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="glass rounded-[2rem] p-4 md:p-6 max-w-6xl w-full relative z-10 modal-enter border-teal/20 shadow-[0_0_80px_rgba(94,234,212,0.15)] flex flex-col h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-white transition-colors z-50 bg-black/50 p-2 rounded-full"><X size={24} /></button>
        
        {/* HEADER */}
        <div className="mb-4 pr-12">
          <h2 className="font-display text-2xl font-bold flex items-center gap-3">
            Live Study Room <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full animate-pulse border border-red-500/30">● LIVE</span>
          </h2>
          <p className="text-sm text-teal font-mono">{material.title}</p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 p-1 bg-black/50 rounded-xl mb-4 max-w-md">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-teal text-black shadow-lg' : 'text-muted hover:text-white'}`}>
            <MessageSquare size={16} /> Chat
          </button>
          <button onClick={() => setActiveTab('video')} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'video' ? 'bg-violet text-white shadow-lg' : 'text-muted hover:text-white'}`}>
            <Video size={16} /> Video
          </button>
          <button onClick={() => setActiveTab('board')} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'board' ? 'bg-yellow-400 text-black shadow-lg' : 'text-muted hover:text-white'}`}>
            <PenTool size={16} /> Whiteboard
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  {loading ? (
                    <div className="text-center py-10"><Loader2 className="animate-spin text-teal mx-auto" /></div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-muted text-sm">No messages yet. Say hello to your classmates!</div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.user_id === user?.id;
                      return (
                        <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-muted mb-1 px-1">{msg.profiles?.full_name || 'Student'}</span>
                          <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-teal text-black rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                  <input type="text" placeholder="Type a message..." className="input flex-1 bg-white/5 border-white/10" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-teal text-black px-6 rounded-xl font-bold hover:bg-teal/80 transition-colors disabled:opacity-50"><Send size={18} /></button>
                </form>
              </motion.div>
            )}

            {/* VIDEO TAB (JITSI MEET) */}
            {activeTab === 'video' && (
              <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-black flex items-center justify-center">
                <iframe 
                  src={`https://meet.jit.si/${roomId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`}
                  allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                  className="w-full h-full border-0"
                  title="Video Classroom"
                />
              </motion.div>
            )}

            {/* WHITEBOARD TAB (EXCALIDRAW) */}
            {activeTab === 'board' && (
              <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-white flex items-center justify-center">
                <iframe 
                  src={`https://excalidraw.com/#room=${roomId},${material.id}`}
                  className="w-full h-full border-0"
                  title="Collaborative Whiteboard"
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
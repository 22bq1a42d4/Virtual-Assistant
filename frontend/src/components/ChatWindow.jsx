import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}
function IconMic(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
      <path d="M12 19v3" />
    </svg>
  );
}
function IconAttach(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M21.44 11.05L12.99 19.5a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L10.1 16.25a2 2 0 0 1-2.83-2.83l7.78-7.78" />
    </svg>
  );
}

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hi! I analyzed your profile. Want suggestions for your next role?' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: 'Great question! Here are 3 quick improvements you can make this week...' },
      ]);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <GlassCard className="flex flex-col h-[480px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.role === 'user' ? 'ml-auto bg-gradient-to-r from-neonMagenta/30 to-neonCyan/30 border border-white/10' : 'bg-white/10 border border-white/10'}`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[80%] px-4 py-2 rounded-2xl bg-white/10 border border-white/10 inline-flex items-center gap-1">
              <span className="typing-dot h-2 w-2 rounded-full bg-white/70" />
              <span className="typing-dot h-2 w-2 rounded-full bg-white/70" />
              <span className="typing-dot h-2 w-2 rounded-full bg-white/70" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="border-t border-white/10 p-3 flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Attach">
          <IconAttach className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Voice">
          <IconMic className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask for career advice, resume tips, or networking scripts..."
            className="w-full bg-transparent outline-none resize-none text-sm p-2 rounded-md"
          />
        </div>
        <button onClick={sendMessage} className="btn-primary px-3 py-2" title="Send">
          <IconSend className="h-5 w-5" />
        </button>
      </div>
    </GlassCard>
  );
}
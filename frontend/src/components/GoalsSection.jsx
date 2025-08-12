import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const defaultGoals = [
  {
    title: 'Strengthen Personal Brand',
    detail: 'Post a weekly insight on recent industry trends. Optimize your headline with role + impact.',
  },
  {
    title: 'Upskill: Cloud Fundamentals',
    detail: 'Complete a 10-hour course on AWS or GCP. Build a mini project and share learnings on LinkedIn.',
  },
  {
    title: 'Network Outreach',
    detail: 'Message 3 professionals in your target role weekly. Ask about challenges and recommended resources.',
  },
];

export default function GoalsSection({ goals = defaultGoals }) {
  const [flipped, setFlipped] = useState(Array(goals.length).fill(false));

  const toggle = (i) => {
    setFlipped((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">AI Suggestions & Goals</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g, i) => (
          <div key={i} className="relative h-40 cursor-pointer [perspective:1000px]" onClick={() => toggle(i)}>
            <motion.div
              className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped[i] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 p-4 flex flex-col justify-center" style={{ backfaceVisibility: 'hidden' }}>
                <h4 className="font-semibold mb-2">{g.title}</h4>
                <p className="text-white/70 text-sm">Tap to view actions</p>
              </div>
              <div className="absolute inset-0 p-4 flex items-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-white/80 text-sm leading-relaxed">{g.detail}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
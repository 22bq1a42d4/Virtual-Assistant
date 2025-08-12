import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function ProfileCard({ user }) {
  const { firstName, lastName, email, profilePicture, headline } = user || {};
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Glowing circular border */}
          <div className="p-[2px] rounded-full bg-[conic-gradient(var(--neon-cyan),var(--neon-magenta),var(--neon-cyan))] animate-[gradientShift_6s_ease_infinite]">
            <img
              src={profilePicture || 'https://avatars.githubusercontent.com/u/9919?s=200&v=4'}
              alt="profile"
              className="h-24 w-24 rounded-full object-cover bg-black"
            />
          </div>
          <div className="absolute inset-0 -z-10 blur-xl opacity-60 bg-[conic-gradient(var(--neon-cyan),transparent,transparent,var(--neon-magenta))] rounded-full" />
        </motion.div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold mb-1">{firstName} {lastName}</h2>
          {headline && <p className="text-white/70 mb-1 truncate">{headline}</p>}
          {email && <p className="text-white/50 text-sm truncate">{email}</p>}
        </div>
      </div>
    </GlassCard>
  );
}
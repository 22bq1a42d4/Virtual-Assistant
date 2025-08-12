import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch {}
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0b0f1a]/60 backdrop-blur-xl border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="h-8 w-8 rounded-lg bg-gradient-to-br from-neonCyan to-neonMagenta shadow-glow" />
          <span className="text-lg font-bold tracking-wide neon-text">LinkChat</span>
        </Link>

        <div className="flex items-center gap-3">
          {isDashboard && user ? (
            <div className="hidden sm:flex items-center gap-3 mr-2 text-sm text-white/70">
              <span className="truncate max-w-[180px]">{user.firstName} {user.lastName}</span>
            </div>
          ) : null}
          {isDashboard && user ? (
            <button onClick={handleLogout} className="btn-primary px-4 py-2 text-sm">Logout</button>
          ) : (
            <a href="/auth/linkedin" className="btn-primary px-4 py-2 text-sm">Login with LinkedIn</a>
          )}
        </div>
      </div>
    </nav>
  );
}
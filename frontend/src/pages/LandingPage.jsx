import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function Particles({ count = 2000 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8;
      arr[i * 3] = (Math.random() - 0.5) * r * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * r * 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * r * 2;
    }
    return arr;
  }, [count]);
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#68e1fd" size={0.02} sizeAttenuation depthWrite={false} transparent opacity={0.8} />
    </points>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    // If already logged in, go to dashboard
    api.get('/api/me')
      .then(({ data }) => {
        if (data && data.email) navigate('/dashboard');
      })
      .catch(() => {});
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Particle Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <fog attach="fog" args={["#07101a", 10, 22]} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <Particles />
        </Canvas>
      </div>

      {/* Centered glass card */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass max-w-xl w-full p-8 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            <span className="neon-text">Your AI Career Companion</span>
            <span className="block text-white/70 text-lg mt-2">Powered by LinkedIn</span>
          </h1>
          <p className="text-white/70 mb-8">Get personalized insights, goals, and chat guidance based on your LinkedIn profile.</p>
          <a href="/auth/linkedin" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5V24H0zM8 8h4.8v2.2h.07c.67-1.2 2.32-2.46 4.78-2.46 5.11 0 6.06 3.36 6.06 7.73V24h-5V16.3c0-1.84-.03-4.2-2.56-4.2-2.56 0-2.95 2-2.95 4.07V24H8z" />
            </svg>
            Login with LinkedIn
          </a>
        </motion.div>
      </div>

      {/* Decorative gradients */}
      <div className="pointer-events-none absolute -z-20 inset-0 bg-radial-glow" />
    </div>
  );
}
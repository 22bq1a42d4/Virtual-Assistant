import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import useFetchUser from '../hooks/useFetchUser';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/Loader.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import SkillsCloud from '../components/SkillsCloud.jsx';
import GoalsSection from '../components/GoalsSection.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

function SubtleParticles({ count = 800 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6;
      arr[i * 3] = (Math.random() - 0.5) * r * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * r * 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * r * 2;
    }
    return arr;
  }, [count]);
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#b966ff" size={0.015} sizeAttenuation depthWrite={false} transparent opacity={0.35} />
    </points>
  );
}

export default function Dashboard() {
  const { user, loading, error } = useFetchUser();

  return (
    <div className="relative min-h-screen">
      {/* Background subtle particles */}
      <div className="absolute inset-0 -z-10 opacity-60">
        <Canvas camera={{ position: [0, 0, 9], fov: 75 }}>
          <ambientLight intensity={0.2} />
          <SubtleParticles />
        </Canvas>
      </div>

      <Navbar user={user} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading && <Loader label="Fetching your LinkedIn profile..." />}
        {!loading && error && (
          <div className="glass p-6 text-center">
            <p className="text-white/80 mb-4">You are not logged in or your session expired.</p>
            <a href="/auth/linkedin" className="btn-primary">Login with LinkedIn</a>
          </div>
        )}
        {!loading && user && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            {/* Profile Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfileCard user={user} />
                <div className="mt-6">
                  <GoalsSection />
                </div>
              </div>
              <div className="lg:col-span-1">
                <SkillsCloud skills={user.skills || ['React', 'Node.js', 'APIs', 'UI/UX', 'Leadership', 'TypeScript']} />
              </div>
            </div>

            {/* Chat */}
            <ChatWindow />
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
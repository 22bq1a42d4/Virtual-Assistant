import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function SkillTag({ text, position }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Html position={position} center transform occlude>
        <motion.div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          whileHover={{ scale: 1.08 }}
          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition-colors ${hovered ? 'bg-white/20 text-white shadow-glow' : 'bg-white/10 text-white/90'}`}
          style={{ border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
        >
          {text}
        </motion.div>
      </Html>
    </Float>
  );
}

function Cloud({ skills = [] }) {
  const radius = 2.5;
  const positions = useMemo(() => {
    const pts = [];
    const count = Math.max(skills.length, 8);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      pts.push([x, y, z]);
    }
    return pts;
  }, [skills.length]);

  return positions.map((pos, idx) => (
    <SkillTag key={idx} position={pos} text={skills[idx % skills.length]} />
  ));
}

export default function SkillsCloud({ skills = [] }) {
  const canvasRef = useRef();
  return (
    <div className="glass p-4">
      <div className="h-72 w-full rounded-xl overflow-hidden">
        <Canvas ref={canvasRef} camera={{ position: [0, 0, 7], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <Cloud skills={skills.length ? skills : ['React', 'Node.js', 'Design', 'APIs', 'Tailwind', 'Three.js', 'Framer Motion', 'LinkedIn']} />
          <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>
    </div>
  );
}
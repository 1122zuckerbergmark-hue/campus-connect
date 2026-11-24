import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, Float, useScroll } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Brain } from 'lucide-react';

function MorphingShape() {
  const meshRef = useRef();
  const scroll = useScroll();

  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.x += delta * 0.1;

    const scrollOffset = scroll.offset;
    meshRef.current.position.y = scrollOffset * 5;
    meshRef.current.rotation.z = scrollOffset * Math.PI;

    const mouseX = (state.mouse.x * Math.PI) / 10;
    const mouseY = (state.mouse.y * Math.PI) / 10;
    meshRef.current.rotation.x += (mouseY - meshRef.current.rotation.x) * 0.1;
    meshRef.current.rotation.y += (mouseX - meshRef.current.rotation.y) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.2}>
        {/* Reduced complexity for mobile performance */}
        <torusKnotGeometry args={[1, 0.3, 64, 16]} />
        <meshStandardMaterial 
          color="#5eead4" 
          emissive="#a78bfa"
          emissiveIntensity={0.8}
          roughness={0.2} 
          metalness={0.9} 
        />
      </mesh>
    </Float>
  );
}

export default function ThreeScene() {
  return (
    // REMOVED -z-10. The canvas will now sit properly.
    <div className="h-screen w-full absolute inset-0 z-0 bg-[#050508]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={2} color="#5eead4" />
        <directionalLight position={[-10, -10, -10]} intensity={1} color="#a78bfa" />

        <ScrollControls pages={3} damping={0.2}>
          <MorphingShape />
          
          <Scroll html style={{ width: '100%' }}>
            {/* PAGE 1 */}
            <section className="h-screen flex flex-col justify-center items-center text-center px-6">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted mb-8 border-white/10">
                  <span className="w-2 h-2 rounded-full bg-teal animate-pulse" /> 
                  <span className="font-medium text-white">The Future of Education is Here</span>
                </div>
                <h1 className="font-display text-6xl md:text-8xl font-bold leading-[1.1] tracking-tight mb-6 text-white drop-shadow-2xl">
                  Your campus,<br />
                  <span className="gradient-text">organized.</span>
                </h1>
                <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
                  Experience the world's first immersive academic operating system.
                </p>
                <Link to="/auth" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                  Enter the Platform <ArrowRight size={20} />
                </Link>
              </motion.div>
            </section>

            {/* PAGE 2 */}
            <section className="h-screen flex flex-col justify-center items-start px-6 md:px-24">
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-2xl">
                Knowledge. <br/> <span className="text-violet">Connected.</span>
              </h2>
              <p className="text-muted text-lg max-w-md mb-12">
                Share materials, collaborate in live rooms, and let AI summarize your notes instantly.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                {[
                  { icon: BookOpen, title: "Resources", desc: "Past questions & notes" },
                  { icon: Users, title: "Tutors", desc: "Secure peer-to-peer" },
                  { icon: Brain, title: "AI Engine", desc: "Instant summaries" }
                ].map((f, i) => (
                  <div key={i} className="glass p-6 rounded-2xl border-teal/20 bg-black/40 backdrop-blur-md">
                    <f.icon className="text-teal mb-4" size={28} />
                    <h3 className="text-white font-bold text-xl mb-1">{f.title}</h3>
                    <p className="text-muted text-sm">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PAGE 3 */}
            <section className="h-screen flex flex-col justify-center items-center text-center px-6">
              <h2 className="font-display text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
                Ready to <span className="gradient-text">evolve?</span>
              </h2>
              <p className="text-muted text-lg mb-10">Join thousands of students mastering their campus.</p>
              <Link to="/auth" className="btn-primary inline-flex items-center gap-2 text-xl px-10 py-5">
                Create Free Account <ArrowRight size={24} />
              </Link>
            </section>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
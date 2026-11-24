import ThreeScene from '../components/ThreeScene';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-bg overflow-hidden selection:bg-teal/30">
      {/* The 3D Engine */}
      <ThreeScene />
      
      {/* A subtle gradient overlay at the bottom so the Navbar and Footer blend perfectly */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none z-10" />
    </div>
  );
}
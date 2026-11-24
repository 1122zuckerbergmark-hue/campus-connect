import ThreeScene from '../components/ThreeScene';

export default function Landing() {
  return (
    // Removed bg-bg so the canvas shows. Added overflow-hidden.
    <div className="relative h-screen w-full overflow-hidden selection:bg-teal/30">
      <ThreeScene />
    </div>
  );
}
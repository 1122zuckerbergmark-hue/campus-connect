import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 ml-2 rounded-lg text-muted hover:text-text transition-colors relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isDark ? 0 : 180, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute"
      >
        <Moon size={18} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotateY: isDark ? -180 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute"
      >
        <Sun size={18} />
      </motion.div>
    </button>
  );
}
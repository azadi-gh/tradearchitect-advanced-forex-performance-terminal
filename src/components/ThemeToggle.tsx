import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
interface ThemeToggleProps {
  className?: string;
}
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const handleToggle = () => {
    // Inject global transition classes temporarily for smooth theme shift
    document.documentElement.classList.add('theme-transitioning');
    toggleTheme();
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };
  return (
    <Button
      onClick={handleToggle}
      variant="ghost"
      size="icon"
      className={cn(
        "relative w-10 h-10 rounded-xl transition-all duration-300 active:scale-90 z-50 overflow-hidden",
        isDark ? "hover:bg-amber-500/10" : "hover:bg-indigo-500/10",
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
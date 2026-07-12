import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../lib/store/theme";

export function ThemeToggle() {
  const { isDark, toggleDark } = useThemeStore();

  return (
    <button
      onClick={toggleDark}
      className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 dark:hidden transition-transform duration-300 hover:rotate-45 active:scale-90" />
      <Moon className="h-5 w-5 hidden dark:block transition-transform duration-300 hover:-rotate-12 active:scale-90" />
    </button>
  );
}

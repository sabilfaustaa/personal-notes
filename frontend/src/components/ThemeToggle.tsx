"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  function cycle() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg hover:bg-hover transition-colors"
      aria-label={`Tema: ${theme}`}
      title={`Tema: ${theme} — klik untuk ganti`}
    >
      <Icon className="w-[18px] h-[18px] text-text-secondary" />
    </button>
  );
}

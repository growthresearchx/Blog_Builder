import React from "react";
import {
  Code,
  Cpu,
  LineChart,
  Palette,
  Briefcase,
  Terminal,
  FolderTree,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";

export interface CategoryTheme {
  icon: React.ReactNode;
  badgeClass: string;
  gradientClass: string;
}

export function getCategoryTheme(categoryName?: string | null): CategoryTheme {
  if (!categoryName) {
    return {
      icon: <FolderTree className="h-3.5 w-3.5" />,
      badgeClass: "bg-primary/10 text-primary border-primary/20",
      gradientClass: "from-primary/10 via-muted/60 to-primary/5",
    };
  }

  const name = categoryName.toLowerCase();

  if (name.includes("tech") || name.includes("code") || name.includes("software") || name.includes("web") || name.includes("dev")) {
    return {
      icon: <Code className="h-3.5 w-3.5" />,
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      gradientClass: "from-blue-500/15 via-muted/60 to-cyan-500/10",
    };
  }

  if (name.includes("ai") || name.includes("intelligence") || name.includes("machine") || name.includes("ml")) {
    return {
      icon: <Cpu className="h-3.5 w-3.5" />,
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      gradientClass: "from-purple-500/15 via-muted/60 to-pink-500/10",
    };
  }

  if (name.includes("data") || name.includes("analytic") || name.includes("metric") || name.includes("stats")) {
    return {
      icon: <LineChart className="h-3.5 w-3.5" />,
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      gradientClass: "from-emerald-500/15 via-muted/60 to-teal-500/10",
    };
  }

  if (name.includes("design") || name.includes("ui") || name.includes("ux") || name.includes("art")) {
    return {
      icon: <Palette className="h-3.5 w-3.5" />,
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      gradientClass: "from-rose-500/15 via-muted/60 to-orange-500/10",
    };
  }

  if (name.includes("business") || name.includes("career") || name.includes("growth") || name.includes("manage")) {
    return {
      icon: <Briefcase className="h-3.5 w-3.5" />,
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      gradientClass: "from-amber-500/15 via-muted/60 to-yellow-500/10",
    };
  }

  if (name.includes("database") || name.includes("sql") || name.includes("backend")) {
    return {
      icon: <Database className="h-3.5 w-3.5" />,
      badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      gradientClass: "from-indigo-500/15 via-muted/60 to-blue-500/10",
    };
  }

  return {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    gradientClass: "from-primary/15 via-muted/60 to-primary/5",
  };
}

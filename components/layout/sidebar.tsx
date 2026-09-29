"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderTree,
  Tag,
  PlusCircle,
  LogOut,
  Globe,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  role: "ADMIN" | "EMPLOYEE";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Logged out successfully");
        setMobileOpen(false);
        router.push("/");
        router.refresh();
      } else {
        toast.error("Failed to log out");
      }
    } catch {
      toast.error("Failed to log out");
    }
  };

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/employees", label: "Employees", icon: Users },
    { href: "/admin/blogs", label: "All Blogs", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/tags", label: "Tags", icon: Tag },
  ];

  const employeeLinks = [
    { href: "/employee/blogs", label: "My Blogs", icon: FileText },
    { href: "/employee/blogs/create", label: "Create Blog", icon: PlusCircle },
  ];

  const links = role === "ADMIN" ? adminLinks : employeeLinks;

  const NavContent = () => (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 font-bold leading-none tracking-tight"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h2 className="font-bold text-base leading-none">BlogBuilder</h2>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                {role} Panel
              </span>
            </div>
          </Link>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-transform", isActive && "scale-110")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span>Public Website</span>
        </Link>
        <button
          onClick={() => {
            setMobileOpen(false);
            handleLogout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2 font-bold text-sm">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <span>BlogBuilder <span className="text-xs text-muted-foreground font-normal">({role})</span></span>
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-14 bottom-0 left-0 z-50 w-64 bg-card border-r p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-card h-screen sticky top-0 p-4 flex-col justify-between shrink-0 overflow-y-auto">
        <NavContent />
      </aside>
    </>
  );
}

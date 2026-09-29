"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  PenTool,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { UserSession } from "@/types";
import { CommandPalette } from "@/components/blog/command-palette";
import { BookmarksModal } from "@/components/blog/bookmarks-modal";
import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [bookmarksModalOpen, setBookmarksModalOpen] = useState(false);
  const { bookmarks, mounted: bookmarksMounted } = useBookmarks();

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Signed out successfully");
        setUser(null);
        setMobileMenuOpen(false);
        router.push("/");
        router.refresh();
      } else {
        toast.error("Failed to sign out");
      }
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <span>BlogBuilder</span>
          </Link>

          {/* Desktop Navigation & Quick Search Trigger */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/"
                prefetch={true}
                className={`relative py-1 transition-colors hover:text-primary ${
                  pathname === "/"
                    ? "text-primary font-bold after:absolute after:-bottom-2.5 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground"
                }`}
              >
                Home
              </Link>
              <Link
                href="/search"
                prefetch={true}
                className={`relative py-1 flex items-center gap-1.5 transition-colors hover:text-primary ${
                  pathname === "/search"
                    ? "text-primary font-bold after:absolute after:-bottom-2.5 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground"
                }`}
              >
                <span>Search</span>
              </Link>
            </nav>

            {/* Quick Command Search Trigger Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/60 hover:bg-muted border rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search platform...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono bg-background border rounded text-muted-foreground">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Saved Articles Trigger */}
            <button
              type="button"
              onClick={() => setBookmarksModalOpen(true)}
              className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="View saved articles"
              aria-label="View saved articles"
            >
              <Bookmark className="h-4 w-4" />
              {bookmarksMounted && bookmarks.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>

            <ThemeToggle />

          {loadingUser ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-muted/60 animate-pulse rounded-md" />
              <div className="h-8 w-24 bg-muted/60 animate-pulse rounded-md" />
            </div>
          ) : (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  {user.role === "ADMIN" ? (
                    <Link href="/admin/dashboard">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/employee/blogs">
                        <Button size="sm" variant="ghost" className="gap-1.5">
                          My Blogs
                        </Button>
                      </Link>
                      <Link href="/employee/blogs/create">
                        <Button size="sm" className="gap-1.5">
                          <PenTool className="h-4 w-4" />
                          Write
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3 animate-fade-in-down">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Blogs
            </Link>
          </nav>

          <div className="pt-3 border-t space-y-2">
            {user ? (
              <>
                <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>{user.name} ({user.role})</span>
                </div>
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full justify-start gap-2" size="sm">
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/employee/blogs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                        My Blogs
                      </Button>
                    </Link>
                    <Link
                      href="/employee/blogs/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full"
                    >
                      <Button className="w-full justify-start gap-2" size="sm">
                        <PenTool className="h-4 w-4" />
                        Write Blog
                      </Button>
                    </Link>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    <CommandPalette
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
    />

    <BookmarksModal
      isOpen={bookmarksModalOpen}
      onClose={() => setBookmarksModalOpen(false)}
    />
  </>
  );
}

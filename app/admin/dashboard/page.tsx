"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCard } from "@/components/admin/stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  FileText,
  Eye,
  Award,
  Users,
  FolderTree,
  Tag,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface AdminDashboardStats {
  totalBlogs: number;
  totalViews: number;
  mostActiveEmployee: {
    id?: string;
    name: string;
    email: string;
    avatar?: string | null;
    blogCount: number;
  } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch admin stats");
      }
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading platform analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-destructive">Failed to Load Dashboard</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <Button onClick={fetchStats} className="mt-4" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const avgViewsPerBlog = stats.totalBlogs > 0 ? Math.round(stats.totalViews / stats.totalBlogs) : 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform statistics, readership analytics, and author performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/employees">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="h-4 w-4" />
              Manage Employees
            </Button>
          </Link>
          <Link href="/admin/blogs">
            <Button size="sm" className="gap-1.5">
              <FileText className="h-4 w-4" />
              View All Blogs
            </Button>
          </Link>
        </div>
      </div>

      {/* PDF-Required KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Blogs"
          value={stats.totalBlogs}
          subtitle="All platform blog posts"
          icon={<FileText className="h-6 w-6" />}
          className="animate-fade-in-up hover:shadow-md transition-shadow"
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          subtitle="Cumulative views across platform blogs"
          icon={<Eye className="h-6 w-6" />}
          className="animate-fade-in-up [animation-delay:100ms] hover:shadow-md transition-shadow"
        />
        <Card className="p-6 shadow-sm border bg-card text-card-foreground animate-fade-in-up [animation-delay:200ms] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Most Active Employee
              </p>
              {stats.mostActiveEmployee ? (
                <>
                  <div className="text-2xl font-bold tracking-tight truncate" title={stats.mostActiveEmployee.name}>
                    {stats.mostActiveEmployee.name}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Authored {stats.mostActiveEmployee.blogCount}{" "}
                    {stats.mostActiveEmployee.blogCount === 1 ? "blog" : "blogs"}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-xl font-semibold text-muted-foreground truncate">
                    No active author
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No employee blogs authored yet
                  </p>
                </>
              )}
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Readership Engagement & Platform Health Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Engagement Velocity */}
        <Card className="lg:col-span-7 p-6 border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Readership Velocity & Health</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Optimal
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Views Per Article</span>
              <strong className="text-foreground font-bold">{avgViewsPerBlog} views/post</strong>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, avgViewsPerBlog * 5))}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-1">
            Platform articles maintain high engagement with reader tracking and real-time view verification.
          </p>
        </Card>

        {/* Quick Management Shortcuts */}
        <Card className="lg:col-span-5 p-6 border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Quick Shortcuts</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Link href="/admin/categories" className="p-3 rounded-xl border bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between text-xs font-semibold group">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-primary" />
                <span>Categories</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link href="/admin/tags" className="p-3 rounded-xl border bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between text-xs font-semibold group">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span>Tags</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link href="/admin/employees" className="p-3 rounded-xl border bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between text-xs font-semibold group">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Employees</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link href="/" className="p-3 rounded-xl border bg-muted/30 hover:bg-muted transition-colors flex items-center justify-between text-xs font-semibold group">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Public Site</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

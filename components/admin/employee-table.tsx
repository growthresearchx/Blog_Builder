"use client";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, User, FileText, Calendar, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  blogCount: number;
}

interface EmployeeTableProps {
  employees: EmployeeItem[];
  onRemove: (id: string, name: string) => void;
  isDeletingId?: string | null;
}

export function EmployeeTable({ employees, onRemove, isDeletingId }: EmployeeTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Employee ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (employees.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center bg-card">
        <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="text-lg font-medium">No Employees Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No employee accounts have been created yet. Click &quot;Add Employee&quot; to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg bg-card shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase border-b">
          <tr>
            <th className="px-6 py-4">Employee</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4 text-center">Blogs Authored</th>
            <th className="px-6 py-4">Joined Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {employees.map((emp) => {
            const isDeleting = isDeletingId === emp.id;
            return (
              <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center gap-3">
                  {emp.avatar ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border">
                      <Image
                        src={emp.avatar}
                        alt={emp.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{emp.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>ID: {emp.id.slice(0, 8)}...</span>
                      <button
                        type="button"
                        onClick={() => handleCopyId(emp.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy full Employee ID"
                      >
                        {copiedId === emp.id ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{emp.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {emp.blogCount} {emp.blogCount === 1 ? "blog" : "blogs"}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(emp.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => onRemove(emp.id, emp.name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-8 px-2.5"
                    title={`Remove ${emp.name} (Posts are preserved)`}
                    aria-label={`Remove employee ${emp.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    {isDeleting ? "Removing..." : "Remove"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

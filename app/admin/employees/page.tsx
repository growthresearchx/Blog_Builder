"use client";

import { useEffect, useState } from "react";
import { EmployeeTable, EmployeeItem } from "@/components/admin/employee-table";
import { EmployeeModal } from "@/components/admin/employee-modal";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { UserPlus, Search, Users, RefreshCw, X, AlertTriangle } from "lucide-react";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/employees", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch employees");
      }
      setEmployees(data.employees || []);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
      toast.error(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null);

  const handleRequestRemoveEmployee = (id: string, name: string) => {
    const target = employees.find((e) => e.id === id) || { id, name } as EmployeeItem;
    setEmployeeToDelete(target);
  };

  const handleConfirmRemoveEmployee = async () => {
    if (!employeeToDelete) return;

    const { id, name } = employeeToDelete;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete employee");
      }

      toast.success(data.message || `Employee "${name}" removed successfully`);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove employee");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {employees.length} Total
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage author accounts, monitor article counts, and create new employee credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployees}
            disabled={loading}
            title="Refresh employees"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search employee by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition"
              title="Clear search"
              aria-label="Clear search input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading employee accounts...</p>
        </div>
      ) : error ? (
        <div className="p-8 border border-destructive/20 bg-destructive/10 rounded-lg text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchEmployees} className="mt-4" variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onRemove={handleRequestRemoveEmployee}
          isDeletingId={deletingId}
        />
      )}

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEmployees}
      />

      {/* Delete Employee Confirmation Modal */}
      <Modal
        isOpen={!!employeeToDelete}
        onClose={() => !deletingId && setEmployeeToDelete(null)}
        title="Remove Employee"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Are you sure you want to remove employee <strong className="text-foreground">{employeeToDelete?.name}</strong>?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All blog posts authored by this employee will be preserved safely.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEmployeeToDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmRemoveEmployee}
              disabled={!!deletingId}
            >
              {deletingId ? "Removing..." : "Remove Employee"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

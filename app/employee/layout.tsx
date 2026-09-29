import { Sidebar } from "@/components/layout/sidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar role="EMPLOYEE" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 md:pt-8 overflow-y-auto max-w-full">
        {children}
      </main>
    </div>
  );
}

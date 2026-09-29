"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

interface PaginationClientWrapperProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function PaginationClientWrapper({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationClientWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`${baseUrl}?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}

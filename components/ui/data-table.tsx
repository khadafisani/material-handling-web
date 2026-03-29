"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface MaterialRequestItem {
  title?: string;
  date?: string;
  status_name?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  readonly columns: ColumnDef<TData, TValue>[];
  readonly data: TData[];
  readonly totalCount?: number;
  readonly currentPage?: number;
  readonly pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  totalCount = 0,
  currentPage: initialPage = 1,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Get current page from URL params, fallback to initialPage
  const currentPage = Number.parseInt(searchParams.get("page") || initialPage.toString(), 10);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchPageData = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/material-requests?page=${page}&limit=${pageSize}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const json = await response.json();
      const items = json?.data?.material_requests || [];

      const mappedData = items.map((item: MaterialRequestItem) => ({
        title: item.title || "",
        date: item.date || "",
        status_name: item.status_name || item.status || "Unknown",
        created_at: item.created_at || "",
        ...item,
      }));

      setData(mappedData);
      
      // Update URL with new page
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("page", page.toString());
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error fetching page data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (hasPrevPage) {
      fetchPageData(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      fetchPageData(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total Items: <span className="font-semibold text-gray-900">{totalCount}</span> | Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!hasPrevPage || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

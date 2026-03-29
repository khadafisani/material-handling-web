
import { columns } from "@/components/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-start justify-start py-8 px-6 gap-8 bg-white dark:bg-black">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-6">Items Management</h1>

          <div className="flex justify-end items-center mb-6">
            <Link href="/material-requests/create">
              <Button variant="default">Create Request</Button>
            </Link>
          </div>

          <Suspense fallback={<div className="text-center py-8">Loading data...</div>}>
            <MaterialRequestsTable />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function MaterialRequestsTable() {
  const materialRequests = await getMaterialRequestData(1);

  return (
    <DataTable
      columns={columns}
      data={materialRequests.data}
      totalCount={materialRequests.count}
      currentPage={1}
      pageSize={10}
    />
  );
}

export async function getMaterialRequestData(page: number = 1) {
  const response = await fetch(`http://localhost:3001/api/v1/material-requests?page=${page}&limit=10`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch material requests");
  }

  const json = await response.json();
  const items = json?.data?.material_requests || [];

  const result = {
    data: items.map((item: any) => ({
    title: item.title || "",
    date: item.date || "",
    status_name: item.status_name || item.status || "Unknown",
    created_at: item.created_at || "",
    ...item,
  })), count: json?.data?.count || 0 };

  return result;
}

"use client";

import { Item } from "@/lib/data";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "requester_name",
    header: "Request By",
  },
  {
    accessorKey: "date",
    header: "Request Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("date") as string;
      return <div>{dateStr.split("T")[0]}</div>;
    }
  },
  {
    accessorKey: "status_name",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status_name") as string;
      const statusColors: Record<string, string> = {
        "Requested": "bg-green-100 text-green-800",
        "On Progress": "bg-yellow-100 text-yellow-800",
        "Fulfilled": "bg-blue-100 text-blue-800",
        "Rejected": "bg-red-100 text-red-800",
      };
      return (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const dateStr = row.getValue("created_at") as string;
      return <div>{dateStr.split("T")[0]}</div>;
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = (row.original as any).id;
      return (
        <a
          href={`/material-requests/${id}`}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
          View
        </a>
      );
    },
  },
];

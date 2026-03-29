import { MaterialRequestDetail, MaterialRequestDetailData, MaterialRequestDetailItem } from "@/components/material-request-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MaterialRequestResponse {
  data?: {
    id: string;
    title?: string;
    date?: string;
    status_name?: string;
    status?: string;
    note?: string;
    created_at?: string;
    updated_at?: string;
    requester_name?: string;
    material_request_details?: Array<{
        id?: string;
        material_request_id?: string;
        material_name?: string;
        description?: string;
        quantity?: number;
        unit?: string;
        type?: string;
        created_at?: string;
        updated_at?: string;
    }>;
  };
}

async function getMaterialRequestById(id: string): Promise<{ materialRequest: MaterialRequestDetailData; details: MaterialRequestDetailItem[] }> {
    const response = await fetch(`http://localhost:3001/api/v1/material-requests/${id}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch material request with id ${id}`);
  }

  const json = (await response.json()) as MaterialRequestResponse;

  const request = json?.data as Exclude<typeof json.data, undefined>;
  const details = json?.data?.material_request_details || [];


  if (!request) {
    notFound();
  }

  return {
    materialRequest: {
      id: request.id,
      title: request.title || "",
      requester_name: request.requester_name || "",
      date: request.date || "",
      status_name: request.status_name || request.status || "Unknown",
      note: request.note || "",
      created_at: request.created_at || "",
      updated_at: request.updated_at || "",
    },
    details: details.map((item: any) => ({
      id: String(item.id || item.material_request_detail_id || `${Math.random()}`),
      material_request_id: String(item.material_request_id || id),
      material_name: item.material_name || "",
      description: item.description || "",
      quantity: item.quantity ?? 0,
      unit: item.unit || "",
      type: item.type || "",
      created_at: item.created_at || "",
      updated_at: item.updated_at || "",
    })),
  };
}

export default async function MaterialRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { materialRequest, details } = await getMaterialRequestById(id);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-8 dark:bg-black">
      <main className="w-full max-w-6xl rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Material Request #{id}</h1>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-sm text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
        </div>

        <MaterialRequestDetail materialRequest={materialRequest} details={details} />
      </main>
    </div>
  );
}

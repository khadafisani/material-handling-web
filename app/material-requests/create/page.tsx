"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface CreateMaterialRequestDetailItem {
  id: string;
  material_name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  type?: string;
}

interface CreateMaterialRequestFormData {
  title: string;
  requester_by: string;
  date: string;
  note?: string;
}

const formatDateOnly = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  } catch {
    return dateString;
  }
};

export default function CreateMaterialRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateMaterialRequestFormData>({
    title: "",
    requester_by: "",
    date: formatDateOnly(new Date().toISOString()),
    note: "",
  });

  const [detailItems, setDetailItems] = useState<CreateMaterialRequestDetailItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDetailDialogOpen, setIsCreateDetailDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<CreateMaterialRequestDetailItem | null>(null);
  const [detailForm, setDetailForm] = useState<CreateMaterialRequestDetailItem | null>(null);
  const [createDetailForm, setCreateDetailForm] = useState<Partial<CreateMaterialRequestDetailItem> | null>(null);
  const [isCreatingDetail, setIsCreatingDetail] = useState(false);
  const [isDetailSaving, setIsDetailSaving] = useState(false);
  const [deletingDetail, setDeletingDetail] = useState<CreateMaterialRequestDetailItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onInputChange = (field: keyof CreateMaterialRequestFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateDetailDialog = () => {
    setCreateDetailForm({ material_name: "", description: "", quantity: 0, unit: "", type: "" });
    setIsCreateDetailDialogOpen(true);
  };

  const closeCreateDetailDialog = () => {
    setIsCreateDetailDialogOpen(false);
    setCreateDetailForm(null);
  };

  const onCreateDetailChange = (field: keyof CreateMaterialRequestDetailItem, value: string) => {
    if (!createDetailForm) return;
    setCreateDetailForm((prev) =>
      prev && ({ ...prev, [field]: field === "quantity" ? (value === "" ? "" : parseFloat(value)) : value })
    );
  };

  const createDetail = () => {
    if (!createDetailForm) return;
    setIsCreatingDetail(true);
    try {
      const newDetail: CreateMaterialRequestDetailItem = {
        id: `temp-${Math.random()}`,
        material_name: createDetailForm.material_name || "",
        description: createDetailForm.description,
        quantity: createDetailForm.quantity ?? 0,
        unit: createDetailForm.unit,
        type: createDetailForm.type,
      };
      setDetailItems((prev) => [...prev, newDetail]);
      closeCreateDetailDialog();
    } finally {
      setIsCreatingDetail(false);
    }
  };

  const openDetailDialog = (detail: CreateMaterialRequestDetailItem) => {
    setEditingDetail(detail);
    setDetailForm({ ...detail });
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setEditingDetail(null);
    setDetailForm(null);
  };

  const onDetailChange = (field: keyof CreateMaterialRequestDetailItem, value: string) => {
    if (!detailForm) return;
    setDetailForm((prev) =>
      prev && ({ ...prev, [field]: field === "quantity" ? (value === "" ? "" : parseFloat(value)) : value })
    );
  };

  const saveDetail = () => {
    if (!editingDetail || !detailForm) return;
    setIsDetailSaving(true);
    try {
      setDetailItems((prev) => prev.map((item) => (item.id === editingDetail.id ? { ...item, ...detailForm } : item)));
      closeDetailDialog();
    } finally {
      setIsDetailSaving(false);
    }
  };

  const openDeleteDialog = (detail: CreateMaterialRequestDetailItem) => {
    setDeletingDetail(detail);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingDetail(null);
  };

  const deleteDetail = () => {
    if (!deletingDetail) return;
    setIsDeleting(true);
    try {
      setDetailItems((prev) => prev.filter((item) => item.id !== deletingDetail.id));
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.requester_by || !form.date) {
      alert("Please fill in all required fields");
      return;
    }

    if (detailItems.length === 0) {
      alert("Please add at least one material request detail");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title,
      requester_by: form.requester_by,
      date: form.date,
      note: form.note || "",
      material_request_details: detailItems.map((item) => ({
        material_name: item.material_name,
        description: item.description || "",
        quantity: item.quantity ?? 0,
        unit: item.unit || "",
        type: item.type || "",
      })),
    };

    try {
      const response = await fetch("http://localhost:3001/api/v1/material-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create material request");

      const created = await response.json();
      const createdId = created?.data?.id;

      if (createdId) {
        router.push(`/material-requests/${createdId}`);
      } else {
        throw new Error("No ID returned from API");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create material request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = useMemo(
    () => [
      { key: "title", label: "Title", inputType: "text" },
      { key: "requester_by", label: "Requester", inputType: "text" },
      { key: "date", label: "Requested Date", inputType: "date" },
      { key: "note", label: "Note", inputType: "text" },
    ] as const,
    []
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-8 dark:bg-black">
      <main className="w-full max-w-6xl rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create Material Request</h1>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 font-medium text-sm text-blue-600 hover:bg-blue-100 hover:text-blue-700">
            Back to List
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {formFields.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">{field.label}</label>
                <input
                  type={field.inputType}
                  value={form[field.key as keyof CreateMaterialRequestFormData] ?? ""}
                  onChange={(e) => onInputChange(field.key as keyof CreateMaterialRequestFormData, e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
            ))}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Material Request Detail</h3>
              <Button variant="default" size="sm" onClick={openCreateDetailDialog}>
                Add Item
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-1 gap-2 border-b bg-gray-50 p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid-cols-7">
                <div>Name</div>
                <div>Description</div>
                <div>Quantity</div>
                <div>Unit</div>
                <div>Type</div>
                <div>Action</div>
              </div>

              {detailItems.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">No items added yet</div>
              ) : (
                detailItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 gap-2 border-b p-3 text-sm md:grid-cols-7">
                    <div className="whitespace-normal break-words">{item.material_name}</div>
                    <div className="whitespace-normal break-words">{item.description || "-"}</div>
                    <div className="w-full">{item.quantity ?? "-"}</div>
                    <div className="whitespace-normal break-words">{item.unit || "-"}</div>
                    <div className="whitespace-normal break-words">{item.type || "-"}</div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" onClick={() => openDetailDialog(item)} className="p-1">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteDialog(item)} className="p-1">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => router.push("/")}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material Request Detail</DialogTitle>
            <DialogDescription>Modify item fields and save to update.</DialogDescription>
          </DialogHeader>

          {detailForm && (
            <div className="grid grid-cols-1 gap-4 py-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={detailForm.material_name}
                  onChange={(e) => onDetailChange("material_name", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={detailForm.description ?? ""}
                  onChange={(e) => onDetailChange("description", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={detailForm.quantity ?? 0}
                  onChange={(e) => onDetailChange("quantity", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <input
                  type="text"
                  value={detailForm.unit ?? ""}
                  onChange={(e) => onDetailChange("unit", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <input
                  type="text"
                  value={detailForm.type ?? ""}
                  onChange={(e) => onDetailChange("type", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveDetail} disabled={isDetailSaving}>
              {isDetailSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material Request Item</DialogTitle>
            <DialogDescription>Are you sure you want to delete this item? This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm">{deletingDetail?.material_name ?? "Item"}</p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={deleteDetail} disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDetailDialogOpen} onOpenChange={setIsCreateDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Material Request Detail</DialogTitle>
            <DialogDescription>Add a new item to this material request.</DialogDescription>
          </DialogHeader>

          {createDetailForm && (
            <div className="grid grid-cols-1 gap-4 py-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={createDetailForm.material_name ?? ""}
                  onChange={(e) => onCreateDetailChange("material_name", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={createDetailForm.description ?? ""}
                  onChange={(e) => onCreateDetailChange("description", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={createDetailForm.quantity ?? 0}
                  onChange={(e) => onCreateDetailChange("quantity", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <input
                  type="text"
                  value={createDetailForm.unit ?? ""}
                  onChange={(e) => onCreateDetailChange("unit", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <input
                  type="text"
                  value={createDetailForm.type ?? ""}
                  onChange={(e) => onCreateDetailChange("type", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={createDetail} disabled={isCreatingDetail}>
              {isCreatingDetail ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

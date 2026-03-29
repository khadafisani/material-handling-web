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
import { useMemo, useState } from "react";

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    // format date to YYYY-MM-DD HH:mm:ss
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  } catch {
    return dateString;
  }
};

const formatDateOnly = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    // format date to YYYY-MM-DD only for date input
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  } catch {
    return dateString;
  }
};

const STATUS_OPTIONS = [
  { label: "Requested", value: "0" },
  { label: "Progress", value: "1" },
  { label: "Fulfilled", value: "2" },
  { label: "Rejected", value: "3" },
];

export interface MaterialRequestDetailItem {
  id: string;
  material_request_id?: string;
  material_name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialRequestDetailData {
  id: string;
  title: string;
  date: string;
  status_name: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
  // ignoring created_by, updated_by, deleted_by as requested
}

interface MaterialRequestDetailProps {
  materialRequest: MaterialRequestDetailData;
  details: MaterialRequestDetailItem[];
}

export function MaterialRequestDetail({ materialRequest, details }: MaterialRequestDetailProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<MaterialRequestDetailItem | null>(null);
  const [detailForm, setDetailForm] = useState<MaterialRequestDetailItem | null>(null);
  const [isDetailSaving, setIsDetailSaving] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDetail, setDeletingDetail] = useState<MaterialRequestDetailItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<MaterialRequestDetailItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<MaterialRequestDetailData>({
    ...materialRequest,
    date: formatDateOnly(materialRequest.date),
    created_at: formatDate(materialRequest.created_at),
    updated_at: formatDate(materialRequest.updated_at),
  });
  const [detailItems, setDetailItems] = useState<MaterialRequestDetailItem[]>(
    details.map(detail => ({
      ...detail,
      created_at: formatDate(detail.created_at),
      updated_at: formatDate(detail.updated_at),
    }))
  );

  const onInputChange = (field: keyof MaterialRequestDetailData, value: string) => {
    const formattedValue = (field === "created_at" || field === "updated_at") ? formatDate(value) : value;
    setForm((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const openDetailDialog = (detail: MaterialRequestDetailItem) => {
    setEditingDetail(detail);
    setDetailForm({ ...detail });
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setEditingDetail(null);
    setDetailForm(null);
  };

  const openDeleteDialog = (detail: MaterialRequestDetailItem) => {
    setDeletingDetail(detail);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingDetail(null);
  };

  const deleteDetail = async () => {
    if (!deletingDetail) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/material-requests/${materialRequest.id}/details/${deletingDetail.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete detail item");
      }

      setDetailItems((prev) => prev.filter((item) => item.id !== deletingDetail.id));
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete detail error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateDialog = () => {
    setCreateForm({
      material_name: "",
      description: "",
      quantity: 0,
      unit: "",
      type: "",
    });
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreateForm(null);
  };

  const onCreateChange = (field: keyof MaterialRequestDetailItem, value: string) => {
    if (!createForm) return;
    setCreateForm((prev) => prev && ({ ...prev, [field]: field === "quantity" ? (value === "" ? "" : parseFloat(value)) : value }));
  };

  const createDetail = async () => {
    if (!createForm) return;
    setIsCreating(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/material-requests/${materialRequest.id}/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_name: createForm.material_name || "",
          description: createForm.description || "",
          quantity: createForm.quantity || 0,
          unit: createForm.unit || "",
          type: createForm.type || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create detail item");
      }

      const created = await response.json();
      const newItem = created?.data || createForm;
      const newDetail: MaterialRequestDetailItem = {
        id: (newItem as any)?.id ? String((newItem as any).id) : String(Math.random()),
        material_request_id: materialRequest.id,
        material_name: (newItem as any)?.material_name || "",
        description: (newItem as any)?.description,
        quantity: (newItem as any)?.quantity ?? 0,
        unit: (newItem as any)?.unit,
        type: (newItem as any)?.type,
        created_at: (newItem as any)?.created_at,
        updated_at: (newItem as any)?.updated_at,
      };
      setDetailItems((prev) => [...prev, newDetail]);
      closeCreateDialog();
    } catch (error) {
      console.error("Failed to create detail:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const onDetailChange = (field: keyof MaterialRequestDetailItem, value: string) => {
    if (!detailForm) return;
    setDetailForm((prev) => prev && ({ ...prev, [field]: field === "quantity" ? (value === "" ? "" : parseFloat(value)) : value }));
  };

  const saveDetail = async () => {
    if (!editingDetail || !detailForm) return;
    setIsDetailSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/material-requests/${materialRequest.id}/details/${editingDetail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_name: detailForm.material_name,
          description: detailForm.description || "",
          quantity: detailForm.quantity || 0,
          unit: detailForm.unit || "",
          type: detailForm.type || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to update detail item");

      const updated = await response.json();
      const updatedItem = updated?.data || detailForm;

      setDetailItems((prev) => prev.map((item) => (item.id === editingDetail.id ? { ...item, ...updatedItem } : item)));
      closeDetailDialog();
    } catch (error) {
      console.error("Failed to save detail:", error);
    } finally {
      setIsDetailSaving(false);
    }
  };

  const save = async () => {
    setIsSaving(true);
    try {
      // Map status_name to status code for API
      const statusCode = STATUS_OPTIONS.find(opt => opt.label === form.status_name)?.value || "0";
      const dataToSave = {
        title: form.title,
        date: form.date,
        status: statusCode,
        note: form.note || "",
      };

      const response = await fetch(`http://localhost:3001/api/v1/material-requests/${materialRequest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        throw new Error("Failed to update material request");
      }

      console.log("Material request updated successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formFields = useMemo(() => [
    { key: "title", label: "Title", type: "text", editable: true, inputType: "text" },
    { key: "date", label: "Requested Date", type: "date", editable: true, inputType: "date" },
    { key: "status_name", label: "Status", type: "text", editable: true, inputType: "select" },
    { key: "note", label: "Note", type: "text", editable: true, inputType: "text" },
    { key: "created_at", label: "Created At", type: "text", editable: false, inputType: "text" },
    { key: "updated_at", label: "Last Update", type: "text", editable: false, inputType: "text" },
  ] as const, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
          {!isEditMode ? (
            <Button variant="default" onClick={() => setIsEditMode(true)}>
              Edit
            </Button>
          ) : (
            <Button variant="secondary" onClick={save} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {formFields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-sm font-medium text-slate-700">{field.label}</label>
            {field.inputType === "select" ? (
              <select
                value={form[field.key] ?? ""}
                disabled={!field.editable || !isEditMode}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${isEditMode && field.editable ? "border-sky-500 focus:ring-2 focus:ring-sky-300" : "border-gray-200 bg-gray-50"}`}
              >
                <option value="">Select Status</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.inputType}
                value={form[field.key] ?? ""}
                disabled={!field.editable || !isEditMode}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${isEditMode && field.editable ? "border-sky-500 focus:ring-2 focus:ring-sky-300" : "border-gray-200 bg-gray-50"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Material Request Detail</h3>
          <Button onClick={openCreateDialog} variant="default" size="sm">
            Create
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="grid grid-cols-1 gap-2 border-b bg-gray-50 p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid-cols-7">
            <div>Name</div>
            <div>Description</div>
            <div>Quantity</div>
            <div>Unit</div>
            <div>Type</div>
            <div>Last Update</div>
            <div>Action</div>
          </div>

          {detailItems.map((item, index) => (
            <div key={item.id ?? index} className="grid grid-cols-1 gap-2 border-b p-3 text-sm md:grid-cols-7">
              <div className="whitespace-normal break-words">{item.material_name}</div>
              <div className="whitespace-normal break-words">{item.description || "-"}</div>
              <div className="w-full">{item.quantity ?? "-"}</div>
              <div className="whitespace-normal break-words">{item.unit || "-"}</div>
              <div className="whitespace-normal break-words">{item.type || "-"}</div>
              <div className="w-full">{formatDate(item.updated_at)}</div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => openDetailDialog(item)} className="p-1">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => openDeleteDialog(item)} className="p-1">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Material Request Detail</DialogTitle>
            <DialogDescription>Add a new item to this material request.</DialogDescription>
          </DialogHeader>

          {createForm && (
            <div className="grid grid-cols-1 gap-4 py-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={createForm.material_name ?? ""}
                  onChange={(e) => onCreateChange("material_name", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={createForm.description ?? ""}
                  onChange={(e) => onCreateChange("description", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={createForm.quantity ?? 0}
                  onChange={(e) => onCreateChange("quantity", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <input
                  type="text"
                  value={createForm.unit ?? ""}
                  onChange={(e) => onCreateChange("unit", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <input
                  type="text"
                  value={createForm.type ?? ""}
                  onChange={(e) => onCreateChange("type", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={createDetail} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

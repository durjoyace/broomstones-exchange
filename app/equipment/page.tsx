"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ConditionBadge } from "@/components/data-display/condition-badge";
import { EmptyState } from "@/components/data-display/empty-state";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { SearchInput } from "@/components/forms/search-input";
import {
  EQUIPMENT_TYPES,
  EQUIPMENT_CONDITIONS,
  EQUIPMENT_STATUSES,
} from "@/lib/constants";
import type { Equipment } from "@/lib/db";

type FormData = {
  type: string;
  size: string;
  brand: string;
  condition: string;
  status: string;
  notes: string;
  photo_url: string;
};

const initialForm: FormData = {
  type: "shoes",
  size: "",
  brand: "",
  condition: "good",
  status: "available",
  notes: "",
  photo_url: "",
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [filter, setFilter] = useState({ type: "", status: "", search: "" });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch("/api/equipment");
      setEquipment(await res.json());
    } catch {
      toast.error("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/equipment/${editingId}` : "/api/equipment";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? "Equipment updated" : "Equipment added");
        fetchEquipment();
        closeForm();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save equipment");
    }
  };

  const handleEdit = (item: Equipment) => {
    setFormData({
      type: item.type,
      size: item.size || "",
      brand: item.brand || "",
      condition: item.condition,
      status: item.status,
      notes: item.notes || "",
      photo_url: item.photoUrl || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Equipment removed");
        fetchEquipment();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const filtered = equipment.filter((item) => {
    if (filter.type && item.type !== filter.type) return false;
    if (filter.status && item.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return (
        item.brand?.toLowerCase().includes(q) ||
        item.size?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment</h1>
        <Button
          onClick={() => {
            setFormData(initialForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Equipment
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Types</option>
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value })
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Statuses</option>
                {EQUIPMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Search</Label>
              <SearchInput
                value={filter.search}
                onChange={(v) => setFilter({ ...filter, search: v })}
                placeholder="Brand, size, notes..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Equipment" : "Add Equipment"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => update("type", e.target.value)}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    {EQUIPMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Size</Label>
                  <Input
                    value={formData.size}
                    onChange={(e) => update("size", e.target.value)}
                    placeholder={
                      formData.type === "shoes"
                        ? "e.g., 5, 6, 7"
                        : "e.g., Junior, Adult"
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="e.g., BalancePlus, Asham"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Condition</Label>
                  <select
                    value={formData.condition}
                    onChange={(e) => update("condition", e.target.value)}
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {EQUIPMENT_CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {editingId && (
                  <div>
                    <Label>Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => update("status", e.target.value)}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {EQUIPMENT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <Label>Photo URL</Label>
                  <Input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => update("photo_url", e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="mt-1"
                  />
                  {formData.photo_url && (
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded mt-2"
                      onError={(e) =>
                        (e.currentTarget.style.display = "none")
                      }
                    />
                  )}
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? "Save Changes" : "Add Equipment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Photo</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    icon={Package}
                    title="No equipment found"
                    description="Add some equipment to get started."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={`${item.type} ${item.size || ""}`}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize font-medium">
                    {item.type}
                  </TableCell>
                  <TableCell>{item.size || "-"}</TableCell>
                  <TableCell>{item.brand || "-"}</TableCell>
                  <TableCell>
                    <ConditionBadge condition={item.condition} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {item.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        }
                        title="Delete equipment?"
                        description="This will mark the equipment as retired. Active checkouts will not be affected."
                        confirmLabel="Delete"
                        variant="destructive"
                        onConfirm={() => handleDelete(item.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="mt-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {equipment.length} items
      </p>
    </div>
  );
}

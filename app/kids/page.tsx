"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { SearchInput } from "@/components/forms/search-input";
import { GRADE_OPTIONS } from "@/lib/constants";

type KidRow = {
  id: number;
  name: string;
  grade: string | null;
  shoeSize: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  notes: string | null;
  activeCheckouts: number;
};

type FormData = {
  name: string;
  grade: string;
  shoe_size: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  notes: string;
};

const initialForm: FormData = {
  name: "",
  grade: "",
  shoe_size: "",
  parent_name: "",
  parent_email: "",
  parent_phone: "",
  notes: "",
};

export default function KidsPage() {
  const [kids, setKids] = useState<KidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchKids();
  }, []);

  const fetchKids = async () => {
    try {
      const res = await fetch("/api/kids");
      setKids(await res.json());
    } catch {
      toast.error("Failed to load kids");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/kids/${editingId}` : "/api/kids";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingId ? "Kid updated" : "Kid added");
        fetchKids();
        closeForm();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleEdit = (kid: KidRow) => {
    setFormData({
      name: kid.name,
      grade: kid.grade || "",
      shoe_size: kid.shoeSize || "",
      parent_name: kid.parentName || "",
      parent_email: kid.parentEmail || "",
      parent_phone: kid.parentPhone || "",
      notes: kid.notes || "",
    });
    setEditingId(kid.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/kids/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Kid removed");
        fetchKids();
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

  const filtered = kids.filter((kid) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      kid.name.toLowerCase().includes(q) ||
      kid.parentName?.toLowerCase().includes(q) ||
      kid.shoeSize?.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Little Rockers</h1>
        <Button
          onClick={() => {
            setFormData(initialForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Kid
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, parent, or shoe size..."
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Kid" : "Add Kid"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grade</Label>
                    <select
                      value={formData.grade}
                      onChange={(e) => update("grade", e.target.value)}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select...</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Shoe Size</Label>
                    <Input
                      value={formData.shoe_size}
                      onChange={(e) => update("shoe_size", e.target.value)}
                      placeholder="e.g., 5, 6, 7"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Parent/Guardian Contact
                </p>
                <div>
                  <Label>Parent Name</Label>
                  <Input
                    value={formData.parent_name}
                    onChange={(e) => update("parent_name", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.parent_email}
                      onChange={(e) => update("parent_email", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(e) => update("parent_phone", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={2}
                    placeholder="Any special considerations..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? "Save Changes" : "Add Kid"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kids Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Users}
              title="No kids found"
              description="Add some Little Rockers to get started."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((kid) => (
            <Card key={kid.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{kid.name}</h3>
                  {Number(kid.activeCheckouts) > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {kid.activeCheckouts} out
                    </Badge>
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Grade:</span>{" "}
                    {kid.grade || "-"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Shoe Size:</span>{" "}
                    {kid.shoeSize || "-"}
                  </p>
                  {kid.parentName && (
                    <p>
                      <span className="text-muted-foreground">Parent:</span>{" "}
                      {kid.parentName}
                    </p>
                  )}
                  {kid.parentEmail && (
                    <p className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${kid.parentEmail}`}
                        className="text-primary hover:underline truncate"
                      >
                        {kid.parentEmail}
                      </a>
                    </p>
                  )}
                  {kid.parentPhone && (
                    <p className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                      {kid.parentPhone}
                    </p>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(kid)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" />
                        <span className="text-destructive">Delete</span>
                      </Button>
                    }
                    title="Remove this kid?"
                    description="This will soft-delete the record. Checkout history is preserved."
                    confirmLabel="Remove"
                    variant="destructive"
                    onConfirm={() => handleDelete(kid.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {kids.length} Little Rockers
      </p>
    </div>
  );
}

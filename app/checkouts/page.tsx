"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  RotateCcw,
  ClipboardList,
  History,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/data-display/empty-state";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

type CheckoutRow = {
  id: number;
  equipmentId: number;
  kidId: number;
  checkedOutAt: string;
  returnedAt: string | null;
  notes: string | null;
  kidName: string;
  equipmentType: string;
  equipmentSize: string | null;
  equipmentBrand: string | null;
};

type EquipmentRow = {
  id: number;
  type: string;
  size: string | null;
  brand: string | null;
  status: string;
};

type KidRow = {
  id: number;
  name: string;
  shoeSize: string | null;
};

export default function CheckoutsPage() {
  const [checkouts, setCheckouts] = useState<CheckoutRow[]>([]);
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [kids, setKids] = useState<KidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkReturning, setBulkReturning] = useState(false);
  const [formData, setFormData] = useState({
    equipment_id: "",
    kid_id: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [checkoutsRes, equipmentRes, kidsRes] = await Promise.all([
        fetch("/api/checkouts?active=true"),
        fetch("/api/equipment"),
        fetch("/api/kids"),
      ]);
      const [checkoutsData, equipmentData, kidsData] = await Promise.all([
        checkoutsRes.json(),
        equipmentRes.json(),
        kidsRes.json(),
      ]);
      setCheckouts(checkoutsData);
      setEquipment(equipmentData);
      setKids(kidsData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCheckouts = async () => {
    try {
      const res = await fetch("/api/checkouts?active=false");
      setCheckouts(await res.json());
      setShowHistory(true);
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to load checkout history");
    }
  };

  const fetchActiveCheckouts = async () => {
    try {
      const res = await fetch("/api/checkouts?active=true");
      setCheckouts(await res.json());
      setShowHistory(false);
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to load active checkouts");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment_id: parseInt(formData.equipment_id),
          kid_id: parseInt(formData.kid_id),
          notes: formData.notes || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Equipment checked out successfully");
        fetchData();
        closeForm();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to checkout");
      }
    } catch {
      toast.error("Failed to checkout equipment");
    }
  };

  const handleReturn = async (checkoutId: number) => {
    try {
      const res = await fetch(`/api/checkouts/${checkoutId}/return`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Equipment returned");
        fetchData();
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(checkoutId);
          return next;
        });
      } else {
        toast.error("Failed to return equipment");
      }
    } catch {
      toast.error("Failed to return equipment");
    }
  };

  const handleBulkReturn = async () => {
    if (selectedIds.size === 0) return;
    setBulkReturning(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/checkouts/${id}/return`, { method: "POST" })
        )
      );
      toast.success(`${selectedIds.size} item(s) returned`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error("Some returns failed");
    } finally {
      setBulkReturning(false);
    }
  };

  const handleReturnAll = async () => {
    if (checkouts.length === 0) return;
    setBulkReturning(true);
    try {
      await Promise.all(
        checkouts.map((c) =>
          fetch(`/api/checkouts/${c.id}/return`, { method: "POST" })
        )
      );
      toast.success(`All ${checkouts.length} item(s) returned`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error("Some returns failed");
    } finally {
      setBulkReturning(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === checkouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(checkouts.map((c) => c.id)));
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({ equipment_id: "", kid_id: "", notes: "" });
  };

  const availableEquipment = equipment.filter((e) => e.status === "available");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const selectClassName =
    "mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Checkouts</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Check Out Equipment
        </Button>
      </div>

      {/* Toggle Active/History + Bulk Actions */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Button
          variant={!showHistory ? "default" : "outline"}
          onClick={fetchActiveCheckouts}
        >
          <ClipboardList className="h-4 w-4 mr-1" />
          Active Checkouts
        </Button>
        <Button
          variant={showHistory ? "default" : "outline"}
          onClick={fetchAllCheckouts}
        >
          <History className="h-4 w-4 mr-1" />
          All History
        </Button>

        {!showHistory && checkouts.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            {selectedIds.size > 0 && (
              <ConfirmDialog
                trigger={
                  <Button
                    variant="outline"
                    disabled={bulkReturning}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {bulkReturning
                      ? "Returning..."
                      : `Return Selected (${selectedIds.size})`}
                  </Button>
                }
                title="Return selected items?"
                description={`This will return ${selectedIds.size} checked-out item(s) and mark them as available.`}
                confirmLabel="Return Selected"
                onConfirm={handleBulkReturn}
              />
            )}
            <ConfirmDialog
              trigger={
                <Button variant="destructive" disabled={bulkReturning}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Return All
                </Button>
              }
              title="Return ALL items?"
              description={`This will return all ${checkouts.length} checked-out items. This is typically done at end of season.`}
              confirmLabel="Return All"
              variant="destructive"
              onConfirm={handleReturnAll}
            />
          </>
        )}
      </div>

      {/* Season Summary Banner */}
      {!showHistory && checkouts.length > 0 && (
        <Card className="bg-warm-50 border-warm-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  Season Status: <span className="text-amber-700">{checkouts.length} items out</span> across{" "}
                  {new Set(checkouts.map((c) => c.kidId)).size} kids
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use &quot;Return All&quot; above to close out the season and make everything available again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checkout Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Check Out Equipment</h2>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <Label>
                    Equipment <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={formData.equipment_id}
                    onChange={(e) =>
                      setFormData({ ...formData, equipment_id: e.target.value })
                    }
                    className={selectClassName}
                    required
                  >
                    <option value="">Select equipment...</option>
                    {availableEquipment.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.type} - Size {e.size || "N/A"}{" "}
                        {e.brand ? `(${e.brand})` : ""}
                      </option>
                    ))}
                  </select>
                  {availableEquipment.length === 0 && (
                    <p className="text-sm text-destructive mt-1">
                      No available equipment
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Kid <span className="text-destructive">*</span>
                  </Label>
                  <select
                    value={formData.kid_id}
                    onChange={(e) =>
                      setFormData({ ...formData, kid_id: e.target.value })
                    }
                    className={selectClassName}
                    required
                  >
                    <option value="">Select kid...</option>
                    {kids.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} {k.shoeSize ? `(Size ${k.shoeSize})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Any notes about this checkout..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={availableEquipment.length === 0}
                  >
                    Check Out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Checkouts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {!showHistory && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      checkouts.length > 0 &&
                      selectedIds.size === checkouts.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Kid</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Checked Out</TableHead>
              {showHistory && <TableHead>Returned</TableHead>}
              <TableHead className="hidden md:table-cell">Notes</TableHead>
              {!showHistory && (
                <TableHead className="text-right">Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showHistory ? 6 : 7}>
                  <EmptyState
                    icon={PackageCheck}
                    title={
                      showHistory
                        ? "No checkout history yet"
                        : "No active checkouts"
                    }
                    description={
                      showHistory
                        ? "Checkouts will appear here once equipment is checked out."
                        : "Click 'Check Out Equipment' to get started."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              checkouts.map((checkout) => (
                <TableRow
                  key={checkout.id}
                  data-state={
                    selectedIds.has(checkout.id) ? "selected" : undefined
                  }
                >
                  {!showHistory && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(checkout.id)}
                        onCheckedChange={() => toggleSelect(checkout.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {checkout.kidName}
                  </TableCell>
                  <TableCell className="capitalize">
                    {checkout.equipmentType}
                    {checkout.equipmentBrand && (
                      <span className="text-muted-foreground text-xs ml-1">
                        ({checkout.equipmentBrand})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{checkout.equipmentSize || "-"}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(checkout.checkedOutAt)}
                  </TableCell>
                  {showHistory && (
                    <TableCell>
                      {checkout.returnedAt ? (
                        <span className="text-sm">
                          {formatDate(checkout.returnedAt)}
                        </span>
                      ) : (
                        <StatusBadge status="checked_out" />
                      )}
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {checkout.notes || "-"}
                  </TableCell>
                  {!showHistory && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturn(checkout.id)}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Return
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="mt-3 text-sm text-muted-foreground">
        {showHistory
          ? `${checkouts.length} total checkouts`
          : `${checkouts.length} active checkouts`}
      </p>
    </div>
  );
}

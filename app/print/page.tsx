"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Printer, ArrowLeft, ClipboardList, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/data-display/status-badge";
import { ConditionBadge } from "@/components/data-display/condition-badge";
import { EmptyState } from "@/components/data-display/empty-state";

type CheckoutRow = {
  id: number;
  kidName: string;
  equipmentType: string;
  equipmentSize: string | null;
  equipmentBrand: string | null;
  checkedOutAt: string;
};

type EquipmentRow = {
  id: number;
  type: string;
  size: string | null;
  brand: string | null;
  status: string;
  condition: string;
};

export default function PrintPage() {
  const [checkouts, setCheckouts] = useState<CheckoutRow[]>([]);
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"checkouts" | "inventory">("checkouts");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [checkoutsRes, equipmentRes] = await Promise.all([
        fetch("/api/checkouts?active=true"),
        fetch("/api/equipment"),
      ]);
      const [checkoutsData, equipmentData] = await Promise.all([
        checkoutsRes.json(),
        equipmentRes.json(),
      ]);
      setCheckouts(checkoutsData);
      setEquipment(equipmentData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const availableEquipment = equipment.filter((e) => e.status === "available");
  const checkedOutEquipment = equipment.filter(
    (e) => e.status === "checked_out"
  );

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
      {/* Screen-only controls */}
      <div className="print:hidden mb-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print This Page
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant={view === "checkouts" ? "default" : "outline"}
            onClick={() => setView("checkouts")}
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            Active Checkouts
          </Button>
          <Button
            variant={view === "inventory" ? "default" : "outline"}
            onClick={() => setView("inventory")}
          >
            <Package className="h-4 w-4 mr-1" />
            Full Inventory
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print:p-0">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Broomstones Equipment Exchange</h1>
          <p className="text-muted-foreground">
            {view === "checkouts" ? "Active Checkouts" : "Equipment Inventory"}{" "}
            &mdash; {new Date().toLocaleDateString()}
          </p>
        </div>

        {view === "checkouts" ? (
          <>
            {checkouts.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No active checkouts"
                description="All equipment has been returned."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kid</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead className="text-center print:hidden">
                      Returned?
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkouts.map((checkout) => (
                    <TableRow key={checkout.id}>
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
                      <TableCell>{formatDate(checkout.checkedOutAt)}</TableCell>
                      <TableCell className="text-center print:hidden">
                        <div className="w-5 h-5 border-2 border-muted-foreground/40 rounded mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Total: {checkouts.length} active checkout
              {checkouts.length !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <>
            <h2 className="font-bold text-lg mb-2 mt-6">
              Available ({availableEquipment.length})
            </h2>
            {availableEquipment.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-6">
                No available equipment
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableEquipment.map((item) => (
                    <TableRow key={item.id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <h2 className="font-bold text-lg mb-2 mt-8">
              Checked Out ({checkedOutEquipment.length})
            </h2>
            {checkedOutEquipment.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No equipment currently checked out
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkedOutEquipment.map((item) => (
                    <TableRow key={item.id}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

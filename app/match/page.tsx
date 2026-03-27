"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Users,
  Package,
  Footprints,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/data-display/stat-card";
import { ConditionBadge } from "@/components/data-display/condition-badge";
import { StatusBadge } from "@/components/data-display/status-badge";
import { EmptyState } from "@/components/data-display/empty-state";

type KidRow = {
  id: number;
  name: string;
  grade: string | null;
  shoeSize: string | null;
  activeCheckouts: number;
};

type EquipmentRow = {
  id: number;
  type: string;
  size: string | null;
  brand: string | null;
  status: string;
  condition: string;
};

export default function MatchPage() {
  const [equipment, setEquipment] = useState<EquipmentRow[]>([]);
  const [kids, setKids] = useState<KidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [checkoutModal, setCheckoutModal] = useState<{
    equipment: EquipmentRow;
    kid: KidRow;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, kidsRes] = await Promise.all([
        fetch("/api/equipment"),
        fetch("/api/kids"),
      ]);
      const [equipmentData, kidsData] = await Promise.all([
        equipmentRes.json(),
        kidsRes.json(),
      ]);
      setEquipment(equipmentData);
      setKids(kidsData);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckout = async () => {
    if (!checkoutModal) return;
    try {
      const res = await fetch("/api/checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment_id: checkoutModal.equipment.id,
          kid_id: checkoutModal.kid.id,
          notes: `Quick match checkout - Size ${checkoutModal.equipment.size}`,
        }),
      });

      if (res.ok) {
        toast.success(
          `${checkoutModal.equipment.type} checked out to ${checkoutModal.kid.name}`
        );
        fetchData();
        setCheckoutModal(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to checkout");
      }
    } catch {
      toast.error("Failed to checkout equipment");
    }
  };

  // Group kids by shoe size
  const kidsBySize = kids.reduce(
    (acc, kid) => {
      const size = kid.shoeSize || "Unknown";
      if (!acc[size]) acc[size] = [];
      acc[size].push(kid);
      return acc;
    },
    {} as Record<string, KidRow[]>
  );

  // Get available shoes by size
  const availableShoesBySize = equipment
    .filter((e) => e.type === "shoes" && e.status === "available")
    .reduce(
      (acc, shoe) => {
        const size = shoe.size || "Unknown";
        if (!acc[size]) acc[size] = [];
        acc[size].push(shoe);
        return acc;
      },
      {} as Record<string, EquipmentRow[]>
    );

  // Get all unique sizes
  const allSizes = [
    ...new Set([
      ...Object.keys(kidsBySize),
      ...Object.keys(availableShoesBySize),
    ]),
  ]
    .filter((s) => s !== "Unknown")
    .sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

  const filteredSizes = selectedSize ? [selectedSize] : allSizes;

  const selectClassName =
    "mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Match Equipment</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Kids" value={kids.length} icon={Users} />
        <StatCard
          label="With Shoe Size"
          value={kids.filter((k) => k.shoeSize).length}
          icon={Footprints}
        />
        <StatCard
          label="Available Shoes"
          value={
            equipment.filter(
              (e) => e.type === "shoes" && e.status === "available"
            ).length
          }
          icon={Package}
          className="text-emerald-700"
        />
        <StatCard
          label="Unique Sizes"
          value={allSizes.length}
          icon={ArrowRightLeft}
        />
      </div>

      {/* Size Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Label>Filter by Size</Label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className={`${selectClassName} max-w-xs`}
          >
            <option value="">All Sizes</option>
            {allSizes.map((size) => (
              <option key={size} value={size}>
                Size {size}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Quick Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Checkout</h2>
              <div className="space-y-3 mb-6">
                <p>
                  <span className="text-muted-foreground">Kid:</span>{" "}
                  <span className="font-medium">{checkoutModal.kid.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Equipment:</span>{" "}
                  <span className="font-medium">
                    {checkoutModal.equipment.type} - Size{" "}
                    {checkoutModal.equipment.size}
                    {checkoutModal.equipment.brand &&
                      ` (${checkoutModal.equipment.brand})`}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Condition:</span>
                  <ConditionBadge
                    condition={checkoutModal.equipment.condition}
                  />
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCheckoutModal(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleQuickCheckout}>
                  <Zap className="h-4 w-4 mr-1" />
                  Confirm Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Size Cards */}
      {filteredSizes.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ArrowRightLeft}
              title="No sizes to display"
              description="Add kids and equipment to get started with matching."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSizes.map((size) => {
            const kidsForSize = kidsBySize[size] || [];
            const availableForSize = availableShoesBySize[size] || [];
            const needsMore = kidsForSize.length > availableForSize.length;

            return (
              <Card key={size}>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>Size {size}</CardTitle>
                    <div className="flex gap-3 items-center text-sm">
                      <span>{kidsForSize.length} kids need</span>
                      <span
                        className={`font-medium ${needsMore ? "text-destructive" : "text-emerald-600"}`}
                      >
                        {availableForSize.length} available
                      </span>
                      {needsMore && (
                        <Badge
                          variant="destructive"
                          className="text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Need {kidsForSize.length - availableForSize.length}{" "}
                          more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                    {/* Kids needing this size */}
                    <div className="p-4">
                      <h4 className="font-medium text-muted-foreground mb-3 text-sm">
                        Kids Needing Size {size}
                      </h4>
                      {kidsForSize.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No kids registered for this size
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {kidsForSize.map((kid) => (
                            <div
                              key={kid.id}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                            >
                              <div>
                                <span className="font-medium">{kid.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {kid.grade || "No grade"}
                                </span>
                              </div>
                              {Number(kid.activeCheckouts) > 0 ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs"
                                >
                                  Has equipment
                                </Badge>
                              ) : availableForSize.length > 0 ? (
                                <Button
                                  size="xs"
                                  onClick={() =>
                                    setCheckoutModal({
                                      equipment: availableForSize[0],
                                      kid,
                                    })
                                  }
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  Quick Match
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  No shoes available
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Available equipment */}
                    <div className="p-4">
                      <h4 className="font-medium text-muted-foreground mb-3 text-sm">
                        Available Size {size} Shoes
                      </h4>
                      {availableForSize.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No shoes available in this size
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {availableForSize.map((shoe) => (
                            <div
                              key={shoe.id}
                              className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {shoe.brand || "Unknown brand"}
                                </span>
                                <ConditionBadge condition={shoe.condition} />
                              </div>
                              <StatusBadge status="available" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

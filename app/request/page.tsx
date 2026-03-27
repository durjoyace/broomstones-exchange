"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Footprints,
  Brush,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Kid = { id: number; name: string; shoeSize?: string | null };
type SizeCount = { size: string; count: number };

export default function RequestPage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [available, setAvailable] = useState<{ shoes: SizeCount[]; brooms: SizeCount[] }>({
    shoes: [],
    brooms: [],
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    kid_id: "",
    equipment_type: "shoes",
    size: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/kids"), fetch("/api/stats")])
      .then(([kidsRes, statsRes]) =>
        Promise.all([kidsRes.json(), statsRes.json()])
      )
      .then(([kidsData, statsData]) => {
        setKids(kidsData);
        setAvailable({
          shoes: statsData.availableShoesBySize || [],
          brooms: statsData.availableBroomsBySize || [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: parseInt(formData.kid_id),
          equipment_type: formData.equipment_type,
          size: formData.size,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Request submitted!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit request");
      }
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!formData.kid_id || !formData.size) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kid_id: parseInt(formData.kid_id),
          equipment_type: formData.equipment_type,
          size: formData.size,
        }),
      });

      if (res.ok) {
        setJoinedWaitlist(true);
        toast.success("Added to waitlist!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join waitlist");
      }
    } catch {
      toast.error("Failed to join waitlist.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedKid = kids.find((k) => k.id === parseInt(formData.kid_id));
  const kidShoeSize = selectedKid?.shoeSize;
  const availableSizes =
    formData.equipment_type === "shoes" ? available.shoes : available.brooms;

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Success states
  if (joinedWaitlist) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-8 pb-6 text-center">
            <ClipboardList className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-blue-800 mb-2">
              Added to Waitlist!
            </h1>
            <p className="text-blue-700 mb-6">
              We&apos;ll notify you when {formData.equipment_type} size{" "}
              {formData.size} becomes available.
            </p>
            <Button render={<Link href="/" />}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-8 pb-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-emerald-800 mb-2">
              Request Submitted!
            </h1>
            <p className="text-emerald-700 mb-6">
              Scott will prepare your equipment. Pick it up at the next session.
            </p>
            <Button render={<Link href="/" />}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" render={<Link href="/" />}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Equipment</CardTitle>
          <CardDescription>
            Request shoes or a broom for your child. Scott will have it ready at
            the next session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Kid selection */}
              <div>
                <Label htmlFor="kid">
                  Select Your Child <span className="text-destructive">*</span>
                </Label>
                <select
                  id="kid"
                  value={formData.kid_id}
                  onChange={(e) => update("kid_id", e.target.value)}
                  className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Choose...</option>
                  {kids.map((kid) => (
                    <option key={kid.id} value={kid.id}>
                      {kid.name}{" "}
                      {kid.shoeSize
                        ? `(Size ${kid.shoeSize})`
                        : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Don&apos;t see your child?{" "}
                  <Link href="/register" className="text-primary hover:underline">
                    Register them first
                  </Link>
                </p>
              </div>

              {/* Equipment type */}
              <div>
                <Label>
                  Equipment Type <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, equipment_type: "shoes", size: "" })
                    }
                    className={cn(
                      "flex flex-col items-center gap-1 p-4 rounded-lg border-2 transition-colors",
                      formData.equipment_type === "shoes"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <Footprints className="h-6 w-6" />
                    <span className="font-medium text-sm">Shoes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, equipment_type: "broom", size: "" })
                    }
                    className={cn(
                      "flex flex-col items-center gap-1 p-4 rounded-lg border-2 transition-colors",
                      formData.equipment_type === "broom"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <Brush className="h-6 w-6" />
                    <span className="font-medium text-sm">Broom</span>
                  </button>
                </div>
              </div>

              {/* Size selection */}
              <div>
                <Label>
                  Size <span className="text-destructive">*</span>
                </Label>
                {availableSizes.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1.5">
                    <p className="text-amber-800 text-sm font-medium">
                      No {formData.equipment_type} currently available.
                    </p>
                    <p className="text-amber-700 text-xs mt-1">
                      Enter a size below and join the waitlist.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 mt-1.5">
                    {availableSizes.map((item) => (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => update("size", item.size)}
                        className={cn(
                          "p-2 rounded-lg border text-center transition-colors",
                          formData.size === item.size
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-medium text-sm">
                          {item.size || "Std"}
                        </div>
                        <div className="text-xs text-emerald-600">
                          {item.count} avail
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {kidShoeSize &&
                  formData.equipment_type === "shoes" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedKid?.name}&apos;s shoe size: {kidShoeSize}
                    </p>
                  )}
                <Input
                  value={formData.size}
                  onChange={(e) => update("size", e.target.value)}
                  className="mt-2"
                  placeholder="Or type a size if not listed..."
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={2}
                  placeholder="Any special requests..."
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Submit / Waitlist */}
            {availableSizes.length > 0 ? (
              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                disabled={submitting || !formData.kid_id || !formData.size}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleJoinWaitlist}
                variant="secondary"
                className="w-full mt-6"
                size="lg"
                disabled={submitting || !formData.kid_id || !formData.size}
              >
                {submitting ? "Joining..." : "Join Waitlist"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

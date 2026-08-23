"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brush,
  CheckCircle2,
  ClipboardList,
  Footprints,
  LockKeyhole,
  MapPin,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SizeCount = { size: string | null; count: number };

const initialForm = {
  child_name: "",
  parent_email: "",
  equipment_type: "shoes" as "shoes" | "broom",
  size: "",
  notes: "",
};

export default function RequestPage() {
  const [available, setAvailable] = useState<{
    shoes: SizeCount[];
    brooms: SizeCount[];
  }>({ shoes: [], brooms: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joinedWaitlist, setJoinedWaitlist] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        const response = await fetch("/api/stats", { signal: controller.signal });
        if (!response.ok) throw new Error("Availability request failed");
        const data = await response.json();
        setAvailable({
          shoes: data.availableShoesBySize || [],
          brooms: data.availableBroomsBySize || [],
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAvailability();
    return () => controller.abort();
  }, []);

  function update<K extends keyof typeof initialForm>(
    field: K,
    value: (typeof initialForm)[K]
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function selectEquipment(type: "shoes" | "broom") {
    setFormData((current) => ({
      ...current,
      equipment_type: type,
      size: "",
    }));
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        toast.success("Equipment request sent");
      } else {
        toast.error(data.error || "Request could not be sent.");
      }
    } catch {
      toast.error("Request could not be sent. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  async function joinWaitlist() {
    if (!formData.child_name || !formData.parent_email || !formData.size) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setJoinedWaitlist(true);
        toast.success(
          data.message === "Already on waitlist"
            ? "You’re already on this waitlist"
            : "Waitlist spot saved"
        );
      } else {
        toast.error(data.error || "Waitlist spot could not be saved.");
      }
    } catch {
      toast.error("Waitlist spot could not be saved. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-[42rem] w-full" />
      </div>
    );
  }

  if (joinedWaitlist || submitted) {
    const isWaitlist = joinedWaitlist;
    return (
      <div className="mx-auto max-w-2xl py-4 sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white shadow-[0_18px_48px_rgba(44,46,53,0.1)]">
          <div
            className={cn(
              "px-6 py-10 text-center sm:px-10",
              isWaitlist ? "bg-[#fff9e9]" : "bg-[#edf6f2]"
            )}
          >
            <span
              className={cn(
                "mx-auto flex size-16 items-center justify-center rounded-full text-white shadow-lg",
                isWaitlist ? "bg-[#8B6113]" : "bg-[#2E7C60]"
              )}
            >
              {isWaitlist ? (
                <ClipboardList className="size-8" />
              ) : (
                <CheckCircle2 className="size-8" />
              )}
            </span>
            <h1 className="mt-6 font-display text-4xl leading-none text-[#2C2E35]">
              {isWaitlist ? "WAITLIST CONFIRMED." : "REQUEST CONFIRMED."}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#5B6870]">
              {isWaitlist
                ? `We’ll contact you when ${formData.equipment_type} in ${formData.size} becomes available.`
                : "Scott will prepare the request. Pick it up at an upcoming Little Rockers session."}
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
            <Button
              size="lg"
              className="h-12 rounded-full bg-[#BC1F25] text-white hover:bg-[#99191E]"
              render={<Link href="/lookup" />}
            >
              View my equipment
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-[#C9D0D4] bg-white"
              render={<Link href="/" />}
            >
              Back to availability
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const availableSizes =
    formData.equipment_type === "shoes" ? available.shoes : available.brooms;
  const selectedInStock = availableSizes.some(
    (item) =>
      (item.size || "Standard").toLowerCase() === formData.size.toLowerCase() &&
      Number(item.count) > 0
  );
  const canSubmit = Boolean(
    formData.child_name && formData.parent_email && formData.size
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/"
        className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#5B6870] hover:text-[#2C2E35]"
      >
        <ArrowLeft className="size-4" />
        Back to availability
      </Link>

      <div className="grid overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white shadow-[0_20px_56px_rgba(44,46,53,0.09)] lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="relative overflow-hidden bg-[#BC1F25] p-6 text-white sm:p-9">
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -right-20 size-60 rounded-full border-[40px] border-white/10"
          />
          <p className="relative text-[0.7rem] font-black uppercase tracking-[0.17em] text-white/65">
            Step 2 of 2
          </p>
          <h1 className="relative mt-4 font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl">
            CHOOSE THEIR SEASON GEAR.
          </h1>
          <p className="relative mt-5 max-w-md text-sm leading-6 text-white/70">
            Select what is ready today or ask for another size. We’ll match the
            request to the registration using your email.
          </p>

          <div className="relative mt-10 space-y-5 border-t border-white/15 pt-7">
            <div className="flex gap-3">
              <PackageCheck className="mt-0.5 size-5 shrink-0 text-[#F1B9BC]" />
              <div>
                <p className="text-sm font-extrabold">Live inventory</p>
                <p className="mt-0.5 text-xs leading-5 text-white/55">
                  Size counts reflect what is currently ready to borrow.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-[#F1B9BC]" />
              <div>
                <p className="text-sm font-extrabold">Pickup at the rink</p>
                <p className="mt-0.5 text-xs leading-5 text-white/55">
                  Scott will coordinate pickup at a Little Rockers session.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#F1B9BC]" />
              <div>
                <p className="text-sm font-extrabold">Private by design</p>
                <p className="mt-0.5 text-xs leading-5 text-white/55">
                  The roster is never published. Name and email only verify your
                  family’s registration.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="p-5 sm:p-9">
          <div className="mb-8 border-b border-[#D9DEE1] pb-5">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#2C2E35]">
              Who is this for?
            </h2>
          </div>

          {loadError ? (
            <div className="mb-6 flex gap-3 rounded-xl border border-[#E5D3A8] bg-[#FFF9E9] px-4 py-3 text-sm text-[#775C22]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Live counts are unavailable, but you can still enter a size and
              join the waitlist.
            </div>
          ) : null}

          <form onSubmit={submitRequest}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="child_name">Child’s full name</Label>
                <Input
                  id="child_name"
                  name="child_name"
                  value={formData.child_name}
                  onChange={(event) => update("child_name", event.target.value)}
                  required
                  autoComplete="name"
                  placeholder="As registered"
                  className="mt-2 h-11 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="parent_email">Parent email</Label>
                <Input
                  id="parent_email"
                  name="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(event) => update("parent_email", event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Used at registration"
                  className="mt-2 h-11 bg-white"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-[#69767E]">
              Not registered yet?{" "}
              <Link href="/register" className="font-bold text-[#BC1F25] hover:underline">
                Register a child first
              </Link>
              .
            </p>

            <fieldset className="mt-8 border-t border-[#D9DEE1] pt-7">
              <legend className="text-sm font-extrabold text-[#2C2E35]">
                Choose equipment
              </legend>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { value: "shoes" as const, label: "Curling shoes", icon: Footprints },
                  { value: "broom" as const, label: "Junior broom", icon: Brush },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={formData.equipment_type === option.value}
                    onClick={() => selectEquipment(option.value)}
                    className={cn(
                      "flex min-h-24 flex-col items-start justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC1F25]/35",
                      formData.equipment_type === option.value
                        ? "border-[#BC1F25] bg-[#F4E4E5] text-[#99191E]"
                        : "border-[#D9DEE1] bg-white text-[#2C2E35] hover:border-[#8C979D]"
                    )}
                  >
                    <option.icon className="size-5" />
                    <span className="text-sm font-extrabold">{option.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="text-sm font-extrabold text-[#2C2E35]">
                Select a size
              </legend>
              {availableSizes.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availableSizes.map((item) => {
                    const size = item.size || "Standard";
                    const selected = formData.size === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => update("size", size)}
                        className={cn(
                          "min-h-16 rounded-lg border px-3 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BC1F25]/35",
                          selected
                            ? "border-[#BC1F25] bg-[#BC1F25] text-white"
                            : "border-[#D9DEE1] bg-white text-[#2C2E35] hover:border-[#8C979D]"
                        )}
                      >
                        <span className="block text-sm font-black">{size}</span>
                        <span
                          className={cn(
                            "text-[0.68rem] font-bold",
                            selected ? "text-white/65" : "text-[#2e7c60]"
                          )}
                        >
                          {item.count} available
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-[#E5D3A8] bg-[#FFF9E9] px-4 py-3">
                  <p className="text-sm font-extrabold text-[#5c430f]">
                    No {formData.equipment_type === "shoes" ? "shoes" : "brooms"} are
                    ready right now.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#775c22]">
                    Enter the size you need and we’ll save a waitlist spot.
                  </p>
                </div>
              )}
              <Label htmlFor="size" className="mt-4 block">
                {availableSizes.length > 0 ? "Or enter another size" : "Needed size"}
              </Label>
              <Input
                id="size"
                name="size"
                value={formData.size}
                onChange={(event) => update("size", event.target.value)}
                required
                placeholder={
                  formData.equipment_type === "shoes"
                    ? "e.g. 4.5"
                    : "e.g. Short or Standard"
                }
                className="mt-2 h-11 bg-white"
              />
            </fieldset>

            <div className="mt-7">
              <Label htmlFor="notes">
                Notes <span className="font-normal text-[#69767E]">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(event) => update("notes", event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Fit notes, pickup details, or anything Scott should know"
                className="mt-2 bg-white"
              />
            </div>

            {selectedInStock ? (
              <Button
                type="submit"
                size="lg"
                className="mt-8 h-12 w-full rounded-full bg-[#BC1F25] text-white hover:bg-[#99191E]"
                disabled={submitting || !canSubmit}
              >
                {submitting ? "Sending request…" : "Request this equipment"}
                {!submitting ? <ArrowRight className="size-4" /> : null}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className="mt-8 h-12 w-full rounded-full bg-[#8B6113] text-white hover:bg-[#75510F]"
                disabled={submitting || !canSubmit}
                onClick={joinWaitlist}
              >
                {submitting ? "Saving waitlist spot…" : "Join the waitlist"}
                {!submitting ? <ClipboardList className="size-4" /> : null}
              </Button>
            )}
            <p className="mt-3 text-center text-xs text-[#69767E]">
              {selectedInStock
                ? "A request holds your place; Scott confirms the final fit at pickup."
                : "We’ll use the parent email on the registration when gear is ready."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Footprints,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GRADE_OPTIONS,
  REQUEST_PREFILL_STORAGE_KEY,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const initialForm = {
  name: "",
  grade: "",
  shoe_size: "",
  parent_name: "",
  parent_email: "",
  parent_phone: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const response = await fetch("/api/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem(
          REQUEST_PREFILL_STORAGE_KEY,
          JSON.stringify({
            kidName: formData.name,
            parentEmail: formData.parent_email,
          })
        );
        setSubmitted(true);
        toast.success("Child registered");
      } else if (data.details?.fieldErrors) {
        setFieldErrors(data.details.fieldErrors);
      } else {
        toast.error(data.error || "Registration could not be saved.");
      }
    } catch {
      toast.error("Registration could not be saved. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof typeof initialForm, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-4 sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-[#B9D9CC] bg-white shadow-[0_18px_48px_rgba(44,46,53,0.1)]">
          <div className="bg-[#edf6f2] px-6 py-10 text-center sm:px-10">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#2E7C60] text-white shadow-lg">
              <CheckCircle2 className="size-8" />
            </span>
            <h1 className="mt-6 font-display text-4xl leading-none text-[#2C2E35]">
              REGISTRATION COMPLETE.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#5B6870]">
              {formData.name} is on the roster. Next, choose shoes, a broom, or
              both for pickup at a Little Rockers session.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
            <Button
              size="lg"
              className="h-12 rounded-full bg-[#BC1F25] text-white hover:bg-[#99191E]"
              render={<Link href="/request" />}
            >
              Request equipment
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

  const childComplete = Boolean(formData.name && formData.shoe_size);
  const contactComplete = Boolean(formData.parent_name && formData.parent_email);

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
        <aside className="relative overflow-hidden bg-[#2C2E35] p-6 text-white sm:p-9">
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 size-64 rounded-full border-[42px] border-[#BC1F25]/30"
          />
          <p className="relative text-[0.7rem] font-black uppercase tracking-[0.17em] text-white/60">
            Step 1 of 2
          </p>
          <h1 className="relative mt-4 font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl">
            JOIN THE EQUIPMENT ROSTER.
          </h1>
          <p className="relative mt-5 max-w-md text-sm leading-6 text-white/65">
            Tell us who is curling and how to reach you. We only use this
            information to manage club equipment and pickup.
          </p>

          <ol className="relative mt-10 space-y-5">
            <li className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border text-sm font-black",
                  childComplete
                    ? "border-[#53b28d] bg-[#53b28d] text-[#102d24]"
                    : "border-white/25 text-white"
                )}
              >
                {childComplete ? <Check className="size-4" /> : "1"}
              </span>
              <span>
                <span className="block text-sm font-extrabold">Child details</span>
                <span className="text-xs text-white/50">Name, grade, and shoe size</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border text-sm font-black",
                  contactComplete
                    ? "border-[#53b28d] bg-[#53b28d] text-[#102d24]"
                    : "border-white/25 text-white"
                )}
              >
                {contactComplete ? <Check className="size-4" /> : "2"}
              </span>
              <span>
                <span className="block text-sm font-extrabold">Parent contact</span>
                <span className="text-xs text-white/50">Used for pickup and returns</span>
              </span>
            </li>
          </ol>

          <div className="relative mt-10 flex gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-white/55">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#F1B9BC]" />
            Contact details are visible only to the equipment coordinator.
          </div>
        </aside>

        <div className="p-5 sm:p-9">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-[#D9DEE1] pb-5">
            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#2C2E35]">
                Register a child
              </h2>
            </div>
            <span className="flex size-11 items-center justify-center rounded-full bg-[#E8ECEE] text-[#2C2E35]">
              <Footprints className="size-5" />
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend className="text-sm font-extrabold text-[#2C2E35]">
                Child details
              </legend>
              <div className="mt-4 space-y-5">
                <div>
                  <Label htmlFor="name">Child’s full name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    placeholder="First and last name"
                    className="mt-2 h-11 bg-white"
                  />
                  {fieldErrors.name ? (
                    <p id="name-error" className="mt-1.5 text-sm font-medium text-destructive">
                      {fieldErrors.name[0]}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={(event) => update("grade", event.target.value)}
                      className="mt-2 flex h-11 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <option value="">Select grade</option>
                      {GRADE_OPTIONS.map((grade) => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="shoe_size">Current shoe size</Label>
                    <Input
                      id="shoe_size"
                      name="shoe_size"
                      value={formData.shoe_size}
                      onChange={(event) => update("shoe_size", event.target.value)}
                      required
                      inputMode="decimal"
                      aria-invalid={Boolean(fieldErrors.shoe_size)}
                      aria-describedby={
                        fieldErrors.shoe_size ? "shoe-size-error" : "shoe-size-hint"
                      }
                      placeholder="e.g. 3 or 4.5"
                      className="mt-2 h-11 bg-white"
                    />
                    {fieldErrors.shoe_size ? (
                      <p
                        id="shoe-size-error"
                        className="mt-1.5 text-sm font-medium text-destructive"
                      >
                        {fieldErrors.shoe_size[0]}
                      </p>
                    ) : (
                      <p id="shoe-size-hint" className="mt-1.5 text-xs text-[#69767E]">
                        Use the size they wear now.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-8 border-t border-[#D9DEE1] pt-7">
              <legend className="text-sm font-extrabold text-[#2C2E35]">
                Parent or guardian
              </legend>
              <div className="mt-4 space-y-5">
                <div>
                  <Label htmlFor="parent_name">Your full name</Label>
                  <Input
                    id="parent_name"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={(event) => update("parent_name", event.target.value)}
                    required
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.parent_name)}
                    className="mt-2 h-11 bg-white"
                  />
                  {fieldErrors.parent_name ? (
                    <p className="mt-1.5 text-sm font-medium text-destructive">
                      {fieldErrors.parent_name[0]}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="parent_email">Email</Label>
                    <Input
                      id="parent_email"
                      name="parent_email"
                      type="email"
                      value={formData.parent_email}
                      onChange={(event) => update("parent_email", event.target.value)}
                      required
                      autoComplete="email"
                      aria-invalid={Boolean(fieldErrors.parent_email)}
                      placeholder="you@example.com"
                      className="mt-2 h-11 bg-white"
                    />
                    {fieldErrors.parent_email ? (
                      <p className="mt-1.5 text-sm font-medium text-destructive">
                        {fieldErrors.parent_email[0]}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="parent_phone">
                      Phone <span className="font-normal text-[#69767E]">(optional)</span>
                    </Label>
                    <Input
                      id="parent_phone"
                      name="parent_phone"
                      type="tel"
                      value={formData.parent_phone}
                      onChange={(event) => update("parent_phone", event.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      className="mt-2 h-11 bg-white"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <Button
              type="submit"
              size="lg"
              className="mt-8 h-12 w-full rounded-full bg-[#BC1F25] text-white hover:bg-[#99191E]"
              disabled={loading}
            >
              {loading ? "Saving registration…" : "Register child"}
              {!loading ? <ArrowRight className="size-4" /> : null}
            </Button>
            <p className="mt-3 text-center text-xs text-[#69767E]">
              Registration does not reserve gear. You’ll choose equipment next.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

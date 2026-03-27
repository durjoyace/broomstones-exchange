"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GRADE_OPTIONS } from "@/lib/constants";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    shoe_size: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const res = await fetch("/api/kids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        toast.success("Registration complete!");
      } else if (data.details?.fieldErrors) {
        setFieldErrors(data.details.fieldErrors);
      } else {
        toast.error(data.error || "Failed to register. Please try again.");
      }
    } catch {
      toast.error("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-8 pb-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-emerald-800 mb-2">
              Registration Complete!
            </h1>
            <p className="text-emerald-700 mb-6">
              <strong>{formData.name}</strong> has been registered for the
              equipment exchange program.
            </p>
            <p className="text-sm text-emerald-600 mb-6">
              You can now request equipment through the{" "}
              <Link href="/request" className="underline font-medium">
                request form
              </Link>
              .
            </p>
            <div className="space-y-2">
              <Button className="w-full" render={<Link href="/request" />}>
                Request Equipment
              </Button>
              <Button variant="ghost" className="w-full" render={<Link href="/" />}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            </div>
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
          <CardTitle>Register Your Child</CardTitle>
          <CardDescription>
            Add your child to the Little Rockers equipment exchange program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Child&apos;s Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  placeholder="First and last name"
                  className="mt-1.5"
                />
                {fieldErrors.name && (
                  <p className="text-sm text-destructive mt-1">{fieldErrors.name[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => update("grade", e.target.value)}
                    className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                  <Label htmlFor="shoe_size">
                    Shoe Size <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shoe_size"
                    value={formData.shoe_size}
                    onChange={(e) => update("shoe_size", e.target.value)}
                    required
                    placeholder="e.g., 3, 4.5"
                    className="mt-1.5"
                  />
                  {fieldErrors.shoe_size && (
                    <p className="text-sm text-destructive mt-1">
                      {fieldErrors.shoe_size[0]}
                    </p>
                  )}
                </div>
              </div>

              <Separator />
              <p className="text-sm font-medium">Parent/Guardian Contact</p>

              <div>
                <Label htmlFor="parent_name">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => update("parent_name", e.target.value)}
                  required
                  className="mt-1.5"
                />
                {fieldErrors.parent_name && (
                  <p className="text-sm text-destructive mt-1">
                    {fieldErrors.parent_name[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="parent_email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => update("parent_email", e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="mt-1.5"
                />
                {fieldErrors.parent_email && (
                  <p className="text-sm text-destructive mt-1">
                    {fieldErrors.parent_email[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="parent_phone">Phone</Label>
                <Input
                  id="parent_phone"
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => update("parent_phone", e.target.value)}
                  placeholder="Optional"
                  className="mt-1.5"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading ? "Registering..." : "Register My Child"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

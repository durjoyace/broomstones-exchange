"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            An unexpected error occurred. Please try again or go back to the
            home page.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
            <Button render={<Link href="/" />}>
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

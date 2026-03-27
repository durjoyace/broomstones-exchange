"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";

type CheckoutInfo = {
  id: number;
  equipmentType: string;
  equipmentSize: string | null;
  equipmentBrand: string | null;
  checkedOutAt: string;
};

type KidInfo = {
  id: number;
  name: string;
  shoeSize: string | null;
  checkouts: CheckoutInfo[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LookupContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<KidInfo[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  // Debounced search
  useEffect(() => {
    if (searchTerm.length < 2) return;
    const timer = setTimeout(() => performSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" render={<Link href="/" />}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-2">My Equipment</h1>
      <p className="text-muted-foreground mb-6">
        Look up what equipment your child currently has checked out.
      </p>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter child's name..."
              autoFocus
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <EmptyState
          icon={Search}
          title={`No results for "${searchTerm}"`}
          description="If your child isn't registered yet, you can register them."
          action={
            <Button variant="outline" render={<Link href="/register" />}>
              Register Your Child
            </Button>
          }
        />
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((kid) => (
            <Card key={kid.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{kid.name}</h2>
                    {kid.shoeSize && (
                      <p className="text-sm text-muted-foreground">
                        Shoe size: {kid.shoeSize}
                      </p>
                    )}
                  </div>
                  {kid.checkouts.length > 0 && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {kid.checkouts.length} item
                      {kid.checkouts.length > 1 ? "s" : ""} out
                    </Badge>
                  )}
                </div>

                {kid.checkouts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No equipment currently checked out.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Currently has:</p>
                    {kid.checkouts.map((checkout) => (
                      <div
                        key={checkout.id}
                        className="flex justify-between items-center bg-muted/50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium capitalize">
                            {checkout.equipmentType}
                          </span>
                          {checkout.equipmentSize && (
                            <span className="text-muted-foreground">
                              Size {checkout.equipmentSize}
                            </span>
                          )}
                          {checkout.equipmentBrand && (
                            <span className="text-muted-foreground text-sm">
                              ({checkout.equipmentBrand})
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Since {formatDate(checkout.checkedOutAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                  To return equipment, bring it to Scott at the rink.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-10 w-full mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  );
}

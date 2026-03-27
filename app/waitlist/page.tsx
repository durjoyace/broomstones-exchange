"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Clock, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";

type WaitlistRow = {
  id: number;
  kidId: number;
  equipmentType: string;
  size: string;
  createdAt: string;
  kidName: string;
  parentEmail: string | null;
};

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await fetch("/api/waitlist");
      setWaitlist(await res.json());
    } catch {
      toast.error("Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group by equipment type and size
  const groupedWaitlist = waitlist.reduce(
    (acc, entry) => {
      const key = `${entry.equipmentType}-${entry.size}`;
      if (!acc[key]) {
        acc[key] = {
          type: entry.equipmentType,
          size: entry.size,
          entries: [],
        };
      }
      acc[key].entries.push(entry);
      return acc;
    },
    {} as Record<
      string,
      { type: string; size: string; entries: WaitlistRow[] }
    >
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Waitlist</h1>
        <p className="text-muted-foreground text-sm">
          Kids waiting for equipment that&apos;s out of stock
        </p>
      </div>

      {waitlist.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Users}
              title="No one on the waitlist"
              description="When equipment is unavailable, kids can be added to the waitlist from the request page."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedWaitlist).map((group) => (
            <Card key={`${group.type}-${group.size}`}>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">
                    {group.type} &mdash; Size {group.size}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {group.entries.length} waiting
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6 text-center font-medium">
                          #{index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.kidName}</span>
                          {entry.parentEmail && (
                            <a
                              href={`mailto:${entry.parentEmail}?subject=Equipment%20Available%20-%20${group.type}%20Size%20${group.size}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                            >
                              <Mail className="h-3 w-3" />
                              Email
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Since {formatDate(entry.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Total: {waitlist.length} kid{waitlist.length !== 1 ? "s" : ""} on
        waitlist
      </p>
    </div>
  );
}

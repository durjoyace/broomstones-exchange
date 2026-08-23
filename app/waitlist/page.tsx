"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Clock3,
  Inbox,
  Mail,
  PackageSearch,
  RotateCcw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { cn } from "@/lib/utils";

type EquipmentRequestRow = {
  id: number;
  kidId: number;
  equipmentType: string;
  size: string;
  notes: string | null;
  status: "pending" | "fulfilled" | "cancelled";
  createdAt: string;
  fulfilledAt: string | null;
  kidName: string;
  kidShoeSize: string | null;
  parentEmail: string | null;
};

type WaitlistRow = {
  id: number;
  kidId: number;
  equipmentType: string;
  size: string;
  createdAt: string;
  kidName: string;
  parentEmail: string | null;
};

const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function RequestsQueuePage() {
  const [requests, setRequests] = useState<EquipmentRequestRow[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"requests" | "waitlist">("requests");
  const [showCompleted, setShowCompleted] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadQueues() {
      try {
        const [requestsResponse, waitlistResponse] = await Promise.all([
          fetch("/api/requests", { signal: controller.signal }),
          fetch("/api/waitlist", { signal: controller.signal }),
        ]);

        if (!requestsResponse.ok || !waitlistResponse.ok) {
          throw new Error("Queue request failed");
        }

        const [requestsData, waitlistData] = await Promise.all([
          requestsResponse.json(),
          waitlistResponse.json(),
        ]);

        setRequests(requestsData);
        setWaitlist(waitlistData);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          toast.error("Requests could not be loaded. Refresh to try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadQueues();
    return () => controller.abort();
  }, []);

  async function updateRequestStatus(
    requestId: number,
    status: "pending" | "fulfilled"
  ) {
    const key = `request-${requestId}`;
    setUpdatingKey(key);

    try {
      const response = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, status }),
      });

      if (!response.ok) throw new Error("Request update failed");

      setRequests((current) =>
        current.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status,
                fulfilledAt:
                  status === "fulfilled" ? new Date().toISOString() : null,
              }
            : item
        )
      );
      toast.success(
        status === "fulfilled"
          ? "Request marked fulfilled"
          : "Request moved back to pending"
      );
    } catch {
      toast.error("Request status was not changed. Try again.");
    } finally {
      setUpdatingKey(null);
    }
  }

  async function markWaitlistContacted(entryId: number) {
    const key = `waitlist-${entryId}`;
    setUpdatingKey(key);

    try {
      const response = await fetch("/api/waitlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entryId, notified: true }),
      });

      if (!response.ok) throw new Error("Waitlist update failed");

      setWaitlist((current) => current.filter((item) => item.id !== entryId));
      toast.success("Family marked contacted");
    } catch {
      toast.error("Waitlist status was not changed. Try again.");
    } finally {
      setUpdatingKey(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
      </div>
    );
  }

  const pendingRequests = requests.filter((item) => item.status === "pending");
  const completedRequests = requests.filter(
    (item) => item.status === "fulfilled"
  );
  const visibleRequests = showCompleted
    ? requests.filter((item) => item.status !== "cancelled")
    : pendingRequests;

  const groupedWaitlist = Object.values(
    waitlist.reduce(
      (groups, entry) => {
        const key = `${entry.equipmentType}-${entry.size}`;
        groups[key] ??= {
          type: entry.equipmentType,
          size: entry.size,
          entries: [],
        };
        groups[key].entries.push(entry);
        return groups;
      },
      {} as Record<
        string,
        { type: string; size: string; entries: WaitlistRow[] }
      >
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-[-0.035em] text-[#2C2E35] sm:text-5xl">
            Requests &amp; waitlist
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5B6870]">
            Process available gear first, then contact families as shortage sizes
            return to the rack.
          </p>
        </div>
        <a
          href="mailto:Scott.Price@broomstones.org"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[#C9D0D4] bg-white px-4 text-sm font-bold text-[#2C2E35] hover:border-[#BC1F25]"
        >
          <Mail className="size-4" />
          Coordinator email
        </a>
      </div>

      <div
        aria-label="Equipment queue"
        className="inline-flex w-full rounded-xl border border-[#D9DEE1] bg-white p-1 sm:w-auto"
      >
        <button
          type="button"
          aria-pressed={view === "requests"}
          onClick={() => setView("requests")}
          className={cn(
            "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors sm:flex-none",
            view === "requests"
              ? "bg-[#2C2E35] text-white"
              : "text-[#5B6870] hover:bg-[#EEF1F2] hover:text-[#2C2E35]"
          )}
        >
          <Inbox className="size-4" />
          Requests
          <span className="tabular-nums">{pendingRequests.length}</span>
        </button>
        <button
          type="button"
          aria-pressed={view === "waitlist"}
          onClick={() => setView("waitlist")}
          className={cn(
            "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors sm:flex-none",
            view === "waitlist"
              ? "bg-[#2C2E35] text-white"
              : "text-[#5B6870] hover:bg-[#EEF1F2] hover:text-[#2C2E35]"
          )}
        >
          <Clock3 className="size-4" />
          Waitlist
          <span className="tabular-nums">{waitlist.length}</span>
        </button>
      </div>

      {view === "requests" ? (
        <section className="overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white">
          <header className="flex flex-col justify-between gap-3 border-b border-[#E3E7E9] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[#2C2E35]">
                Equipment requests
              </h2>
              <p className="mt-1 text-sm text-[#5B6870]">
                {pendingRequests.length} waiting to be prepared
              </p>
            </div>
            {completedRequests.length > 0 ? (
              <Button
                variant="outline"
                className="self-start rounded-full"
                onClick={() => setShowCompleted((current) => !current)}
              >
                {showCompleted ? "Hide fulfilled" : "Show fulfilled"}
                <span className="tabular-nums">({completedRequests.length})</span>
              </Button>
            ) : null}
          </header>

          {visibleRequests.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No pending requests"
              description="New family requests will appear here as soon as they are submitted."
            />
          ) : (
            <div className="divide-y divide-[#E3E7E9]">
              {visibleRequests.map((request) => {
                const fulfilled = request.status === "fulfilled";
                const mailSubject = encodeURIComponent(
                  `Broomstones equipment request - ${request.equipmentType} ${request.size}`
                );

                return (
                  <article
                    key={request.id}
                    className={cn(
                      "flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center",
                      fulfilled && "bg-[#F6F7F8]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full",
                        fulfilled
                          ? "bg-[#E1EFE9] text-[#226A52]"
                          : "bg-[#F4E4E5] text-[#BC1F25]"
                      )}
                    >
                      {fulfilled ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <PackageSearch className="size-5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="font-extrabold text-[#2C2E35]">
                          {request.kidName}
                        </h3>
                        <span className="rounded-full bg-[#EEF1F2] px-2.5 py-1 text-xs font-bold capitalize text-[#5B6870]">
                          {request.equipmentType} · {request.size}
                        </span>
                        {fulfilled ? (
                          <span className="text-xs font-bold text-[#226A52]">
                            Fulfilled
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-[#5B6870]">
                        Requested {fullDate.format(new Date(request.createdAt))}
                        {request.kidShoeSize
                          ? ` · Registered shoe size ${request.kidShoeSize}`
                          : ""}
                      </p>
                      {request.notes ? (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#2C2E35]">
                          {request.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {request.parentEmail ? (
                        <a
                          href={`mailto:${request.parentEmail}?subject=${mailSubject}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#C9D0D4] bg-white px-3 text-sm font-bold text-[#2C2E35] hover:border-[#BC1F25]"
                        >
                          <Mail className="size-4" />
                          Email family
                        </a>
                      ) : null}
                      <Button
                        variant={fulfilled ? "outline" : "default"}
                        className={cn(
                          "min-h-10",
                          !fulfilled &&
                            "bg-[#BC1F25] text-white hover:bg-[#99191E]"
                        )}
                        disabled={updatingKey === `request-${request.id}`}
                        onClick={() =>
                          updateRequestStatus(
                            request.id,
                            fulfilled ? "pending" : "fulfilled"
                          )
                        }
                      >
                        {fulfilled ? (
                          <RotateCcw className="size-4" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        {updatingKey === `request-${request.id}`
                          ? "Updating…"
                          : fulfilled
                            ? "Move to pending"
                            : "Mark fulfilled"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : groupedWaitlist.length === 0 ? (
        <section className="rounded-2xl border border-[#D9DEE1] bg-white">
          <EmptyState
            icon={Users}
            title="No one is waiting"
            description="Families appear here when their requested size is unavailable."
          />
        </section>
      ) : (
        <div className="space-y-4">
          {groupedWaitlist.map((group) => (
            <section
              key={`${group.type}-${group.size}`}
              className="overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E7E9] bg-[#F6F7F8] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-extrabold capitalize text-[#2C2E35]">
                  {group.type} · Size {group.size}
                </h2>
                <span className="rounded-full bg-[#FFF3D6] px-3 py-1.5 text-xs font-bold text-[#775C22]">
                  {group.entries.length} waiting
                </span>
              </header>
              <div className="divide-y divide-[#E3E7E9]">
                {group.entries.map((entry, index) => {
                  const mailSubject = encodeURIComponent(
                    `Equipment available - ${group.type} size ${group.size}`
                  );

                  return (
                    <article
                      key={entry.id}
                      className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EEF1F2] text-sm font-black tabular-nums text-[#5B6870]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-[#2C2E35]">
                          {entry.kidName}
                        </h3>
                        <p className="mt-1 text-sm text-[#5B6870]">
                          Waiting since {fullDate.format(new Date(entry.createdAt))}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {entry.parentEmail ? (
                          <a
                            href={`mailto:${entry.parentEmail}?subject=${mailSubject}`}
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#C9D0D4] bg-white px-3 text-sm font-bold text-[#2C2E35] hover:border-[#BC1F25]"
                          >
                            <Mail className="size-4" />
                            Email family
                          </a>
                        ) : null}
                        <Button
                          variant="outline"
                          className="min-h-10"
                          disabled={updatingKey === `waitlist-${entry.id}`}
                          onClick={() => markWaitlistContacted(entry.id)}
                        >
                          <Check className="size-4" />
                          {updatingKey === `waitlist-${entry.id}`
                            ? "Updating…"
                            : "Mark contacted"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Clock, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, apiPatch } from "@/lib/api";
import { PROGRAM_LABEL } from "@/lib/programs";
import type { FollowUpBoard, FollowUpItem, Registration } from "@/lib/types";
import { cn } from "@/lib/utils";

const BUCKETS = [
  { key: "overdue" as const, label: "Overdue", tone: "border-rose-500/40 text-rose-300" },
  { key: "today" as const, label: "Due Today", tone: "border-sky-400/50 text-sky-300" },
  { key: "upcoming" as const, label: "Upcoming", tone: "border-slate-700 text-slate-300" },
];

function FollowUpRow({
  item,
  onDone,
  pending,
}: {
  item: FollowUpItem;
  onDone: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div
      data-testid={`followup-row-${item.registration_id}`}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-3.5 transition-colors duration-200 hover:border-sky-400/50"
    >
      <div className="min-w-[160px] flex-1">
        <p className="text-sm font-semibold text-slate-100">{item.full_name}</p>
        <p className="font-mono text-[10px] text-sky-400">{item.registration_id}</p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <Phone className="h-3.5 w-3.5" /> {item.phone}
      </span>
      <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:inline-flex">
        <Mail className="h-3.5 w-3.5" /> {item.email}
      </span>
      <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
        {PROGRAM_LABEL[item.program] ?? item.program}
      </Badge>
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
        <CalendarClock className="h-3.5 w-3.5 text-sky-500" /> {item.follow_up_date}
      </span>
      <Badge variant="secondary" className="bg-[#1E2E54] text-slate-200">{item.status}</Badge>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        data-testid={`followup-contacted-${item.registration_id}`}
        className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
        onClick={() => onDone(item.registration_id)}
      >
        Mark Contacted
      </Button>
    </div>
  );
}

export default function FollowUpsTab() {
  const qc = useQueryClient();
  const board = useQuery({
    queryKey: ["admin-followups"],
    queryFn: () => apiGet<FollowUpBoard>("/admin/follow-ups"),
  });

  const markContacted = useMutation({
    mutationFn: (id: string) =>
      // Clearing the date takes the lead off the worklist; status still records the contact.
      apiPatch<Registration>(`/admin/registrations/${id}`, {
        status: "Contacted",
        follow_up_date: "",
      }),
    onSuccess: () => {
      toast.success("Marked as contacted — cleared from the worklist");
      void qc.invalidateQueries({ queryKey: ["admin-followups"] });
      void qc.invalidateQueries({ queryKey: ["admin-registrations"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Could not update this lead"),
  });

  const data = board.data;

  return (
    <div className="space-y-5" data-testid="followups-tab">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BUCKETS.map((b) => (
          <Card
            key={b.key}
            className={cn("border bg-[#111C35] p-5", b.tone)}
            data-testid={`followup-count-${b.key}`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest">{b.label}</p>
            <p className="mt-2 font-heading text-2xl font-bold text-slate-50">
              {data ? data[b.key].length : "—"}
            </p>
          </Card>
        ))}
        <Card className="border-slate-800 bg-[#111C35] p-5" data-testid="followup-count-unscheduled">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
            No Date Set
          </p>
          <p className="mt-2 font-heading text-2xl font-bold text-slate-50">
            {data ? data.unscheduled : "—"}
          </p>
        </Card>
      </div>

      {board.isError && (
        <p className="rounded-lg border border-slate-800 bg-[#0D1527] p-4 text-sm text-slate-400">
          The follow-up worklist is unavailable right now.
        </p>
      )}

      {BUCKETS.map((b) => (
        <Card key={b.key} className="border-slate-800 bg-[#111C35] p-5" data-testid={`followup-list-${b.key}`}>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-sky-400" />
            <h3 className="font-heading text-sm font-semibold text-slate-100">{b.label}</h3>
            <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
              {data ? data[b.key].length : 0}
            </Badge>
          </div>
          <div className="mt-4 space-y-2.5">
            {(data?.[b.key] ?? []).map((item) => (
              <FollowUpRow
                key={item.registration_id}
                item={item}
                pending={markContacted.isPending}
                onDone={(id) => markContacted.mutate(id)}
              />
            ))}
            {data && data[b.key].length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                Nothing in this bucket. Set a follow-up date on a lead to see it here.
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

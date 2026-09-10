import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiDelete, apiGet, apiPost } from "@/lib/api";
import { PROGRAMS, PROGRAM_LABEL } from "@/lib/programs";
import { BATCH_MODES, BATCH_STATUSES } from "@/lib/types";
import type { Batch, BatchCreate, BatchMember, Registration } from "@/lib/types";

const EMPTY: BatchCreate = {
  name: "",
  program: PROGRAMS[0].slug,
  mode: "Online",
  timing: "",
  start_date: "",
  capacity: 25,
  status: "Enrolling",
};

function errText(err: unknown, fallback: string) {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const d = (err.body as { detail?: unknown }).detail;
    if (typeof d === "string") return d;
  }
  return fallback;
}

export default function BatchesTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<BatchCreate>(EMPTY);
  const [showCreate, setShowCreate] = useState(false);
  const [assignTo, setAssignTo] = useState<Batch | null>(null);
  const [membersOf, setMembersOf] = useState<Batch | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const batches = useQuery({
    queryKey: ["admin-batches"],
    queryFn: () => apiGet<Batch[]>("/admin/batches"),
  });

  const candidates = useQuery({
    queryKey: ["admin-batch-candidates", assignTo?.program],
    queryFn: () =>
      apiGet<Registration[]>(
        `/admin/registrations?program=${assignTo?.program}&learner_type=all&status=all`,
      ),
    enabled: !!assignTo,
  });

  const members = useQuery({
    queryKey: ["admin-batch-members", membersOf?.id],
    queryFn: () => apiGet<BatchMember[]>(`/admin/batches/${membersOf?.id}/members`),
    enabled: !!membersOf,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-batches"] });
    void qc.invalidateQueries({ queryKey: ["admin-batch-members"] });
  };

  const create = useMutation({
    mutationFn: () => apiPost<Batch>("/admin/batches", form),
    onSuccess: () => {
      toast.success("Batch created");
      setForm(EMPTY);
      setShowCreate(false);
      refresh();
    },
    onError: (e) => toast.error(errText(e, "Could not create the batch")),
  });

  const assign = useMutation({
    mutationFn: () =>
      apiPost<Batch>(`/admin/batches/${assignTo?.id}/assign`, { registration_ids: picked }),
    onSuccess: (b) => {
      toast.success(`${picked.length} learner(s) assigned to ${b.name}`);
      setPicked([]);
      setAssignTo(null);
      refresh();
    },
    onError: (e) => toast.error(errText(e, "Assignment failed")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete<{ ok: boolean }>(`/admin/batches/${id}`),
    onSuccess: () => {
      toast.success("Batch deleted");
      refresh();
    },
    onError: () => toast.error("Could not delete the batch"),
  });

  const set = <K extends keyof BatchCreate>(k: K, v: BatchCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5" data-testid="batches-tab">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-100">Training Batches</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create a batch, then assign registered learners to it.
          </p>
        </div>
        <Button
          data-testid="batch-new-button"
          className="bg-sky-600 hover:bg-sky-500"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Batch
        </Button>
      </div>

      {batches.isError && (
        <p className="rounded-lg border border-slate-800 bg-[#0D1527] p-4 text-sm text-slate-400">
          Batches are unavailable right now.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(batches.data ?? []).map((b) => {
          const full = b.enrolled >= b.capacity;
          return (
            <Card
              key={b.id}
              data-testid={`batch-card-${b.id}`}
              className="border-slate-800 bg-[#111C35] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-semibold text-slate-100">{b.name}</h3>
                  <p className="mt-1 text-xs text-sky-300">{PROGRAM_LABEL[b.program] ?? b.program}</p>
                </div>
                <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">{b.status}</Badge>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-sky-500" /> Starts {b.start_date}
                </p>
                <p>{b.mode} · {b.timing}</p>
                <p className="inline-flex items-center gap-1.5" data-testid={`batch-capacity-${b.id}`}>
                  <Users className="h-3.5 w-3.5 text-sky-500" /> {b.enrolled} / {b.capacity} enrolled
                </p>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#1E2C4A]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-[width] duration-500"
                  style={{ width: `${Math.min(100, (b.enrolled / b.capacity) * 100)}%` }}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={full}
                  data-testid={`batch-assign-${b.id}`}
                  className="border-sky-500/40 text-sky-200 hover:bg-sky-500/10"
                  onClick={() => {
                    setAssignTo(b);
                    setPicked([]);
                  }}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> {full ? "Full" : "Assign"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid={`batch-members-${b.id}`}
                  className="border-slate-700 text-slate-200"
                  onClick={() => setMembersOf(b)}
                >
                  Members
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  data-testid={`batch-delete-${b.id}`}
                  className="text-rose-300 hover:bg-rose-500/10"
                  onClick={() => remove.mutate(b.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {batches.data && batches.data.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500" data-testid="batches-empty-state">
          No batches yet. Create your first batch to start scheduling learners.
        </p>
      )}

      {/* CREATE */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg" data-testid="batch-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">New batch</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="batch-name">Batch name</Label>
              <Input
                id="batch-name"
                required
                placeholder="DA Weekend — March"
                data-testid="batch-name-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Program</Label>
              <Select value={form.program} onValueChange={(v: string) => set("program", v)}>
                <SelectTrigger data-testid="batch-program-select">
                  <SelectValue>{(v) => PROGRAM_LABEL[v as string]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Mode</Label>
              <Select value={form.mode} onValueChange={(v: string) => set("mode", v)}>
                <SelectTrigger data-testid="batch-mode-select">
                  <SelectValue>{(v) => v as string}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BATCH_MODES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch-timing">Timing</Label>
              <Input
                id="batch-timing"
                required
                placeholder="Sat–Sun, 10am–1pm"
                data-testid="batch-timing-input"
                value={form.timing}
                onChange={(e) => set("timing", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch-start">Start date</Label>
              <Input
                id="batch-start"
                type="date"
                required
                data-testid="batch-start-input"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="batch-capacity">Capacity</Label>
              <Input
                id="batch-capacity"
                type="number"
                min={1}
                max={500}
                data-testid="batch-capacity-input"
                value={form.capacity}
                onChange={(e) => set("capacity", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: string) => set("status", v)}>
                <SelectTrigger data-testid="batch-status-select">
                  <SelectValue>{(v) => v as string}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BATCH_STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={create.isPending}
              data-testid="batch-create-submit"
              className="bg-sky-600 hover:bg-sky-500 sm:col-span-2"
            >
              {create.isPending ? "Creating…" : "Create batch"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGN */}
      <Dialog open={!!assignTo} onOpenChange={(o) => !o && setAssignTo(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl" data-testid="batch-assign-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Assign learners → {assignTo?.name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-400">
            Showing {assignTo ? PROGRAM_LABEL[assignTo.program] : ""} registrations. Seats left:{" "}
            {assignTo ? assignTo.capacity - assignTo.enrolled : 0}
          </p>
          <div className="mt-3 space-y-2">
            {(candidates.data ?? []).map((r) => (
              <label
                key={r.registration_id}
                data-testid={`batch-candidate-${r.registration_id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-3 text-sm text-slate-200"
              >
                <Checkbox
                  checked={picked.includes(r.registration_id)}
                  onCheckedChange={(c) =>
                    setPicked((p) =>
                      c === true
                        ? [...p, r.registration_id]
                        : p.filter((x) => x !== r.registration_id),
                    )
                  }
                />
                <span className="flex-1">
                  {r.full_name}
                  <span className="ml-2 font-mono text-[10px] text-sky-400">{r.registration_id}</span>
                </span>
                <Badge variant="secondary" className="bg-[#1E2E54] text-slate-200">{r.status}</Badge>
              </label>
            ))}
            {candidates.data && candidates.data.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No registrations for this program yet.
              </p>
            )}
          </div>
          <Button
            disabled={picked.length === 0 || assign.isPending}
            data-testid="batch-assign-submit"
            className="mt-4 bg-sky-600 hover:bg-sky-500"
            onClick={() => assign.mutate()}
          >
            {assign.isPending ? "Assigning…" : `Assign ${picked.length} learner(s)`}
          </Button>
        </DialogContent>
      </Dialog>

      {/* MEMBERS */}
      <Dialog open={!!membersOf} onOpenChange={(o) => !o && setMembersOf(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl" data-testid="batch-members-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">{membersOf?.name} — members</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(members.data ?? []).map((m) => (
              <div
                key={m.registration_id}
                data-testid={`batch-member-${m.registration_id}`}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-3 text-sm"
              >
                <span className="flex-1 text-slate-100">{m.full_name}</span>
                <span className="font-mono text-[10px] text-sky-400">{m.registration_id}</span>
                <span className="text-xs text-slate-400">{m.phone}</span>
                <Badge variant="secondary" className="bg-[#1E2E54] text-slate-200">{m.status}</Badge>
              </div>
            ))}
            {members.data && members.data.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                Nobody assigned to this batch yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

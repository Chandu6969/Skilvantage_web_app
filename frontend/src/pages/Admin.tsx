import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, LogOut, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, apiGet, apiPatch, apiPost } from "@/lib/api";
import { PROGRAMS, PROGRAM_LABEL } from "@/lib/programs";
import { LEAD_STATUSES } from "@/lib/types";
import type { AdminStats, AdminUser, Registration } from "@/lib/types";

const CHART_COLORS = ["#38BDF8", "#6366F1", "#10B981", "#F59E0B", "#06B6D4"];

function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiPost<AdminUser>("/admin/login", { email, password }),
    onSuccess: () => onLoggedIn(),
    onError: (err) =>
      toast.error(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password"
          : "Login failed. Try again.",
      ),
  });

  return (
    <div className="grid min-h-screen place-items-center bg-[#070B14] px-4">
      <Card className="w-full max-w-sm border-slate-800 bg-[#111C35] p-7" data-testid="admin-login-card">
        <ShieldCheck className="h-7 w-7 text-sky-400" />
        <h1 className="mt-4 font-heading text-xl font-bold text-slate-100">SkilVantage Admin</h1>
        <p className="mt-1.5 text-sm text-slate-400">Lead management dashboard</p>
        <form
          className="mt-6 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              required
              data-testid="admin-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              required
              data-testid="admin-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="admin-login-button"
            className="mt-1 bg-sky-600 hover:bg-sky-500"
          >
            {mutation.isPending ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function StatCard({ label, value, testid }: { label: string; value: string | number; testid: string }) {
  return (
    <Card
      className="border-slate-800 bg-[#111C35] p-5 transition-colors duration-200 hover:border-sky-400/50"
      data-testid={testid}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-slate-50">{value}</p>
    </Card>
  );
}

function Dashboard({ user, onLogout }: { user: AdminUser; onLogout: () => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [program, setProgram] = useState("all");
  const [learnerType, setLearnerType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");

  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: () => apiGet<AdminStats>("/admin/stats") });

  const listKey = ["admin-registrations", q, program, learnerType, status];
  const list = useQuery({
    queryKey: listKey,
    queryFn: () => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      p.set("program", program);
      p.set("learner_type", learnerType);
      p.set("status", status);
      return apiGet<Registration[]>(`/admin/registrations?${p.toString()}`);
    },
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: Record<string, string> }) =>
      apiPatch<Registration>(`/admin/registrations/${vars.id}`, vars.body),
    onSuccess: (row) => {
      toast.success("Lead updated");
      setSelected(row);
      void qc.invalidateQueries({ queryKey: ["admin-registrations"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => toast.error("Update failed"),
  });

  const logout = useMutation({
    mutationFn: () => apiPost("/admin/logout"),
    onSuccess: () => {
      qc.clear();
      onLogout();
    },
  });

  const s = stats.data;

  return (
    <div className="min-h-screen bg-[#070B14]">
      <header className="glass sticky top-0 z-40 border-b border-sky-500/15">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-4 px-4 py-3.5 sm:px-6">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          <span className="font-heading text-base font-bold text-slate-50">SkilVantage Admin</span>
          <span className="ml-auto text-xs text-slate-400" data-testid="admin-user-email">{user.email}</span>
          <a
            href="/api/admin/export"
            data-testid="admin-export-link"
            className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 px-3 py-1.5 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-500/10"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </a>
          <Button variant="ghost" size="sm" onClick={() => logout.mutate()} data-testid="admin-logout-button">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-8 sm:px-6">
        {stats.isError && (
          <p className="rounded-lg border border-slate-800 bg-[#0D1527] p-4 text-sm text-slate-400">
            Metrics are unavailable right now.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8" data-testid="admin-stat-cards">
          <StatCard label="Total Leads" value={s?.total_leads ?? "—"} testid="stat-total-leads" />
          <StatCard label="Student Leads" value={s?.student_leads ?? "—"} testid="stat-student-leads" />
          <StatCard label="Professional" value={s?.professional_leads ?? "—"} testid="stat-professional-leads" />
          <StatCard label="New" value={s?.new_leads ?? "—"} testid="stat-new-leads" />
          <StatCard label="Follow-ups Pending" value={s?.follow_ups_pending ?? "—"} testid="stat-followups" />
          <StatCard label="Converted" value={s?.converted ?? "—"} testid="stat-converted" />
          <StatCard label="Conversion Rate" value={s ? `${s.conversion_rate}%` : "—"} testid="stat-conversion-rate" />
          <StatCard label="Enquiries" value={s?.enquiries ?? "—"} testid="stat-enquiries" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-800 bg-[#111C35] p-5" data-testid="chart-by-program">
            <h2 className="font-heading text-sm font-semibold text-slate-100">Registrations by Course</h2>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s?.by_program ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={10} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0D1527", border: "1px solid #1E2C4A", borderRadius: 8, color: "#F1F5F9" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {(s?.by_program ?? []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-slate-800 bg-[#111C35] p-5" data-testid="chart-by-day">
            <h2 className="font-heading text-sm font-semibold text-slate-100">New Registrations (14 days)</h2>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s?.by_day ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#0D1527", border: "1px solid #1E2C4A", borderRadius: 8, color: "#F1F5F9" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#38BDF8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="border-slate-800 bg-[#111C35] p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search name, email, phone or ID"
                className="pl-9"
                data-testid="admin-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-44" data-testid="admin-program-filter">
                <SelectValue>{(v) => (v === "all" ? "All courses" : PROGRAM_LABEL[v as string])}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {PROGRAMS.map((p) => (
                  <SelectItem key={p.slug} value={p.slug}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={learnerType} onValueChange={setLearnerType}>
              <SelectTrigger className="w-40" data-testid="admin-learner-filter">
                <SelectValue>
                  {(v) => (v === "all" ? "All learners" : v === "student" ? "Students" : "Professionals")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All learners</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="professional">Professionals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48" data-testid="admin-status-filter">
                <SelectValue>{(v) => (v === "all" ? "All statuses" : (v as string))}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {LEAD_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            <Table data-testid="admin-registrations-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Registration ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((r) => (
                  <TableRow key={r.registration_id} data-testid={`admin-row-${r.registration_id}`}>
                    <TableCell className="font-mono text-xs text-sky-300">{r.registration_id}</TableCell>
                    <TableCell className="text-slate-100">{r.full_name}</TableCell>
                    <TableCell className="text-slate-400">
                      {r.learner_type === "student" ? "Student" : "Professional"}
                    </TableCell>
                    <TableCell className="text-slate-400">{PROGRAM_LABEL[r.program] ?? r.program}</TableCell>
                    <TableCell className="text-slate-400">{r.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`admin-view-${r.registration_id}`}
                        className="border-slate-700 text-slate-200"
                        onClick={() => {
                          setSelected(r);
                          setNoteDraft(r.notes ?? "");
                          setFollowUpDraft(r.follow_up_date ?? "");
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!list.isLoading && (list.data ?? []).length === 0 && (
              <p className="py-10 text-center text-sm text-slate-500" data-testid="admin-empty-state">
                No registrations match these filters.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" data-testid="admin-lead-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selected?.full_name} · {selected?.registration_id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {(
                  [
                    ["Email", selected.email],
                    ["Phone", selected.phone],
                    ["City", selected.city],
                    ["State", selected.state],
                    ["Course", PROGRAM_LABEL[selected.program]],
                    ["Learner type", selected.learner_type],
                    ["College", selected.college],
                    ["Degree", selected.degree],
                    ["Company", selected.current_company],
                    ["Current role", selected.current_role],
                    ["Experience", selected.experience_years],
                    ["Target role", selected.target_role],
                    ["Learning mode", selected.learning_mode],
                    ["Expected package", selected.expected_package],
                    ["LinkedIn", selected.linkedin],
                    ["GitHub", selected.github],
                  ] as [string, string | null | undefined][]
                )
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="rounded-md border border-slate-800 bg-[#0D1527] p-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">{k}</p>
                      <p className="mt-1 break-words text-slate-200">{v}</p>
                    </div>
                  ))}
              </div>

              {selected.resume_file_id && (
                <a
                  href={`/api/admin/resumes/${selected.resume_file_id}`}
                  data-testid="admin-download-resume"
                  className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 px-3 py-2 text-xs text-sky-200 hover:bg-sky-500/10"
                >
                  <Download className="h-3.5 w-3.5" /> Download resume ({selected.resume_filename})
                </a>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Lead status</Label>
                  <Select
                    value={selected.status}
                    onValueChange={(v: string) =>
                      update.mutate({ id: selected.registration_id, body: { status: v } })
                    }
                  >
                    <SelectTrigger data-testid="admin-status-select">
                      <SelectValue>{(v) => v as string}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="followup">Follow-up date</Label>
                  <Input
                    id="followup"
                    type="date"
                    data-testid="admin-followup-input"
                    value={followUpDraft}
                    onChange={(e) => setFollowUpDraft(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Counsellor notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  data-testid="admin-notes-input"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />
              </div>

              <Button
                data-testid="admin-save-lead-button"
                disabled={update.isPending}
                className="bg-sky-600 hover:bg-sky-500"
                onClick={() =>
                  update.mutate({
                    id: selected.registration_id,
                    body: {
                      notes: noteDraft || " ",
                      ...(followUpDraft ? { follow_up_date: followUpDraft } : {}),
                    },
                  })
                }
              >
                {update.isPending ? "Saving…" : "Save notes & follow-up"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => apiGet<AdminUser>("/admin/me"),
    retry: false,
  });

  if (me.isLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#070B14] text-slate-400">Loading…</div>;
  }

  if (!me.data) {
    return <LoginScreen onLoggedIn={() => void qc.invalidateQueries({ queryKey: ["admin-me"] })} />;
  }

  return (
    <Dashboard
      user={me.data}
      onLogout={() => void qc.invalidateQueries({ queryKey: ["admin-me"] })}
    />
  );
}

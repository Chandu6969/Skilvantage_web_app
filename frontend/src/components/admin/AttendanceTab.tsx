import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Download, FileDown, Users } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import HolidayCalendarCard from "@/components/admin/HolidayCalendarCard";
import StudentDetailDialog from "@/components/admin/StudentDetailDialog";
import { ATTENDANCE_CODES, ATTENDANCE_LABELS } from "@/lib/types";
import type { AttendanceDay, AttendanceRangeSummary, RosterType } from "@/lib/types";
import { cn } from "@/lib/utils";

const CODE_STYLE: Record<string, string> = {
  P: "bg-emerald-500 text-white border-emerald-500",
  A: "bg-rose-500 text-white border-rose-500",
  L: "bg-amber-500 text-white border-amber-500",
  LT: "bg-orange-500 text-white border-orange-500",
  H: "bg-slate-600 text-white border-slate-600",
  NC: "bg-slate-700 text-slate-300 border-slate-700",
  T: "bg-sky-500 text-white border-sky-500",
};

function firstOfMonth(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

export default function AttendanceTab({
  learnerType = "student",
}: {
  learnerType?: RosterType;
}) {
  const qc = useQueryClient();
  const [day, setDay] = useState<string>("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  // The server owns "today" — the sheet loads without a date and reports the date it used.
  const sheet = useQuery({
    queryKey: ["attendance-day", learnerType, day],
    queryFn: () =>
      apiGet<AttendanceDay>(
        `/admin/attendance/day?learner_type=${learnerType}${day ? `&date=${day}` : ""}`,
      ),
  });

  const activeDate = sheet.data?.date ?? "";
  const from = range.from || (activeDate ? firstOfMonth(activeDate) : "");
  const to = range.to || activeDate;

  const summary = useQuery({
    queryKey: ["attendance-summary", learnerType, from, to],
    queryFn: () =>
      apiGet<AttendanceRangeSummary>(
        `/admin/attendance/summary?date_from=${from}&date_to=${to}&learner_type=${learnerType}`,
      ),
    enabled: !!from && !!to,
  });

  const save = useMutation({
    mutationFn: (vars: { date: string; student_id: string; code: string }) =>
      apiPost<AttendanceDay>("/admin/attendance/save", {
        date: vars.date,
        marks: [{ student_id: vars.student_id, code: vars.code }],
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["attendance-day"] });
      void qc.invalidateQueries({ queryKey: ["attendance-summary"] });
    },
    onError: (e) =>
      toast.error(
        e instanceof ApiError && e.body && typeof e.body === "object"
          ? String((e.body as { detail?: unknown }).detail ?? "Could not save")
          : "Could not save attendance",
      ),
  });

  const markAll = useMutation({
    mutationFn: (code: string) =>
      apiPost<AttendanceDay>(
        `/admin/attendance/mark-all?code=${code}&learner_type=${learnerType}${activeDate ? `&date=${activeDate}` : ""}`,
      ),
    onSuccess: (d) => {
      toast.success(`All ${d.total} students marked`);
      void qc.invalidateQueries({ queryKey: ["attendance-day"] });
      void qc.invalidateQueries({ queryKey: ["attendance-summary"] });
    },
    onError: () => toast.error("Bulk marking failed"),
  });

  const rows = useMemo(() => {
    const all = sheet.data?.rows ?? [];
    const q = search.trim().toLowerCase();
    return q ? all.filter((r) => r.full_name.toLowerCase().includes(q)) : all;
  }, [sheet.data, search]);

  const pdfHref = `/api/admin/attendance/export.pdf?date_from=${from}&date_to=${to}&learner_type=${learnerType}`;
  const csvHref = `/api/admin/attendance/export.csv?date_from=${from}&date_to=${to}&learner_type=${learnerType}`;

  return (
    <div className="space-y-5" data-testid={learnerType === "professional" ? "attendance-tab-professional" : "attendance-tab"}>
      <StudentDetailDialog studentId={detailId} onClose={() => setDetailId(null)} />

      {/* DATE + BULK CONTROLS */}
      <Card className="border-slate-800 bg-[#111C35] p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="att-date">Attendance date</Label>
            <Input
              id="att-date"
              type="date"
              className="w-44"
              data-testid="attendance-date-input"
              value={activeDate}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {sheet.data?.is_today && (
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-300" data-testid="attendance-today-badge">
                Today
              </Badge>
            )}
            {sheet.data?.holiday_name && (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-300"
                data-testid="attendance-holiday-badge"
              >
                {sheet.data.holiday_code === "NC" ? "No Class" : "Holiday"}: {sheet.data.holiday_name}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300" data-testid="attendance-marked-count">
              {sheet.data ? `${sheet.data.marked} / ${sheet.data.total} marked` : "—"}
            </Badge>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={markAll.isPending}
              data-testid="attendance-mark-all-present"
              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
              onClick={() => markAll.mutate("P")}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Mark all Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={markAll.isPending}
              data-testid="attendance-mark-all-holiday"
              className="border-slate-700 text-slate-300"
              onClick={() => markAll.mutate("H")}
            >
              Mark all Holiday
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Legend</span>
          {ATTENDANCE_CODES.map((c) => (
            <span key={c} className={cn("rounded border px-2 py-0.5 text-[10px] font-semibold", CODE_STYLE[c])}>
              {c} · {ATTENDANCE_LABELS[c]}
            </span>
          ))}
        </div>
      </Card>

      {/* MARKING SHEET */}
      <Card className="border-slate-800 bg-[#111C35] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Users className="h-4 w-4 text-sky-400" />
          <h3 className="font-heading text-sm font-semibold text-slate-100">
            {learnerType === "professional" ? "Mark professional attendance" : "Mark attendance"} —{" "}
            {activeDate || "…"}
          </h3>
          <Input
            placeholder={learnerType === "professional" ? "Search professional" : "Search student"}
            className="ml-auto w-56"
            data-testid="attendance-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          {rows.map((r, i) => (
            <div
              key={r.student_id}
              data-testid={`attendance-row-${r.student_id}`}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-3 transition-colors duration-200 hover:border-sky-400/40"
            >
              <span className="w-6 font-mono text-xs text-slate-500">{i + 1}</span>
              <div className="min-w-[180px] flex-1">
                <button
                  type="button"
                  data-testid={`attendance-view-student-${r.student_id}`}
                  onClick={() => setDetailId(r.student_id)}
                  className="text-left text-sm font-semibold text-slate-100 transition-colors hover:text-sky-300"
                >
                  {r.full_name}
                </button>
                <p className="text-[11px] text-slate-400">
                  {[r.year, r.branch].filter(Boolean).join(" · ") || "—"}
                  {r.phone ? ` · ${r.phone}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ATTENDANCE_CODES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    data-testid={`attendance-set-${r.student_id}-${c}`}
                    onClick={() =>
                      save.mutate({
                        date: activeDate,
                        student_id: r.student_id,
                        code: r.code === c ? "" : c,
                      })
                    }
                    className={cn(
                      "min-w-9 rounded border px-2 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95",
                      r.code === c
                        ? CODE_STYLE[c]
                        : "border-slate-700 text-slate-400 hover:border-sky-500/60 hover:text-sky-300",
                    )}
                    title={ATTENDANCE_LABELS[c]}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {sheet.data && rows.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500" data-testid="attendance-empty-state">
              {learnerType === "professional"
                ? "No working professionals found. Add them in the Professionals tab first."
                : "No students found. Add students in the Students tab first."}
            </p>
          )}
        </div>
      </Card>

      <HolidayCalendarCard month={activeDate ? activeDate.slice(0, 7) : ""} />

      {/* RANGE FILTER + PDF */}
      <Card className="border-slate-800 bg-[#111C35] p-5" data-testid="attendance-range-card">
        <div className="flex flex-wrap items-end gap-4">
          <CalendarDays className="mb-2.5 h-4 w-4 text-sky-400" />
          <div className="grid gap-2">
            <Label htmlFor="att-from">From</Label>
            <Input
              id="att-from"
              type="date"
              className="w-44"
              data-testid="attendance-from-input"
              value={from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="att-to">To</Label>
            <Input
              id="att-to"
              type="date"
              className="w-44"
              data-testid="attendance-to-input"
              value={to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
          <Badge variant="secondary" className="mb-2 bg-[#1E2E54] text-sky-300" data-testid="attendance-overall-percentage">
            Overall {summary.data ? `${summary.data.overall_percentage}%` : "—"}
          </Badge>
          <div className="ml-auto flex flex-wrap gap-2">
            <a
              href={pdfHref}
              data-testid="attendance-download-pdf"
              className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-500"
            >
              <FileDown className="h-3.5 w-3.5" /> Download PDF
            </a>
            <a
              href={csvHref}
              data-testid="attendance-download-csv"
              className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 px-4 py-2 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-500/10"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </a>
          </div>
        </div>

        {summary.isError && (
          <p className="mt-4 text-sm text-rose-300">
            Could not load that range. Check the dates (max 120 days).
          </p>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm" data-testid="attendance-summary-table">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="pb-2 pr-3 font-mono text-[10px] uppercase tracking-widest text-sky-400">#</th>
                <th className="pb-2 pr-3 font-mono text-[10px] uppercase tracking-widest text-sky-400">Student</th>
                {ATTENDANCE_CODES.map((c) => (
                  <th key={c} className="pb-2 pr-3 text-center font-mono text-[10px] uppercase tracking-widest text-sky-400">
                    {c}
                  </th>
                ))}
                <th className="pb-2 pr-3 text-center font-mono text-[10px] uppercase tracking-widest text-sky-400">Days</th>
                <th className="pb-2 text-center font-mono text-[10px] uppercase tracking-widest text-sky-400">Attn %</th>
              </tr>
            </thead>
            <tbody>
              {(summary.data?.students ?? []).map((s, i) => (
                <tr
                  key={s.student_id}
                  data-testid={`attendance-summary-row-${s.student_id}`}
                  className="border-b border-slate-800/60"
                >
                  <td className="py-2 pr-3 font-mono text-xs text-slate-500">{i + 1}</td>
                  <td className="py-2 pr-3 text-slate-100">
                    {s.full_name}
                    <span className="ml-2 text-[11px] text-slate-500">
                      {[s.year, s.branch].filter(Boolean).join(" · ")}
                    </span>
                  </td>
                  {ATTENDANCE_CODES.map((c) => (
                    <td key={c} className="py-2 pr-3 text-center text-slate-300">
                      {s.counts[c] ?? 0}
                    </td>
                  ))}
                  <td className="py-2 pr-3 text-center text-slate-300">{s.working_days}</td>
                  <td
                    className={cn(
                      "py-2 text-center font-semibold",
                      s.percentage >= 75
                        ? "text-emerald-300"
                        : s.percentage >= 50
                          ? "text-amber-300"
                          : "text-rose-300",
                    )}
                  >
                    {s.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

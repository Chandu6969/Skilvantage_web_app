import { useQuery } from "@tanstack/react-query";
import { CalendarClock, IndianRupee, Phone, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet } from "@/lib/api";
import { ATTENDANCE_CODES, ATTENDANCE_LABELS } from "@/lib/types";
import type { StudentDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

const CODE_TONE: Record<string, string> = {
  P: "text-emerald-300",
  A: "text-rose-300",
  L: "text-amber-300",
  LT: "text-orange-300",
  H: "text-slate-400",
  NC: "text-slate-500",
  T: "text-sky-300",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function StudentDetailDialog({
  studentId,
  onClose,
}: {
  studentId: string | null;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ["student-detail", studentId],
    queryFn: () => apiGet<StudentDetail>(`/admin/students/${studentId}/detail`),
    enabled: !!studentId,
  });

  const d = detail.data;

  return (
    <Dialog open={!!studentId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[88vh] overflow-y-auto sm:max-w-3xl"
        data-testid="student-detail-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-heading" data-testid="student-detail-name">
            {d ? d.student.full_name : "Loading…"}
          </DialogTitle>
        </DialogHeader>

        {d && (
          <div className="space-y-6">
            {/* PROFILE */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge variant="secondary" className="bg-sky-500/15 text-sky-300">
                {d.student.learner_type === "professional" ? "Working Professional" : "Student"}
              </Badge>
              <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
                {(d.student.learner_type === "professional"
                  ? [d.student.company, d.student.current_role]
                  : [d.student.year, d.student.branch]
                )
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Badge>
              {d.student.learner_type === "professional" && d.student.experience_years && (
                <span>{d.student.experience_years} yrs exp</span>
              )}
              {d.student.learner_type === "professional" && d.student.target_role && (
                <span>→ {d.student.target_role}</span>
              )}
              {d.student.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {d.student.phone}
                </span>
              )}
              {d.student.email && <span>{d.student.email}</span>}
              {d.student.notice_period && <span>Notice: {d.student.notice_period}</span>}
              {d.student.current_package && <span>Current: {d.student.current_package}</span>}
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">
                  Attendance
                </p>
                <p
                  className={cn(
                    "mt-1.5 font-heading text-xl font-bold",
                    d.percentage >= 75
                      ? "text-emerald-300"
                      : d.percentage >= 50
                        ? "text-amber-300"
                        : "text-rose-300",
                  )}
                  data-testid="student-detail-percentage"
                >
                  {d.percentage}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">
                  Working days
                </p>
                <p className="mt-1.5 font-heading text-xl font-bold text-slate-100">
                  {d.attended} / {d.working_days}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">
                  Paid to date
                </p>
                <p
                  className="mt-1.5 font-heading text-xl font-bold text-emerald-300"
                  data-testid="student-detail-paid"
                >
                  {inr(d.paid_to_date)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">
                  Months paid
                </p>
                <p className="mt-1.5 font-heading text-xl font-bold text-slate-100">
                  {d.months_paid}
                </p>
              </div>
            </div>

            {/* CODE BREAKDOWN */}
            <div>
              <h3 className="font-heading text-sm font-semibold text-slate-100">Breakdown</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {ATTENDANCE_CODES.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-slate-800 bg-[#0D1527] px-3 py-1.5 text-xs text-slate-300"
                  >
                    {ATTENDANCE_LABELS[c]}{" "}
                    <b className={cn("ml-1", CODE_TONE[c])}>{d.counts[c] ?? 0}</b>
                  </span>
                ))}
              </div>
            </div>

            {/* ATTENDANCE HISTORY */}
            <div>
              <h3 className="flex items-center gap-2 font-heading text-sm font-semibold text-slate-100">
                <CalendarClock className="h-4 w-4 text-sky-400" /> Attendance history
              </h3>
              <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {d.history.map((h) => (
                  <div
                    key={h.date}
                    data-testid={`student-history-${h.date}`}
                    className="flex items-center gap-3 rounded-md border border-slate-800 bg-[#0D1527] px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-slate-400">{h.date}</span>
                    <span className={cn("font-semibold", CODE_TONE[h.code])}>{h.label}</span>
                    {h.auto && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-500">
                        <Sparkles className="h-3 w-3" /> auto (holiday)
                      </span>
                    )}
                  </div>
                ))}
                {d.history.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-500">
                    No attendance recorded yet.
                  </p>
                )}
              </div>
            </div>

            {/* PAYMENT LEDGER */}
            <div>
              <h3 className="flex items-center gap-2 font-heading text-sm font-semibold text-slate-100">
                <IndianRupee className="h-4 w-4 text-sky-400" /> Payment ledger
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Monthly amount {inr(d.monthly_amount)}
                {d.student.total_fee != null && ` · Total fee ${inr(d.student.total_fee)}`}
                {d.balance != null && ` · Balance ${inr(d.balance)}`}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-xs" data-testid="student-ledger-table">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      {["Month", "Status", "Amount", "Method", "Paid on", "Notes"].map((h) => (
                        <th
                          key={h}
                          className="pb-2 pr-3 font-mono text-[10px] uppercase tracking-widest text-sky-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.ledger.map((p) => (
                      <tr
                        key={p.month}
                        data-testid={`student-ledger-${p.month}`}
                        className="border-b border-slate-800/60"
                      >
                        <td className="py-2 pr-3 font-mono text-slate-300">{p.month}</td>
                        <td className="py-2 pr-3">
                          <span className={p.paid ? "text-emerald-300" : "text-amber-300"}>
                            {p.paid ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-slate-300">
                          {p.amount ? inr(p.amount) : "—"}
                        </td>
                        <td className="py-2 pr-3 text-slate-400">{p.method || "—"}</td>
                        <td className="py-2 pr-3 text-slate-400">{p.paid_on || "—"}</td>
                        <td className="py-2 text-slate-400">{p.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {d.ledger.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-500">
                    No payments recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

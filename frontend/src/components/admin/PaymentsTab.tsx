import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileDown, IndianRupee, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost } from "@/lib/api";
import { PAYMENT_AMOUNTS } from "@/lib/types";
import type { PaymentBoard, PaymentRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const METHODS = ["UPI", "Cash", "Bank Transfer", "Card", "Other"];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function StatCard({
  label,
  value,
  tone,
  testid,
}: {
  label: string;
  value: string;
  tone?: string;
  testid: string;
}) {
  return (
    <Card className="border-slate-800 bg-[#111C35] p-5" data-testid={testid}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">{label}</p>
      <p className={cn("mt-2 font-heading text-2xl font-bold text-slate-50", tone)}>{value}</p>
    </Card>
  );
}

function PaymentCard({
  row,
  month,
  onSave,
  pending,
}: {
  row: PaymentRow;
  month: string;
  onSave: (body: Record<string, unknown>) => void;
  pending: boolean;
}) {
  const [amount, setAmount] = useState<string>(row.amount ? String(row.amount) : "");
  const [method, setMethod] = useState<string>(row.method ?? "UPI");
  const [notes, setNotes] = useState<string>(row.notes ?? "");

  const save = (paid: boolean) =>
    onSave({
      student_id: row.student_id,
      month,
      paid,
      amount: paid ? Number(amount || PAYMENT_AMOUNTS[0]) : null,
      method: paid ? method : null,
      notes,
    });

  return (
    <Card
      data-testid={`payment-card-${row.student_id}`}
      className={cn(
        "border bg-[#0D1527] p-5 transition-colors duration-200",
        row.paid ? "border-emerald-500/40" : "border-slate-800 hover:border-sky-400/40",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">{row.full_name}</p>
          <p className="text-[11px] text-slate-400">
            {[row.year, row.branch].filter(Boolean).join(" · ") || "—"}
            {row.phone ? ` · ${row.phone}` : ""}
          </p>
        </div>
        <Badge
          variant="secondary"
          data-testid={`payment-status-${row.student_id}`}
          className={row.paid ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}
        >
          {row.paid ? "Paid" : "Pending"}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 sm:grid-cols-4">
        <div>
          <p className="font-mono uppercase tracking-wider text-sky-400">Paid to date</p>
          <p className="mt-0.5 text-slate-200">{inr(row.paid_to_date)}</p>
        </div>
        <div>
          <p className="font-mono uppercase tracking-wider text-sky-400">Months paid</p>
          <p className="mt-0.5 text-slate-200">{row.months_paid}</p>
        </div>
        <div>
          <p className="font-mono uppercase tracking-wider text-sky-400">Total fee</p>
          <p className="mt-0.5 text-slate-200">
            {row.total_fee != null ? inr(row.total_fee) : "—"}
          </p>
        </div>
        <div>
          <p className="font-mono uppercase tracking-wider text-sky-400">Balance</p>
          <p className="mt-0.5 text-slate-200">{row.balance != null ? inr(row.balance) : "—"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label className="text-[11px]">Amount</Label>
          <div className="flex gap-1.5">
            {PAYMENT_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                data-testid={`payment-amount-${row.student_id}-${a}`}
                onClick={() => setAmount(String(a))}
                className={cn(
                  "rounded border px-2 py-1 text-[11px] font-semibold transition-colors",
                  Number(amount) === a
                    ? "border-sky-400 bg-sky-500/15 text-sky-200"
                    : "border-slate-700 text-slate-400 hover:text-sky-300",
                )}
              >
                ₹{a}
              </button>
            ))}
            <Input
              className="h-8 w-20 text-xs"
              placeholder="Other"
              data-testid={`payment-amount-input-${row.student_id}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-[11px]">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="h-8 text-xs" data-testid={`payment-method-${row.student_id}`}>
              <SelectValue>{(v) => (v as string) || "Select"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {METHODS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label className="text-[11px]">Notes</Label>
          <Input
            className="h-8 text-xs"
            data-testid={`payment-notes-${row.student_id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending}
          data-testid={`payment-mark-paid-${row.student_id}`}
          className="bg-emerald-600 hover:bg-emerald-500"
          onClick={() => save(true)}
        >
          Mark Paid
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          data-testid={`payment-mark-unpaid-${row.student_id}`}
          className="border-slate-700 text-slate-300"
          onClick={() => save(false)}
        >
          Not Paid
        </Button>
        {row.paid_on && (
          <span className="self-center text-[11px] text-slate-500">Paid on {row.paid_on}</span>
        )}
      </div>
    </Card>
  );
}

export default function PaymentsTab() {
  const qc = useQueryClient();
  const [month, setMonth] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [search, setSearch] = useState("");

  const board = useQuery({
    queryKey: ["payments", month],
    queryFn: () => apiGet<PaymentBoard>(`/admin/payments${month ? `?month=${month}` : ""}`),
  });

  const activeMonth = board.data?.month ?? "";

  const upsert = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost("/admin/payments", body),
    onSuccess: () => {
      toast.success("Payment updated");
      void qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: () => toast.error("Could not update the payment"),
  });

  const rows = useMemo(() => {
    let list = board.data?.rows ?? [];
    if (filter === "paid") list = list.filter((r) => r.paid);
    if (filter === "pending") list = list.filter((r) => !r.paid);
    const q = search.trim().toLowerCase();
    return q ? list.filter((r) => r.full_name.toLowerCase().includes(q)) : list;
  }, [board.data, filter, search]);

  const b = board.data;

  return (
    <div className="space-y-5" data-testid="payments-tab">
      <Card className="border-slate-800 bg-[#111C35] p-5">
        <div className="flex flex-wrap items-end gap-4">
          <Wallet className="mb-2.5 h-4 w-4 text-sky-400" />
          <div className="grid gap-2">
            <Label htmlFor="pay-month">Payment month</Label>
            <Input
              id="pay-month"
              type="month"
              className="w-44"
              data-testid="payments-month-input"
              value={activeMonth}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={filter} onValueChange={(v: string) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-36" data-testid="payments-status-filter">
                <SelectValue>
                  {(v) => (v === "all" ? "All" : v === "paid" ? "Paid" : "Pending")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pay-search">Search</Label>
            <Input
              id="pay-search"
              className="w-52"
              placeholder="Student name"
              data-testid="payments-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <a
              href={`/api/admin/payments/export.pdf?month=${activeMonth}`}
              data-testid="payments-download-pdf"
              className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-500"
            >
              <FileDown className="h-3.5 w-3.5" /> PDF
            </a>
            <a
              href={`/api/admin/payments/export.csv?month=${activeMonth}`}
              data-testid="payments-download-csv"
              className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 px-4 py-2 text-xs font-medium text-sky-200 transition-colors hover:bg-sky-500/10"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </a>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Paid / Total"
          value={b ? `${b.paid_count} / ${b.total_students}` : "—"}
          testid="payments-stat-paid"
        />
        <StatCard
          label="Paid %"
          value={b ? `${b.paid_percentage}%` : "—"}
          tone="text-emerald-300"
          testid="payments-stat-percentage"
        />
        <StatCard
          label="Pending"
          value={b ? String(b.pending_count) : "—"}
          tone="text-amber-300"
          testid="payments-stat-pending"
        />
        <StatCard
          label="Expected"
          value={b ? inr(b.expected_revenue) : "—"}
          testid="payments-stat-expected"
        />
        <StatCard
          label="Collected"
          value={b ? inr(b.collected) : "—"}
          tone="text-emerald-300"
          testid="payments-stat-collected"
        />
        <StatCard
          label="Outstanding"
          value={b ? inr(b.outstanding) : "—"}
          tone="text-rose-300"
          testid="payments-stat-outstanding"
        />
      </div>

      <Card className="border-slate-800 bg-[#111C35] p-5" data-testid="payments-lifetime-card">
        <div className="flex flex-wrap items-center gap-3">
          <IndianRupee className="h-4 w-4 text-sky-400" />
          <h3 className="font-heading text-sm font-semibold text-slate-100">All-time totals</h3>
          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-300">
            Collected {b ? inr(b.lifetime_collected) : "—"}
          </Badge>
          <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
            Course fees on file {b ? inr(b.lifetime_expected) : "—"}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((r) => (
          <PaymentCard
            key={r.student_id}
            row={r}
            month={activeMonth}
            pending={upsert.isPending}
            onSave={(body) => upsert.mutate(body)}
          />
        ))}
      </div>

      {b && rows.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500" data-testid="payments-empty-state">
          No students match these filters.
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Plus, Trash2, Wand2 } from "lucide-react";
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
import { ApiError, apiDelete, apiGet, apiPost } from "@/lib/api";
import type { Holiday, HolidayBulkResult } from "@/lib/types";

const WEEKDAYS = [
  { v: "6", l: "Sunday" },
  { v: "5", l: "Saturday" },
  { v: "0", l: "Monday" },
  { v: "1", l: "Tuesday" },
  { v: "2", l: "Wednesday" },
  { v: "3", l: "Thursday" },
  { v: "4", l: "Friday" },
];

function errText(e: unknown, fallback: string) {
  if (e instanceof ApiError && e.body && typeof e.body === "object") {
    const d = (e.body as { detail?: unknown }).detail;
    if (typeof d === "string") return d;
  }
  return fallback;
}

export default function HolidayCalendarCard({ month }: { month: string }) {
  const qc = useQueryClient();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("H");
  const [weekday, setWeekday] = useState("6");

  const monthKey = month || "";
  const from = monthKey ? `${monthKey}-01` : "";
  // Real last day of the month — not every month has 31 days.
  const to = monthKey
    ? new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0)
        .toISOString()
        .slice(0, 10)
    : "";

  const holidays = useQuery({
    queryKey: ["holidays", monthKey],
    queryFn: () => apiGet<Holiday[]>(`/admin/holidays?date_from=${from}&date_to=${to}`),
    enabled: !!monthKey,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["holidays"] });
    void qc.invalidateQueries({ queryKey: ["attendance-day"] });
    void qc.invalidateQueries({ queryKey: ["attendance-summary"] });
  };

  const add = useMutation({
    mutationFn: () => apiPost<Holiday>("/admin/holidays", { date, name, code }),
    onSuccess: () => {
      toast.success("Holiday added — the register auto-fills it");
      setDate("");
      setName("");
      refresh();
    },
    onError: (e) => toast.error(errText(e, "Could not add the holiday")),
  });

  const fillWeekly = useMutation({
    mutationFn: () =>
      apiPost<HolidayBulkResult>(
        `/admin/holidays/fill-weekly?month=${monthKey}&weekday=${weekday}&name=${encodeURIComponent(
          WEEKDAYS.find((w) => w.v === weekday)?.l ?? "Weekly off",
        )}`,
      ),
    onSuccess: (r) => {
      toast.success(
        r.created
          ? `${r.created} ${WEEKDAYS.find((w) => w.v === weekday)?.l}(s) marked as holiday`
          : "Those dates are already holidays",
      );
      refresh();
    },
    onError: (e) => toast.error(errText(e, "Could not preset those days")),
  });

  const clearMonth = useMutation({
    mutationFn: () => apiPost<HolidayBulkResult>(`/admin/holidays/clear-month?month=${monthKey}`),
    onSuccess: (r) => {
      toast.success(`${r.skipped} holiday(s) cleared for ${monthKey}`);
      refresh();
    },
    onError: () => toast.error("Could not clear the month"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete<{ ok: boolean }>(`/admin/holidays/${id}`),
    onSuccess: () => {
      toast.success("Holiday removed");
      refresh();
    },
    onError: () => toast.error("Could not remove the holiday"),
  });

  return (
    <Card className="border-slate-800 bg-[#111C35] p-5" data-testid="holiday-calendar-card">
      <div className="flex flex-wrap items-center gap-3">
        <CalendarOff className="h-4 w-4 text-sky-400" />
        <h3 className="font-heading text-sm font-semibold text-slate-100">
          Holiday calendar — {monthKey || "…"}
        </h3>
        <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300" data-testid="holiday-count">
          {holidays.data ? `${holidays.data.length} this month` : "—"}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Holidays auto-fill the register for every student. An explicit mark on a student always
        overrides the holiday.
      </p>

      {/* PRESET WEEKLY OFF */}
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-800 pt-4">
        <div className="grid gap-2">
          <Label>Preset every</Label>
          <Select value={weekday} onValueChange={setWeekday}>
            <SelectTrigger className="w-36" data-testid="holiday-weekday-select">
              <SelectValue>
                {(v) => WEEKDAYS.find((w) => w.v === (v as string))?.l ?? "Sunday"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WEEKDAYS.map((w) => (
                <SelectItem key={w.v} value={w.v}>{w.l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          disabled={!monthKey || fillWeekly.isPending}
          data-testid="holiday-fill-weekly"
          className="bg-sky-600 hover:bg-sky-500"
          onClick={() => fillWeekly.mutate()}
        >
          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
          {fillWeekly.isPending ? "Applying…" : "Auto-fill this month"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!monthKey || clearMonth.isPending}
          data-testid="holiday-clear-month"
          className="text-rose-300 hover:bg-rose-500/10"
          onClick={() => clearMonth.mutate()}
        >
          Clear month
        </Button>
      </div>

      {/* ADD FESTIVAL HOLIDAY */}
      <form
        className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-800 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="hol-date">Festival / holiday date</Label>
          <Input
            id="hol-date"
            type="date"
            required
            className="w-44"
            data-testid="holiday-date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hol-name">Name</Label>
          <Input
            id="hol-name"
            required
            placeholder="Ganesh Chaturthi"
            className="w-52"
            data-testid="holiday-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Type</Label>
          <Select value={code} onValueChange={setCode}>
            <SelectTrigger className="w-36" data-testid="holiday-code-select">
              <SelectValue>{(v) => ((v as string) === "NC" ? "No Class" : "Holiday")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="H">Holiday</SelectItem>
              <SelectItem value="NC">No Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={add.isPending}
          data-testid="holiday-add-button"
          className="bg-sky-600 hover:bg-sky-500"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
        </Button>
      </form>

      {/* LIST */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
        {(holidays.data ?? []).map((h) => (
          <span
            key={h.id}
            data-testid={`holiday-chip-${h.date}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-[#0D1527] px-3 py-1.5 text-xs text-slate-200"
          >
            <span className="font-mono text-[10px] text-sky-400">{h.date.slice(8)}</span>
            {h.name}
            <span className="rounded bg-slate-700 px-1.5 text-[9px] font-bold text-slate-200">
              {h.code}
            </span>
            <button
              type="button"
              data-testid={`holiday-remove-${h.date}`}
              onClick={() => remove.mutate(h.id)}
              className="text-slate-500 transition-colors hover:text-rose-300"
              aria-label={`Remove ${h.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
        {holidays.data && holidays.data.length === 0 && (
          <p className="text-xs text-slate-500" data-testid="holiday-empty-state">
            No holidays set for this month yet.
          </p>
        )}
      </div>
    </Card>
  );
}

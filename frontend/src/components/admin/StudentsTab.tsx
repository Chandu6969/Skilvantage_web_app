import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { BRANCH_OPTIONS, PAYMENT_AMOUNTS, YEAR_OPTIONS } from "@/lib/types";
import type { Student, StudentCreate } from "@/lib/types";

const EMPTY: StudentCreate = {
  full_name: "",
  phone: "",
  email: "",
  year: YEAR_OPTIONS[3],
  branch: BRANCH_OPTIONS[1],
  monthly_amount: PAYMENT_AMOUNTS[0],
  total_fee: null,
  active: true,
  notes: "",
};

export default function StudentsTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StudentCreate>(EMPTY);

  const students = useQuery({
    queryKey: ["students", q],
    queryFn: () => apiGet<Student[]>(`/admin/students${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["students"] });
    void qc.invalidateQueries({ queryKey: ["attendance-day"] });
    void qc.invalidateQueries({ queryKey: ["attendance-summary"] });
    void qc.invalidateQueries({ queryKey: ["payments"] });
  };

  const create = useMutation({
    mutationFn: () => apiPost<Student>("/admin/students", form),
    onSuccess: () => {
      toast.success("Student added");
      setForm(EMPTY);
      setOpen(false);
      refresh();
    },
    onError: () => toast.error("Could not add the student"),
  });

  const importLeads = useMutation({
    mutationFn: () => apiPost<Student[]>("/admin/students/import-from-registrations"),
    onSuccess: (list) => {
      toast.success(
        list.length
          ? `${list.length} student(s) imported from registrations`
          : "No new registered leads to import",
      );
      refresh();
    },
    onError: () => toast.error("Import failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete<{ ok: boolean }>(`/admin/students/${id}`),
    onSuccess: () => {
      toast.success("Student removed");
      refresh();
    },
    onError: () => toast.error("Could not remove the student"),
  });

  const set = <K extends keyof StudentCreate>(k: K, v: StudentCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5" data-testid="students-tab">
      <Card className="border-slate-800 bg-[#111C35] p-5">
        <div className="flex flex-wrap items-end gap-3">
          <GraduationCap className="mb-2.5 h-4 w-4 text-sky-400" />
          <div className="grid gap-2">
            <Label htmlFor="stu-search">Search students</Label>
            <Input
              id="stu-search"
              className="w-64"
              placeholder="Name, phone or email"
              data-testid="students-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Badge variant="secondary" className="mb-2 bg-[#1E2E54] text-sky-300" data-testid="students-count">
            {students.data ? `${students.data.length} students` : "—"}
          </Badge>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={importLeads.isPending}
              data-testid="students-import-button"
              className="border-sky-500/40 text-sky-200 hover:bg-sky-500/10"
              onClick={() => importLeads.mutate()}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              {importLeads.isPending ? "Importing…" : "Import registered leads"}
            </Button>
            <Button
              size="sm"
              data-testid="students-add-button"
              className="bg-sky-600 hover:bg-sky-500"
              onClick={() => setOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Student
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-slate-800 bg-[#111C35] p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm" data-testid="students-table">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                {["#", "Student", "Year", "Branch", "Phone", "Monthly", "Total Fee", ""].map((h) => (
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
              {(students.data ?? []).map((s, i) => (
                <tr
                  key={s.id}
                  data-testid={`student-row-${s.id}`}
                  className="border-b border-slate-800/60"
                >
                  <td className="py-2.5 pr-3 font-mono text-xs text-slate-500">{i + 1}</td>
                  <td className="py-2.5 pr-3 text-slate-100">{s.full_name}</td>
                  <td className="py-2.5 pr-3 text-slate-400">{s.year || "—"}</td>
                  <td className="py-2.5 pr-3 text-slate-400">{s.branch || "—"}</td>
                  <td className="py-2.5 pr-3 text-slate-400">{s.phone || "—"}</td>
                  <td className="py-2.5 pr-3 text-slate-400">
                    {s.monthly_amount != null ? `₹${s.monthly_amount}` : "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-400">
                    {s.total_fee != null ? `₹${s.total_fee}` : "—"}
                  </td>
                  <td className="py-2.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      data-testid={`student-delete-${s.id}`}
                      className="text-rose-300 hover:bg-rose-500/10"
                      onClick={() => remove.mutate(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {students.data && students.data.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500" data-testid="students-empty-state">
            No students yet. Add one or import your registered leads.
          </p>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="student-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">Add student</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="stu-name">Full name</Label>
              <Input
                id="stu-name"
                required
                data-testid="student-name-input"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stu-phone">Phone</Label>
              <Input
                id="stu-phone"
                data-testid="student-phone-input"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stu-email">Email</Label>
              <Input
                id="stu-email"
                type="email"
                data-testid="student-email-input"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Year</Label>
              <Select value={form.year ?? ""} onValueChange={(v: string) => set("year", v)}>
                <SelectTrigger data-testid="student-year-select">
                  <SelectValue>{(v) => (v as string) || "Select"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Branch</Label>
              <Select value={form.branch ?? ""} onValueChange={(v: string) => set("branch", v)}>
                <SelectTrigger data-testid="student-branch-select">
                  <SelectValue>{(v) => (v as string) || "Select"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BRANCH_OPTIONS.map((br) => (
                    <SelectItem key={br} value={br}>{br}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stu-monthly">Monthly amount (₹)</Label>
              <Input
                id="stu-monthly"
                type="number"
                min={0}
                data-testid="student-monthly-input"
                value={form.monthly_amount ?? ""}
                onChange={(e) => set("monthly_amount", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stu-total">Total course fee (₹, optional)</Label>
              <Input
                id="stu-total"
                type="number"
                min={0}
                data-testid="student-total-fee-input"
                value={form.total_fee ?? ""}
                onChange={(e) =>
                  set("total_fee", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
            <Button
              type="submit"
              disabled={create.isPending}
              data-testid="student-create-submit"
              className="bg-sky-600 hover:bg-sky-500 sm:col-span-2"
            >
              {create.isPending ? "Adding…" : "Add student"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

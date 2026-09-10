import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Briefcase, Check, GraduationCap, Upload } from "lucide-react";
import { toast } from "sonner";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiPost } from "@/lib/api";
import { PROGRAMS, PROGRAM_LABEL, programBySlug } from "@/lib/programs";
import type { LearnerType, RegistrationCreate, RegistrationResult, UploadResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEARNING_MODES = ["Online", "Offline", "Hybrid"];
const SOURCES = ["Instagram", "LinkedIn", "YouTube", "Google Search", "Friend / Referral", "College", "Other"];
const LOOKING_FOR = ["Internship", "Job", "Both"];

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-sky-400">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        data-testid={`register-${id}-input`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Picker({
  label,
  testid,
  value,
  options,
  onChange,
}: {
  label: string;
  testid: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-testid={testid}>
          <SelectValue>{(v) => (v as string) || "Select"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="col-span-full mt-2 border-b border-slate-800 pb-2 font-mono text-xs uppercase tracking-widest text-sky-400">
      {children}
    </h3>
  );
}

export default function Register() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const preselect = params.get("program");
  const preselected = !!(preselect && programBySlug(preselect));

  // Always start on the learner-type radio step; a preselected program only skips step 1.
  const [step, setStep] = useState(0);
  const [learnerType, setLearnerType] = useState<LearnerType>("student");
  const [program, setProgram] = useState(preselected ? (preselect as string) : PROGRAMS[0].slug);
  const [form, setForm] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [resume, setResume] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const g = (k: string) => form[k] ?? "";

  const mutation = useMutation({
    mutationFn: (payload: RegistrationCreate) =>
      apiPost<RegistrationResult>("/registrations", payload),
    onSuccess: (res) => {
      navigate(
        `/registration-success?id=${res.registration_id}&program=${res.program}&type=${res.learner_type}&name=${encodeURIComponent(res.full_name)}`,
      );
    },
    onError: (err) => {
      const detail =
        err instanceof ApiError && err.body && typeof err.body === "object"
          ? String((err.body as { detail?: unknown }).detail ?? "")
          : "";
      toast.error(detail || "Registration failed. Please check your details and try again.");
    },
  });

  async function uploadResume(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads/resume", { method: "POST", body });
      if (!res.ok) throw new Error("upload failed");
      setResume((await res.json()) as UploadResult);
      toast.success("Resume uploaded");
    } catch {
      toast.error("Resume upload failed. Use a PDF, DOC or DOCX under 5 MB.");
    } finally {
      setUploading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      toast.error("Please accept the privacy consent to continue.");
      return;
    }
    const payload: RegistrationCreate = {
      learner_type: learnerType,
      program,
      full_name: g("full_name"),
      email: g("email"),
      phone: g("phone"),
      consent,
      resume_file_id: resume?.file_id ?? null,
      resume_filename: resume?.filename ?? null,
      ...Object.fromEntries(
        Object.entries(form).filter(([k]) => !["full_name", "email", "phone"].includes(k)),
      ),
    };
    mutation.mutate(payload);
  }

  const steps = ["Learner Type", "Program", "Your Details"];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Registration</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
            data-testid="register-heading"
          >
            Start Your Career Journey
          </h1>
          <div className="mt-8 flex flex-wrap gap-3" data-testid="register-stepper">
            {steps.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors duration-200",
                  i === step
                    ? "border-sky-400 bg-sky-500/15 text-sky-200"
                    : i < step
                      ? "border-emerald-500/40 text-emerald-300"
                      : "border-slate-700 text-slate-400",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono">{i + 1}</span>}
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {step === 0 && (
            <div data-testid="register-step-learner-type">
              <h2 className="font-heading text-xl font-bold text-slate-100 sm:text-2xl">
                Select Your Learner Type
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Choose one — the registration form is tailored to your answer.
              </p>

              <RadioGroup
                value={learnerType}
                onValueChange={(v) => setLearnerType(v as LearnerType)}
                className="mt-8 grid gap-4 sm:grid-cols-2"
                data-testid="learner-type-radio-group"
              >
                {(
                  [
                    { v: "student", t: "Student / Fresher", i: GraduationCap, d: "College students, final-year students, graduates and career starters." },
                    { v: "professional", t: "Working Professional", i: Briefcase, d: "IT and non-IT professionals growing or changing their career track." },
                  ] as const
                ).map((o) => (
                  <label
                    key={o.v}
                    htmlFor={`learner-type-${o.v}`}
                    data-testid={`learner-type-${o.v}`}
                    className={cn(
                      "cursor-pointer rounded-xl border p-6 transition-all duration-300 hover:border-sky-400/60 hover:shadow-[0_0_25px_rgba(56,189,248,0.18)]",
                      learnerType === o.v
                        ? "border-sky-500/60 bg-[#111C35]"
                        : "border-slate-800 bg-[#0D1527]",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <RadioGroupItem
                        id={`learner-type-${o.v}`}
                        value={o.v}
                        data-testid={`learner-type-radio-${o.v}`}
                        className="mt-1"
                      />
                      <div>
                        <o.i className="h-6 w-6 text-sky-400" />
                        <p className="mt-3 font-heading text-lg font-semibold text-slate-100">
                          {o.t}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{o.d}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              <Button
                size="lg"
                data-testid="learner-type-continue"
                className="mt-8 w-full bg-sky-600 hover:bg-sky-500 active:scale-[0.98] sm:w-auto"
                onClick={() => setStep(preselected ? 2 : 1)}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div data-testid="register-step-program">
              <h2 className="font-heading text-xl font-bold text-slate-100 sm:text-2xl">
                Select Your Program
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PROGRAMS.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    data-testid={`register-program-${p.slug}`}
                    onClick={() => {
                      setProgram(p.slug);
                      setStep(2);
                    }}
                    className={cn(
                      "rounded-xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/60",
                      program === p.slug ? "border-sky-500/60 bg-[#111C35]" : "border-slate-800 bg-[#0D1527]",
                    )}
                  >
                    <p className="font-heading text-base font-semibold text-slate-100">{p.name}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.description}</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-sky-400">
                      {p.duration}
                    </p>
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="mt-8 text-slate-300"
                onClick={() => setStep(0)}
                data-testid="register-back-to-type"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          )}

          {step === 2 && (
            <Card className="border-slate-800 bg-[#111C35] p-6 lg:p-8" data-testid="register-step-form">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-100">
                    {learnerType === "student" ? "Student Registration" : "Professional Registration"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400" data-testid="register-selected-program">
                    Program: <span className="text-sky-300">{PROGRAM_LABEL[program]}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300"
                  onClick={() => setStep(0)}
                  data-testid="register-change-program"
                >
                  Change
                </Button>
              </div>

              <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit} data-testid="registration-form">
                <Legend>Personal Information</Legend>
                <Field label="Full Name" id="full_name" required value={g("full_name")} onChange={(v) => set("full_name", v)} />
                {learnerType === "student" && (
                  <Picker label="Gender" testid="register-gender-select" value={g("gender")} options={["Male", "Female", "Other", "Prefer not to say"]} onChange={(v) => set("gender", v)} />
                )}
                <Field label="Phone Number" id="phone" required value={g("phone")} onChange={(v) => set("phone", v)} placeholder="9876543210" />
                <Field label="Email Address" id="email" type="email" required value={g("email")} onChange={(v) => set("email", v)} />
                <Field label="City" id="city" value={g("city")} onChange={(v) => set("city", v)} />
                <Field label="State" id="state" value={g("state")} onChange={(v) => set("state", v)} />

                {learnerType === "student" ? (
                  <>
                    <Legend>Academic Information</Legend>
                    <Field label="College / University Name" id="college" value={g("college")} onChange={(v) => set("college", v)} />
                    <Field label="Degree" id="degree" value={g("degree")} onChange={(v) => set("degree", v)} />
                    <Field label="Branch / Specialization" id="branch" value={g("branch")} onChange={(v) => set("branch", v)} />
                    <Field label="Passed Out Year" id="passed_out_year" value={g("passed_out_year")} onChange={(v) => set("passed_out_year", v)} />
                    <Field label="Current Year of Study (if applicable)" id="current_year_of_study" value={g("current_year_of_study")} onChange={(v) => set("current_year_of_study", v)} />

                    <Legend>Technical Information</Legend>
                    <Field label="Current Skill Set" id="skills" value={g("skills")} onChange={(v) => set("skills", v)} />
                    <Field label="Programming Languages Known" id="programming_languages" value={g("programming_languages")} onChange={(v) => set("programming_languages", v)} />
                    <Field label="Tools / Technologies Known" id="tools_known" value={g("tools_known")} onChange={(v) => set("tools_known", v)} />
                    <Field label="Certifications" id="certifications" value={g("certifications")} onChange={(v) => set("certifications", v)} />
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="projects">Previous Projects</Label>
                      <Textarea id="projects" rows={3} data-testid="register-projects-input" value={g("projects")} onChange={(e) => set("projects", e.target.value)} />
                    </div>

                    <Legend>Career Information</Legend>
                    <Picker label="Preferred Career Track" testid="register-preferred-track-select" value={g("preferred_track")} options={PROGRAMS.map((p) => p.name)} onChange={(v) => set("preferred_track", v)} />
                    <Field label="Expected Salary / Package" id="expected_package" value={g("expected_package")} onChange={(v) => set("expected_package", v)} />
                    <Field label="Preferred Job Role" id="preferred_role" value={g("preferred_role")} onChange={(v) => set("preferred_role", v)} />
                    <Picker label="Looking for" testid="register-looking-for-select" value={g("looking_for")} options={LOOKING_FOR} onChange={(v) => set("looking_for", v)} />
                    <Picker label="Preferred Learning Mode" testid="register-learning-mode-select" value={g("learning_mode")} options={LEARNING_MODES} onChange={(v) => set("learning_mode", v)} />
                    <Field label="Availability" id="availability" value={g("availability")} onChange={(v) => set("availability", v)} placeholder="Weekends / Evenings" />
                    <Picker label="How did you hear about SkilVantage?" testid="register-source-select" value={g("source")} options={SOURCES} onChange={(v) => set("source", v)} />
                  </>
                ) : (
                  <>
                    <Legend>Professional Information</Legend>
                    <Field label="Current Company" id="current_company" value={g("current_company")} onChange={(v) => set("current_company", v)} />
                    <Field label="Current Job Role" id="current_role" value={g("current_role")} onChange={(v) => set("current_role", v)} />
                    <Field label="Total Years of Experience" id="experience_years" value={g("experience_years")} onChange={(v) => set("experience_years", v)} />
                    <Field label="Current Industry" id="industry" value={g("industry")} onChange={(v) => set("industry", v)} />
                    <Field label="Current Technology / Skill Set" id="skills" value={g("skills")} onChange={(v) => set("skills", v)} />
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="previous_experience">Previous Experience</Label>
                      <Textarea id="previous_experience" rows={3} data-testid="register-previous-experience-input" value={g("previous_experience")} onChange={(e) => set("previous_experience", e.target.value)} />
                    </div>

                    <Legend>Career Transition</Legend>
                    <Picker label="Target Career Track" testid="register-target-track-select" value={g("preferred_track")} options={[...PROGRAMS.map((p) => p.name), "Other"]} onChange={(v) => set("preferred_track", v)} />
                    <Field label="Target Job Role" id="target_role" value={g("target_role")} onChange={(v) => set("target_role", v)} />
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor="career_change_reason">Reason for Career Change</Label>
                      <Textarea id="career_change_reason" rows={3} data-testid="register-career-change-reason-input" value={g("career_change_reason")} onChange={(e) => set("career_change_reason", e.target.value)} />
                    </div>
                    <Field label="Current Salary / Package" id="current_package" value={g("current_package")} onChange={(v) => set("current_package", v)} />
                    <Field label="Expected Salary / Package" id="expected_package" value={g("expected_package")} onChange={(v) => set("expected_package", v)} />
                    <Field label="Notice Period" id="notice_period" value={g("notice_period")} onChange={(v) => set("notice_period", v)} />
                    <Picker label="Preferred Learning Mode" testid="register-learning-mode-select" value={g("learning_mode")} options={LEARNING_MODES} onChange={(v) => set("learning_mode", v)} />
                    <Field label="Preferred Batch Timing" id="batch_timing" value={g("batch_timing")} onChange={(v) => set("batch_timing", v)} placeholder="Weekend morning" />
                  </>
                )}

                <Legend>Optional</Legend>
                <Field label="LinkedIn Profile" id="linkedin" value={g("linkedin")} onChange={(v) => set("linkedin", v)} />
                <Field label="GitHub Profile" id="github" value={g("github")} onChange={(v) => set("github", v)} />
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="resume">Resume Upload (PDF / DOC / DOCX, max 5 MB)</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      data-testid="register-resume-input"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadResume(f);
                      }}
                      className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-[#1E2E54] file:px-4 file:py-2 file:text-sm file:text-sky-300 sm:w-auto"
                    />
                    {uploading && <span className="text-xs text-slate-400">Uploading…</span>}
                    {resume && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300" data-testid="register-resume-uploaded">
                        <Upload className="h-3.5 w-3.5" /> {resume.filename}
                      </span>
                    )}
                  </div>
                </div>

                <label className="col-span-full mt-4 flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0D1527] p-4 text-sm text-slate-300">
                  <Checkbox
                    checked={consent}
                    onCheckedChange={(c) => setConsent(c === true)}
                    data-testid="register-consent-checkbox"
                    className="mt-0.5"
                  />
                  <span>
                    I agree to the SkilVantage privacy policy and allow SkilVantage to contact me
                    regarding training programs and career opportunities.
                  </span>
                </label>

                <Button
                  type="submit"
                  size="lg"
                  disabled={mutation.isPending}
                  data-testid="register-submit-button"
                  className="col-span-full mt-2 w-full bg-sky-600 hover:bg-sky-500 active:scale-[0.98] sm:w-auto sm:justify-self-start"
                >
                  {mutation.isPending
                    ? "Submitting…"
                    : learnerType === "student"
                      ? "Start My Career Journey"
                      : "Plan My Career Transition"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Card>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

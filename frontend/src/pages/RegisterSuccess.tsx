import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, PartyPopper } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PROGRAM_LABEL } from "@/lib/programs";
import { cn } from "@/lib/utils";

const NEXT_STEPS = [
  "Our career team reviews your details.",
  "A career advisor calls or emails you, usually within two working days.",
  "We map your background to the right track and batch.",
  "You get your learning plan and start building.",
];

export default function RegisterSuccess() {
  const [params] = useSearchParams();
  const id = params.get("id") ?? "—";
  const program = params.get("program") ?? "";
  const type = params.get("type") ?? "student";
  const name = params.get("name") ?? "";

  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-600/20 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Card className="border-sky-500/25 bg-[#111C35] p-8 text-center lg:p-12" data-testid="registration-success-card">
            <span className="mx-auto grid h-14 w-14 animate-pulse-ring place-items-center rounded-full bg-sky-500/15">
              <PartyPopper className="h-7 w-7 text-sky-400" />
            </span>
            <h1
              className="mt-6 font-heading text-2xl font-bold text-white sm:text-3xl"
              data-testid="registration-success-heading"
            >
              Welcome to SkilVantage!
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-300">
              {name ? `${name}, thank you` : "Thank you"} for taking the first step toward becoming
              job ready. Our career team will review your details and contact you shortly.
            </p>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Registration ID</p>
                <p className="mt-1.5 font-mono text-sm font-semibold text-slate-100" data-testid="success-registration-id">
                  {id}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Program</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-100" data-testid="success-program">
                  {PROGRAM_LABEL[program] ?? program}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#0D1527] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Learner Type</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-100" data-testid="success-learner-type">
                  {type === "professional" ? "Working Professional" : "Student / Fresher"}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-slate-800 bg-[#0D1527] p-5 text-left">
              <p className="font-heading text-sm font-semibold text-slate-100">Next steps</p>
              <ul className="mt-3 space-y-2.5">
                {NEXT_STEPS.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/" data-testid="success-home-cta" className={cn(buttonVariants(), "bg-sky-600 hover:bg-sky-500")}>
                Back to Home
              </Link>
              <Link
                to={`/roadmaps${program ? `?program=${program}` : ""}`}
                data-testid="success-roadmap-cta"
                className={cn(buttonVariants({ variant: "outline" }), "border-sky-500/40 text-sky-200 hover:bg-sky-500/10")}
              >
                Explore Career Roadmap
              </Link>
              <Link
                to="/contact"
                data-testid="success-contact-cta"
                className={cn(buttonVariants({ variant: "ghost" }), "text-slate-300")}
              >
                Contact SkilVantage
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

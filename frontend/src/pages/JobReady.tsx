import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  FolderGit2,
  GraduationCap,
  Layers,
  Linkedin,
  MessagesSquare,
  Mic,
  Target,
  Users,
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", t: "Learn", d: "Structured modules with live guidance and revision checkpoints.", i: GraduationCap },
  { n: "02", t: "Practice", d: "Daily practice sets and mentor-reviewed assignments.", i: Target },
  { n: "03", t: "Build Projects", d: "Real datasets, real problems, end-to-end delivery.", i: FolderGit2 },
  { n: "04", t: "Build Portfolio", d: "GitHub, dashboards and documented case studies.", i: Layers },
  { n: "05", t: "Prepare Resume", d: "A resume written around outcomes, reviewed line by line.", i: FileText },
  { n: "06", t: "Practice Interviews", d: "Technical and HR mocks with structured feedback.", i: Users },
];

const SUPPORT = [
  { t: "Resume Building", i: FileText },
  { t: "LinkedIn Optimization", i: Linkedin },
  { t: "GitHub Portfolio", i: FolderGit2 },
  { t: "Mock Interviews", i: Mic },
  { t: "Technical Interviews", i: Target },
  { t: "HR Interviews", i: Users },
  { t: "Communication Training", i: MessagesSquare },
  { t: "Career Guidance", i: GraduationCap },
];

export default function JobReady() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-sky-600/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Job readiness</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="job-ready-heading"
          >
            Become Job Ready
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Technical skills get you started. Communication skills help you succeed. Our six-step
            process turns learning into hire-ready capability.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20" data-testid="job-ready-steps">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <Card
                key={s.n}
                data-testid={`job-ready-detail-step-${s.n}`}
                className="border-slate-800 bg-[#111C35] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <s.i className="h-6 w-6 text-sky-400" />
                  <span className="font-mono text-xs text-sky-500">{s.n}</span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-slate-100">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800/70 py-14 lg:py-20" data-testid="job-ready-support">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            What is included
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SUPPORT.map((s) => (
              <div
                key={s.t}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-4 text-sm text-slate-200 transition-colors duration-200 hover:border-sky-400/50"
              >
                <s.i className="h-4 w-4 shrink-0 text-sky-400" /> {s.t}
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-lg border border-slate-800 bg-[#0D1527] px-5 py-4 text-sm text-slate-400">
            SkilVantage provides job-readiness focused training. We do not make placement
            guarantees — we prepare you to earn the role.
          </p>
          <Link
            to="/register"
            data-testid="job-ready-register-cta"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
          >
            Plan My Career <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

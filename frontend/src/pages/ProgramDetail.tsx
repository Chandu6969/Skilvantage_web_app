import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Signal, Wrench } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FAQS, ROADMAP_STAGES, programBySlug } from "@/lib/programs";
import { cn } from "@/lib/utils";

function Section({
  title,
  caption,
  children,
  testid,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
  testid: string;
}) {
  return (
    <section className="border-t border-slate-800/70 py-12" data-testid={testid}>
      {caption && <p className="font-mono text-xs uppercase tracking-widest text-sky-400">{caption}</p>}
      <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ProgramDetail() {
  const { slug = "" } = useParams();
  const program = programBySlug(slug);

  if (!program) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center" data-testid="program-not-found">
          <h1 className="font-heading text-2xl font-bold text-slate-100">Program not found</h1>
          <Link to="/programs" className={cn(buttonVariants(), "mt-6 bg-sky-600 hover:bg-sky-500")}>
            Back to Programs
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-sky-600/15 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link to="/programs" className="font-mono text-xs uppercase tracking-widest text-sky-400 hover:text-sky-300">
            ← All programs
          </Link>
          <h1
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="program-detail-title"
          >
            {program.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">{program.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
              <Clock className="mr-1.5 h-3 w-3" /> {program.duration}
            </Badge>
            <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
              <Signal className="mr-1.5 h-3 w-3" /> {program.level}
            </Badge>
            <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
              Real-time projects
            </Badge>
            <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">
              Job-readiness focused training
            </Badge>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/register?program=${program.slug}`}
              data-testid="program-detail-register-cta"
              className={cn(buttonVariants({ size: "lg" }), "w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
            >
              Register for {program.short} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to={`/roadmaps?program=${program.slug}`}
              data-testid="program-detail-roadmap-cta"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full border-sky-500/40 text-sky-200 hover:bg-sky-500/10 sm:w-auto")}
            >
              View {program.short} Roadmap
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Section testid="program-overview" caption="Course overview" title="What this program prepares you for">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-800 bg-[#111C35] p-6">
              <h3 className="font-heading text-base font-semibold text-slate-100">Who should join</h3>
              <ul className="mt-4 space-y-2.5">
                {program.whoShouldJoin.map((w) => (
                  <li key={w} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" /> {w}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="border-slate-800 bg-[#111C35] p-6">
              <h3 className="font-heading text-base font-semibold text-slate-100">Prerequisites</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{program.prerequisites}</p>
              <h3 className="mt-6 font-heading text-base font-semibold text-slate-100">Learning methodology</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Live sessions, guided practice, reviewed assignments, mentor feedback and project
                checkpoints — with communication training woven through every module.
              </p>
            </Card>
          </div>
        </Section>

        <Section testid="program-roadmap" caption="Complete roadmap" title={`${program.name} module path`}>
          <ol className="relative space-y-3 border-l border-sky-500/25 pl-6">
            {program.roadmap.map((step, i) => (
              <li key={step} className="relative" data-testid={`roadmap-module-${i}`}>
                <span className="absolute -left-[31px] mt-2 grid h-4 w-4 place-items-center rounded-full border border-sky-500/50 bg-[#070B14]">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                </span>
                <div className="rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-3 transition-colors duration-200 hover:border-sky-400/50">
                  <span className="font-mono text-[10px] text-sky-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ml-3 text-sm text-slate-200">{step}</span>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section testid="program-skills" caption="Skills covered" title="What you will be able to do">
          <div className="flex flex-wrap gap-2">
            {program.skills.map((s) => (
              <span key={s} className="rounded-md bg-[#1E2E54] px-3 py-1.5 font-mono text-xs text-sky-300">
                {s}
              </span>
            ))}
          </div>
          <h3 className="mt-8 flex items-center gap-2 font-heading text-base font-semibold text-slate-100">
            <Wrench className="h-4 w-4 text-sky-400" /> Tools & technologies
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {program.tools.map((t) => (
              <span key={t} className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </Section>

        <Section
          testid="program-projects"
          caption="Projects"
          title="Real-time industry projects"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {program.projects.map((p) => (
              <Card key={p} className="border-slate-800 bg-[#111C35] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50">
                <p className="text-sm font-semibold text-slate-100">{p}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Live datasets, mentor-reviewed, built the way it is done on the job.
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section testid="program-tracks" caption="Tracks" title="Student track & Professional track">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-800 bg-[#111C35] p-6">
              <h3 className="font-heading text-base font-semibold text-slate-100">Student / Fresher track</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Weekend and evening batches paced around college. Focus on fundamentals, first
                projects, resume building and campus/off-campus interview practice.
              </p>
            </Card>
            <Card className="border-slate-800 bg-[#111C35] p-6">
              <h3 className="font-heading text-base font-semibold text-slate-100">Working Professional track</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Transition-focused: maps your existing experience to the target role, with flexible
                batch timings, deeper projects and switch-oriented interview preparation.
              </p>
            </Card>
          </div>
        </Section>

        <Section testid="program-career-support" caption="Career support" title="From learning to job ready">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Interview preparation",
              "Communication training",
              "Resume support",
              "LinkedIn optimization",
              "GitHub portfolio review",
              "Career guidance",
            ].map((c) => (
              <div key={c} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-3.5 text-sm text-slate-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> {c}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {ROADMAP_STAGES.map((s) => (
              <span key={s.title} className="rounded-full border border-sky-500/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-sky-300">
                {s.title}
              </span>
            ))}
          </div>
        </Section>

        <Section testid="program-faq" caption="FAQ" title="Common questions">
          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0D1527]">
            {FAQS.slice(0, 8).map((f, i) => (
              <details key={f.q} className="px-5 py-4" data-testid={`program-faq-${i}`}>
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-100 hover:text-sky-300">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section className="border-t border-slate-800/70 py-14">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Ready to start {program.name}?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">
              Job-readiness focused training with projects, communication coaching and interview
              practice built in.
            </p>
            <Link
              to={`/register?program=${program.slug}`}
              data-testid="program-detail-bottom-register-cta"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
            >
              Register for {program.short}
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

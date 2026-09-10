import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, GraduationCap, Layers } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PROGRAMS } from "@/lib/programs";
import { cn } from "@/lib/utils";

export default function Programs() {
  const [params] = useSearchParams();
  const track = params.get("track");

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Career programs</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="programs-heading"
          >
            Choose Your Career Path
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            {track === "professional"
              ? "Transition-focused tracks for working professionals — flexible batches, role mapping and portfolio work you can show at interviews."
              : track === "student"
                ? "Student and fresher tracks built around college schedules, with project work that turns into a portfolio."
                : "Five industry-shaped programs. Every one ends the same way: projects, portfolio, resume, interview practice and job readiness."}
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          {PROGRAMS.map((p) => (
            <Card
              key={p.slug}
              data-testid={`programs-page-card-${p.slug}`}
              className="flex flex-col border-slate-800 bg-[#111C35] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.18)]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-xl font-semibold text-slate-100">{p.name}</h2>
                <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">{p.level}</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.description}</p>

              <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-500" /> {p.duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-sky-500" /> {p.roadmap.length} modules
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-sky-500" /> {p.roles.length} target roles
                </span>
              </div>

              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Key skills</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 8).map((s) => (
                    <span key={s} className="rounded bg-[#1E2E54] px-2 py-1 font-mono text-[10px] text-sky-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-7 sm:flex-row">
                <Link
                  to={`/programs/${p.slug}`}
                  data-testid={`programs-page-${p.slug}-detail-cta`}
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1 border-sky-500/40 text-sky-200 hover:bg-sky-500/10")}
                >
                  View {p.short} Roadmap
                </Link>
                <Link
                  to={`/register?program=${p.slug}`}
                  data-testid={`programs-page-${p.slug}-register-cta`}
                  className={cn(buttonVariants(), "flex-1 bg-sky-600 hover:bg-sky-500")}
                >
                  Register <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

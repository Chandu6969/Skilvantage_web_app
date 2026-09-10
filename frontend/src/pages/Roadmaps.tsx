import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PROGRAMS, ROADMAP_STAGES, programBySlug } from "@/lib/programs";
import { cn } from "@/lib/utils";

function stageModules(roadmap: string[], index: number, total: number): string[] {
  // Spread the first five stages across the module list; the last three are career stages.
  if (index >= 3) return [];
  const learningStages = 3;
  const size = Math.ceil(roadmap.length / learningStages);
  return roadmap.slice(index * size, Math.min((index + 1) * size, total));
}

export default function Roadmaps() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("program") ?? PROGRAMS[0].slug;
  const [active, setActive] = useState(programBySlug(initial) ? initial : PROGRAMS[0].slug);
  const program = programBySlug(active) ?? PROGRAMS[0];

  const select = (slug: string) => {
    setActive(slug);
    setParams({ program: slug });
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Career roadmaps</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="roadmaps-heading"
          >
            From Foundation to Job Ready
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Pick a career track and see the exact progression — what you learn, what you build, and
            how you prepare for interviews.
          </p>

          <div className="mt-8 flex flex-wrap gap-2" data-testid="roadmap-program-selector">
            {PROGRAMS.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => select(p.slug)}
                data-testid={`roadmap-select-${p.slug}`}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                  active === p.slug
                    ? "border-sky-400 bg-sky-500/15 text-sky-200"
                    : "border-slate-700 text-slate-300 hover:border-sky-500/50 hover:text-sky-300",
                )}
              >
                {p.short}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-slate-100 sm:text-2xl" data-testid="roadmap-active-title">
            {program.name} Roadmap
          </h2>
          <p className="mt-2 text-sm text-slate-400">{program.description}</p>

          <div className="mt-10 space-y-1" data-testid="roadmap-timeline">
            {ROADMAP_STAGES.map((stage, i) => {
              const modules = stageModules(program.roadmap, i, program.roadmap.length);
              return (
                <div key={stage.title}>
                  <Card
                    data-testid={`roadmap-stage-${i}`}
                    className="border-slate-800 bg-[#111C35] p-6 transition-all duration-300 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500/15 font-mono text-xs font-bold text-sky-300">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-slate-100 sm:text-lg">
                        {stage.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{stage.detail}</p>
                    {modules.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {modules.map((m) => (
                          <span key={m} className="rounded bg-[#1E2E54] px-2 py-1 font-mono text-[10px] text-sky-300">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                  {i < ROADMAP_STAGES.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ChevronDown className="h-5 w-5 text-sky-500/60" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/register?program=${program.slug}`}
              data-testid="roadmap-register-cta"
              className={cn(buttonVariants({ size: "lg" }), "w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
            >
              Register for {program.short} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to={`/programs/${program.slug}`}
              data-testid="roadmap-program-detail-cta"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full border-sky-500/40 text-sky-200 hover:bg-sky-500/10 sm:w-auto")}
            >
              Full program details
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

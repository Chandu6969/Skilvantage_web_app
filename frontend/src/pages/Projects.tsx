import { Link } from "react-router-dom";
import { ArrowRight, FolderGit2 } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PROGRAMS } from "@/lib/programs";
import { cn } from "@/lib/utils";

export default function Projects() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Projects</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="projects-heading"
          >
            Build Real-World Projects
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Every program ends with work you can show. Reviewed projects, real datasets, and a
            portfolio that answers the interviewer's first question: "What have you built?"
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          {PROGRAMS.map((p) => (
            <div key={p.slug} data-testid={`project-category-${p.slug}`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-heading text-xl font-bold text-slate-100 sm:text-2xl">
                  {p.name} Projects
                </h2>
                <Link
                  to={`/programs/${p.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-sky-400 transition-colors hover:text-sky-300"
                >
                  View program →
                </Link>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {p.projects.map((proj) => (
                  <Card
                    key={proj}
                    data-testid={`project-card-${proj.toLowerCase().replace(/\s+/g, "-")}`}
                    className="border-slate-800 bg-[#111C35] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)]"
                  >
                    <FolderGit2 className="h-5 w-5 text-sky-400" />
                    <p className="mt-3.5 text-sm font-semibold text-slate-100">{proj}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">
                      Built end-to-end, reviewed by a mentor, and documented for your portfolio.
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Don't just learn technology. Learn how to apply it.
            </h2>
            <Link
              to="/register"
              data-testid="projects-register-cta"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
            >
              Start Learning <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

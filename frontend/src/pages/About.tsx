import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOCUS = [
  { t: "Practical learning", d: "Concepts taught through work, not slides." },
  { t: "Industry skills", d: "Curriculum shaped by how teams actually deliver." },
  { t: "Career transformation", d: "Role mapping for both freshers and switchers." },
  { t: "Communication", d: "Explaining your work is treated as a core skill." },
  { t: "Projects", d: "Reviewed, portfolio-grade builds in every program." },
  { t: "Continuous learning", d: "Habits and resources that outlast the course." },
  { t: "Job readiness", d: "Resume, portfolio and interview practice built in." },
];

export default function About() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">About us</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="about-heading"
          >
            About SkilVantage
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            SkilVantage is a career-focused technology training consultancy designed to bridge the
            gap between academic learning and industry expectations.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-100 sm:text-3xl">
              Your Skills. Your Career. Your Advantage.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Most learners do not struggle because they lack intelligence. They struggle because
              their learning was never connected to the work an employer needs done. SkilVantage
              closes that gap: every program is built backwards from a real job role, then paced so
              a student, a fresher or a working professional can actually finish it.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              We teach Data Analytics, Data Science, AI/ML, Generative AI and Agentic AI — and
              alongside the technology, we train the communication that decides whether your skills
              are recognised.
            </p>
            <p className="mt-6 border-l-2 border-sky-500 pl-4 text-base italic text-slate-200">
              "Technical skills get you started. Communication skills help you succeed."
            </p>
            <Link
              to="/programs"
              data-testid="about-programs-cta"
              className={cn(buttonVariants(), "mt-8 w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
            >
              Explore Programs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {FOCUS.map((f) => (
              <Card
                key={f.t}
                data-testid={`about-focus-${f.t.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-start gap-3 border-slate-800 bg-[#111C35] p-5 transition-colors duration-200 hover:border-sky-400/50"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">{f.t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{f.d}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

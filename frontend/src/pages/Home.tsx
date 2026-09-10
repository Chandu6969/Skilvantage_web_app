import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  BrainCircuit,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderGit2,
  GraduationCap,
  Layers,
  MessagesSquare,
  Mic,
  Presentation,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PROGRAMS, MOTIVATIONAL_QUOTES, FAQS } from "@/lib/programs";
import { cn } from "@/lib/utils";

const WHY = [
  { icon: Layers, title: "Industry-Relevant Skills", body: "Curriculum shaped around the work real teams actually do." },
  { icon: FolderGit2, title: "Practical Projects", body: "Reviewed, portfolio-grade projects on real datasets." },
  { icon: Target, title: "Job-Ready Training", body: "Trained to perform on day one, not just to finish a course." },
  { icon: MessagesSquare, title: "Communication & Soft Skills", body: "Explain your work clearly — in reviews and interviews." },
  { icon: Mic, title: "Interview Preparation", body: "Technical mocks, HR rounds and structured feedback." },
  { icon: Award, title: "Career Guidance", body: "Role mapping, resume review and a plan you can follow." },
];

const TRUST = [
  "Structured Learning",
  "Practical Projects",
  "Industry-Relevant Curriculum",
  "Career Guidance",
  "Communication Training",
  "Interview Preparation",
  "Flexible Batches",
  "Student & Professional Programs",
];

const COMMUNICATION_AREAS = [
  "Spoken English",
  "Professional Communication",
  "Presentation Skills",
  "Interview Communication",
  "Group Discussion",
  "Email Writing",
  "Workplace Communication",
  "Confidence Building",
  "Technical Explanation Skills",
];

const PROGRAM_ICON: Record<string, typeof BarChart3> = {
  "data-analyst": BarChart3,
  "data-scientist": BrainCircuit,
  "ai-ml": Sparkles,
  "generative-ai": Bot,
  "agentic-ai": Layers,
};

function QuoteTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % MOTIVATIONAL_QUOTES.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2"
      data-testid="hero-quote-ticker"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-400" />
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-xs font-medium text-sky-200 sm:text-sm"
      >
        {MOTIVATIONAL_QUOTES[i]}
      </motion.span>
    </div>
  );
}

export default function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-600/20 blur-[120px]" />
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24 lg:px-8">
          <div className="animate-rise">
            <p className="font-mono text-xs uppercase tracking-widest text-sky-400">
              Learn Skills. Build Careers. Become Job Ready.
            </p>
            <h1
              className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
              data-testid="hero-headline"
            >
              Build Skills That{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Build Your Career.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Industry-focused training programs for students, freshers and working professionals in
              Data, AI, ML, Generative AI and Agentic AI.
            </p>
            <div className="mt-7">
              <QuoteTicker />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/programs"
                data-testid="hero-explore-courses-cta"
                className={cn(buttonVariants({ size: "lg" }), "w-full bg-sky-600 hover:bg-sky-500 active:scale-[0.98] sm:w-auto")}
              >
                Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/register"
                data-testid="hero-register-cta"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full border-sky-500/40 text-sky-200 hover:bg-sky-500/10 sm:w-auto")}
              >
                Register Now
              </Link>
              <Link
                to="/contact"
                data-testid="hero-advisor-cta"
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "w-full text-slate-300 hover:text-sky-300 sm:w-auto")}
              >
                Talk to a Career Advisor
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-slate-800 pt-6">
              {[
                { k: "5", v: "Career programs" },
                { k: "8", v: "Roadmap stages" },
                { k: "2", v: "Learner tracks" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-heading text-2xl font-bold text-sky-400">{s.k}</div>
                  <div className="text-xs text-slate-400">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-rise">
            <div className="glass rounded-2xl p-1.5 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200"
                alt="Analytics dashboards used in SkilVantage training projects"
                className="h-64 w-full rounded-xl object-cover sm:h-80 lg:h-[26rem]"
                loading="eager"
              />
            </div>
            <div className="glass absolute -bottom-6 -left-2 hidden rounded-xl px-4 py-3 sm:block lg:-left-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">Outcome</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">Job Ready, not certificate ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="why-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Why SkilVantage?</p>
          <h2 className="mt-3 max-w-2xl font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
            We focus on building professionals who can learn, apply, communicate and perform.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w, i) => (
              <Card
                key={w.title}
                data-testid={`why-card-${i}`}
                className="group border-slate-800 bg-[#111C35] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.18)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-sky-500/10 text-sky-400 transition-transform duration-200 group-hover:scale-110">
                  <w.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-slate-100">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{w.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHO CAN JOIN */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="who-can-join-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
            Who Can Join?
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {[
              {
                icon: GraduationCap,
                title: "Students & Freshers",
                items: ["College students", "Final-year students", "Recent graduates", "Freshers", "Career starters"],
                cta: "Explore Student Programs",
                to: "/programs?track=student",
                testid: "student-track-card",
              },
              {
                icon: Briefcase,
                title: "Working Professionals",
                items: [
                  "IT professionals",
                  "Non-IT professionals",
                  "Professionals seeking career growth",
                  "Professionals changing domains",
                  "Professionals moving into AI/Data roles",
                ],
                cta: "Explore Professional Programs",
                to: "/programs?track=professional",
                testid: "professional-track-card",
              },
            ].map((c) => (
              <Card
                key={c.title}
                data-testid={c.testid}
                className="relative overflow-hidden border-slate-800 bg-gradient-to-br from-[#111C35] to-[#0D1527] p-7 transition-all duration-300 hover:border-sky-400/50 lg:p-9"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/5 blur-2xl" />
                <c.icon className="h-8 w-8 text-sky-400" />
                <h3 className="mt-5 font-heading text-xl font-semibold text-slate-100 sm:text-2xl">{c.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {c.items.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                      {i}
                    </li>
                  ))}
                </ul>
                <Link
                  to={c.to}
                  data-testid={`${c.testid}-cta`}
                  className={cn(buttonVariants({ variant: "outline" }), "mt-7 w-full border-sky-500/40 text-sky-200 hover:bg-sky-500/10 sm:w-auto")}
                >
                  {c.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="programs-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Five core career programs</p>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
            Choose Your Career Path
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAMS.map((p) => {
              const Icon = PROGRAM_ICON[p.slug];
              return (
                <Card
                  key={p.slug}
                  data-testid={`program-card-${p.slug}`}
                  className="flex flex-col border-slate-800 bg-[#111C35] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.18)]"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-7 w-7 text-sky-400" />
                    <Badge variant="secondary" className="bg-[#1E2E54] text-sky-300">{p.duration}</Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-slate-100">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 5).map((s) => (
                      <span key={s} className="rounded bg-[#1E2E54] px-2 py-1 font-mono text-[10px] text-sky-300">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
                    <Link
                      to={`/programs/${p.slug}`}
                      data-testid={`program-card-${p.slug}-detail-cta`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }), "flex-1 border-sky-500/40 text-sky-200 hover:bg-sky-500/10")}
                    >
                      View Roadmap
                    </Link>
                    <Link
                      to={`/register?program=${p.slug}`}
                      data-testid={`program-card-${p.slug}-register-cta`}
                      className={cn(buttonVariants({ size: "sm" }), "flex-1 bg-sky-600 hover:bg-sky-500")}
                    >
                      Register
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMMUNICATION */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="communication-section">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Career multiplier</p>
            <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
              Technical Skills + Communication = Career Success
            </h2>
            <p className="mt-5 border-l-2 border-sky-500 pl-4 text-base italic leading-relaxed text-slate-300">
              "Knowing the answer is important. Communicating the answer is what makes you stand out."
            </p>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Technical skills get you started. Communication skills help you succeed.
            </p>
            <Link
              to="/contact"
              data-testid="communication-cta"
              className={cn(buttonVariants(), "mt-7 w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
            >
              <Presentation className="mr-2 h-4 w-4" /> Improve My Communication Skills
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMMUNICATION_AREAS.map((a) => (
              <div
                key={a}
                className="glass rounded-lg px-4 py-3 text-sm text-slate-200 transition-colors duration-200 hover:border-sky-400/50"
              >
                {a}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOB READY */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="job-ready-preview-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
            Become Job Ready
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {[
              { n: "01", t: "Learn", i: GraduationCap },
              { n: "02", t: "Practice", i: Target },
              { n: "03", t: "Build Projects", i: FolderGit2 },
              { n: "04", t: "Build Portfolio", i: Layers },
              { n: "05", t: "Prepare Resume", i: FileText },
              { n: "06", t: "Practice Interviews", i: Users },
            ].map((s) => (
              <div
                key={s.n}
                data-testid={`job-ready-step-${s.n}`}
                className="rounded-xl border border-slate-800 bg-[#0D1527] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50"
              >
                <span className="font-mono text-xs text-sky-500">{s.n}</span>
                <s.i className="mt-3 h-5 w-5 text-sky-400" />
                <p className="mt-3 text-sm font-semibold text-slate-100">{s.t}</p>
              </div>
            ))}
          </div>
          <Link
            to="/job-ready"
            data-testid="job-ready-section-cta"
            className={cn(buttonVariants({ variant: "outline" }), "mt-8 border-sky-500/40 text-sky-200 hover:bg-sky-500/10")}
          >
            Become Job Ready <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="trust-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
            Why Learners Choose SkilVantage
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0D1527] px-4 py-4 text-sm text-slate-200 transition-colors duration-200 hover:border-sky-400/50"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-800/70 py-16 lg:py-24" data-testid="faq-section">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0D1527]">
            {FAQS.map((f, i) => (
              <details key={f.q} className="group px-5 py-4" data-testid={`faq-item-${i}`}>
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-100 transition-colors hover:text-sky-300">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-slate-800/70 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="glass relative overflow-hidden rounded-2xl p-8 text-center lg:p-14">
            <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="relative">
              <CalendarClock className="mx-auto h-8 w-8 text-sky-400" />
              <h2 className="mt-5 font-heading text-2xl font-bold text-white sm:text-3xl">
                Your career advantage starts with the right skills.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300">
                Register in three minutes. Our career team reviews every application and gets in
                touch to plan your track.
              </p>
              <Link
                to="/register"
                data-testid="final-register-cta"
                className={cn(buttonVariants({ size: "lg" }), "mt-7 w-full bg-sky-600 hover:bg-sky-500 sm:w-auto")}
              >
                Register Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

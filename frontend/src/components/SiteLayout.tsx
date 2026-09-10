import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/programs", label: "Programs" },
  { to: "/roadmaps", label: "Roadmaps" },
  { to: "/projects", label: "Projects" },
  { to: "/job-ready", label: "Job Ready" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 glass border-b border-sky-500/15"
      data-testid="site-header"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-logo-link">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-slate-50">
            Skil<span className="text-sky-400">Vantage</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" data-testid="desktop-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-sky-300 bg-sky-500/10"
                    : "text-slate-300 hover:text-sky-300 hover:bg-white/5",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/register"
          data-testid="nav-register-cta"
          className={cn(
            buttonVariants({ size: "sm" }),
            "ml-auto hidden lg:ml-0 lg:inline-flex bg-sky-600 hover:bg-sky-500 active:scale-[0.98]",
          )}
        >
          Register Now
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setOpen((v) => !v)}
          data-testid="mobile-nav-toggle"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div
          className="border-t border-sky-500/15 bg-[#070B14]/98 px-4 pb-5 pt-2 lg:hidden"
          data-testid="mobile-nav-panel"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "block rounded-md px-3 py-3 text-base font-medium transition-colors",
                location.pathname === item.to
                  ? "text-sky-300 bg-sky-500/10"
                  : "text-slate-300 hover:bg-white/5",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            data-testid="mobile-nav-register-cta"
            className={cn(buttonVariants(), "mt-3 w-full bg-sky-600 hover:bg-sky-500")}
          >
            Register Now
          </Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#070B14]" data-testid="site-footer">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-700">
              <GraduationCap className="h-5 w-5 text-white" />
            </span>
            <span className="font-heading text-lg font-bold text-slate-50">
              Skil<span className="text-sky-400">Vantage</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Learn Skills. Build Careers. Become Job Ready. Career-focused training in Data
            Analytics, Data Science, AI/ML, Generative AI and Agentic AI for students, freshers and
            working professionals.
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-sky-400">
            Job-readiness focused training
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold text-slate-100">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {NAV.slice(1).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition-colors hover:text-sky-300">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold text-slate-100">Get in touch</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>+91 90000 12345</li>
            <li>hello@skilvantage.com</li>
            <li>Chennai, India</li>
            <li>
              <Link to="/admin" className="transition-colors hover:text-sky-300" data-testid="footer-admin-link">
                Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/80 px-4 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} SkilVantage. Job-readiness focused training — we do not make
        placement guarantees.
      </div>
    </footer>
  );
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#070B14]">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

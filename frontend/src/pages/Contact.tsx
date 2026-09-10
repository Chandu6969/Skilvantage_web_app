import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPost } from "@/lib/api";
import { PROGRAMS, PROGRAM_LABEL } from "@/lib/programs";
import type { Enquiry, EnquiryCreate } from "@/lib/types";

const EMPTY: EnquiryCreate = {
  name: "",
  email: "",
  phone: "",
  program: "data-analyst",
  learner_type: "student",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState<EnquiryCreate>(EMPTY);

  const mutation = useMutation({
    mutationFn: (payload: EnquiryCreate) => apiPost<Enquiry>("/enquiries", payload),
    onSuccess: () => {
      toast.success("Thanks! Our career team will contact you shortly.");
      setForm(EMPTY);
    },
    onError: () => toast.error("Could not send your enquiry. Please try again."),
  });

  const set = (k: keyof EnquiryCreate, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-slate-800/70">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-sky-400">Contact</p>
          <h1
            className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
            data-testid="contact-heading"
          >
            Talk to SkilVantage
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Course enquiry or career counselling — tell us where you are and we will help you
            choose the right track.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="space-y-4">
            {[
              { i: Phone, l: "Phone", v: "+91 90000 12345" },
              { i: Mail, l: "Email", v: "hello@skilvantage.com" },
              { i: MapPin, l: "Location", v: "Chennai, Tamil Nadu, India" },
            ].map((c) => (
              <Card key={c.l} className="flex items-start gap-4 border-slate-800 bg-[#111C35] p-5">
                <c.i className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-sky-400">{c.l}</p>
                  <p className="mt-1 text-sm text-slate-200">{c.v}</p>
                </div>
              </Card>
            ))}
            <a
              href="https://wa.me/919000012345"
              target="_blank"
              rel="noreferrer"
              data-testid="whatsapp-cta"
              className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </a>
          </div>

          <Card className="border-slate-800 bg-[#111C35] p-6 lg:p-8">
            <h2 className="font-heading text-xl font-semibold text-slate-100">Send an enquiry</h2>
            <form
              data-testid="contact-form"
              className="mt-6 grid gap-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate(form);
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  data-testid="contact-name-input"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-phone">Phone</Label>
                <Input
                  id="c-phone"
                  data-testid="contact-phone-input"
                  required
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="c-email">Email</Label>
                <Input
                  id="c-email"
                  type="email"
                  data-testid="contact-email-input"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Interested Course</Label>
                <Select
                  value={form.program ?? ""}
                  onValueChange={(v: string) => set("program", v)}
                >
                  <SelectTrigger data-testid="contact-program-select">
                    <SelectValue>{(v) => PROGRAM_LABEL[v as string] ?? "Select"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Learner Type</Label>
                <Select
                  value={form.learner_type ?? ""}
                  onValueChange={(v: string) => set("learner_type", v)}
                >
                  <SelectTrigger data-testid="contact-learner-type-select">
                    <SelectValue>
                      {(v) => (v === "professional" ? "Working Professional" : "Student / Fresher")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student / Fresher</SelectItem>
                    <SelectItem value="professional">Working Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="c-message">Message</Label>
                <Textarea
                  id="c-message"
                  rows={4}
                  data-testid="contact-message-input"
                  value={form.message ?? ""}
                  onChange={(e) => set("message", e.target.value)}
                />
              </div>
              <Button
                type="submit"
                data-testid="contact-submit-button"
                disabled={mutation.isPending}
                className="w-full bg-sky-600 hover:bg-sky-500 active:scale-[0.98] sm:col-span-2 sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Sending..." : "Talk to SkilVantage"}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

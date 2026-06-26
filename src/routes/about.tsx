import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, ArrowLeft, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MedLex" },
      {
        name: "description",
        content:
          "Meet the team behind MedLex and learn about our AI-powered medical dictionary and symptom checker.",
      },
      { property: "og:title", content: "About — MedLex" },
      {
        property: "og:description",
        content:
          "Meet the team behind MedLex and learn about our AI-powered medical dictionary and symptom checker.",
      },
    ],
  }),
  component: AboutPage,
});

const TEAM = [
  { name: "Rein Tanada", role: "My Friend", initials: "RT" },
  { name: "Rein Tanada", role: "Frontend Engineer", initials: "LC" },
  { name: "Rein Tanada", role: "AI/ML Engineer", initials: "SR" },
  { name: "Rein Tanada", role: "Backend Engineer", initials: "NP" },
  { name: "Rein Tanada", role: "UX Designer", initials: "MN" },
  { name: "Rein Tanada", role: "Clinical Advisor", initials: "EB" },
];

function AboutPage() {
  return (
    <div className="relative min-h-screen radial-glow">
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-navy/60">
            <Stethoscope className="h-4 w-4 text-gold" />
          </div>
          <div className="font-display text-xl font-semibold tracking-tight">
            Med<span className="gold-text">Lex</span>
          </div>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy/60 px-3.5 py-1.5 text-xs font-medium text-gold-soft transition hover:border-gold hover:text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to search
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="pt-10 pb-12 text-center sm:pt-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-navy/40 px-3.5 py-1.5 text-xs text-gold-soft">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            About MedLex
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            A clearer language for <span className="gold-text italic">medicine.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            MedLex is a two-way medical dictionary and symptom checker. Search any disease to get
            its full symptom profile, or describe what you feel to surface conditions that match —
            with reasoning, severity, and related metadata. Powered by modern AI and curated
            clinical references, MedLex is designed to make medical knowledge feel approachable,
            beautiful, and trustworthy for everyone.
          </p>
        </section>

        <section className="glass rounded-3xl p-8 reveal">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-gold" />
            <h2 className="font-display text-2xl">Meet the team</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Six people across product, engineering, design, and clinical practice.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((m) => (
              <div
                key={m.name}
                className="group rounded-2xl border border-gold/15 bg-navy/40 p-5 transition hover:border-gold/60 hover:bg-gold/5"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/20 to-navy/60 font-display text-sm font-semibold text-gold">
                    {m.initials}
                  </div>
                  <div>
                    <div className="font-display text-lg text-foreground">{m.name}</div>
                    <div className="text-xs uppercase tracking-wider text-gold-soft">
                      {m.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          MedLex provides reference information only. Not a substitute for professional medical
          advice, diagnosis, or treatment.
        </footer>
      </main>
    </div>
  );
}

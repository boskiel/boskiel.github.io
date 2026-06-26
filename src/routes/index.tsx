import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useMutation } from "@tanstack/react-query";
import { useState, useMemo, type FormEvent } from "react";
import {
  Search,
  Stethoscope,
  Activity,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Loader2,
  BookOpen,
  X,
  Info,

} from "lucide-react";
import { medlexSearch, type DiseaseResult, type SymptomResult } from "@/lib/medlex.functions";
import { DISEASE_INDEX, ALPHABET } from "@/lib/disease-index";
import { HelpChatbot } from "@/components/HelpChatbot";

export const Route = createFileRoute("/")({
  component: Home,
});

type Mode = "disease" | "symptom";

const HINTS: Record<Mode, string[]> = {
  disease: ["Type 2 Diabetes", "Hypertension", "Asthma", "Migraine", "Lupus", "Crohn's disease"],
  symptom: [
    "chest pain and shortness of breath",
    "persistent fatigue",
    "fever and sore throat",
    "joint pain in the morning",
    "headache with nausea",
  ],
};

function Home() {
  const [mode, setMode] = useState<Mode>("disease");
  const [query, setQuery] = useState("");
  const [browseOpen, setBrowseOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string>("A");
  const search = useServerFn(medlexSearch);

  const mutation = useMutation({
    mutationFn: (vars: { query: string; mode: Mode }) =>
      search({ data: vars }) as Promise<DiseaseResult | SymptomResult>,
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    mutation.mutate({ query: q, mode });
  };

  const runHint = (q: string) => {
    setQuery(q);
    mutation.mutate({ query: q, mode });
  };

  const crossSearchSymptom = (symptom: string) => {
    setMode("symptom");
    setQuery(symptom);
    mutation.mutate({ query: symptom, mode: "symptom" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const browseDisease = (name: string) => {
    setMode("disease");
    setQuery(name);
    setBrowseOpen(false);
    mutation.mutate({ query: name, mode: "disease" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden radial-glow">
      <AmbientLayer />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-navy/60">
            <Stethoscope className="h-4 w-4 text-gold" />
          </div>
          <div className="font-display text-xl font-semibold tracking-tight">
            Med<span className="gold-text">Lex</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setBrowseOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy/60 px-3.5 py-1.5 text-xs font-medium text-gold-soft transition hover:border-gold hover:text-gold"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Browse Diseases from A–Z
          </button>
          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy/60 px-3.5 py-1.5 text-xs font-medium text-gold-soft transition hover:border-gold hover:text-gold"
          >
            <Info className="h-3.5 w-3.5" />
            About
          </Link>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>AI-powered clinical reference</span>
          </div>
        </div>
      </header>

      {browseOpen && (
        <AtoZBrowser
          activeLetter={activeLetter}
          setActiveLetter={setActiveLetter}
          onPick={browseDisease}
          onClose={() => setBrowseOpen(false)}
        />
      )}


      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="pt-10 pb-16 text-center sm:pt-20 sm:pb-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-navy/40 px-3.5 py-1.5 text-xs text-gold-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold pulse-soft" />
            Two-way medical dictionary
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            The language of <br className="hidden sm:block" />
            <span className="gold-text italic">medicine,</span> clarified.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Search any disease for its full symptom profile, or describe what you feel to surface
            the conditions that match.
          </p>

          {/* Search card */}
          <form
            onSubmit={onSubmit}
            className="glass mx-auto mt-12 max-w-3xl rounded-2xl p-3 sm:p-4 reveal"
          >
            <div className="mb-3 flex items-center justify-center gap-1.5 rounded-full bg-navy/60 p-1 sm:mx-auto sm:w-fit">
              <ModeTab active={mode === "disease"} onClick={() => setMode("disease")}>
                <Stethoscope className="h-3.5 w-3.5" /> Disease → Symptoms
              </ModeTab>
              <ModeTab active={mode === "symptom"} onClick={() => setMode("symptom")}>
                <Activity className="h-3.5 w-3.5" /> Symptoms → Disease
              </ModeTab>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-navy/70 p-2 focus-within:border-gold/60 focus-within:ring-2 focus-within:ring-gold/20 transition">
              <Search className="ml-2 h-4 w-4 shrink-0 text-gold" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === "disease"
                    ? "Enter a disease, condition, or syndrome…"
                    : "Describe symptoms — e.g. fever and joint pain…"
                }
                className="flex-1 bg-transparent px-1 py-2 text-base text-foreground placeholder:text-muted-foreground/70 outline-none"
              />
              <button
                type="submit"
                disabled={mutation.isPending || !query.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching
                  </>
                ) : (
                  <>
                    Search <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {HINTS[mode].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => runHint(h)}
                  className="rounded-full border border-border bg-navy/40 px-3 py-1 text-xs text-muted-foreground transition hover:border-gold/50 hover:text-gold-soft"
                >
                  {h}
                </button>
              ))}
            </div>
          </form>
        </section>

        {/* Results */}
        <section className="relative">
          {mutation.isPending && <LoadingCard mode={mode} />}
          {mutation.isError && (
            <ErrorCard message={(mutation.error as Error)?.message ?? "Something went wrong."} />
          )}
          {mutation.isSuccess && mutation.data && (
            <ResultRenderer data={mutation.data} onSymptomClick={crossSearchSymptom} />
          )}
        </section>

        <footer className="mt-24 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          MedLex provides reference information only. Not a substitute for professional medical
          advice, diagnosis, or treatment.
        </footer>
      </main>
      <HelpChatbot />
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-gold text-primary-foreground shadow"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function AtoZBrowser({
  activeLetter,
  setActiveLetter,
  onPick,
  onClose,
}: {
  activeLetter: string;
  setActiveLetter: (l: string) => void;
  onPick: (name: string) => void;
  onClose: () => void;
}) {
  const items = DISEASE_INDEX[activeLetter] ?? [];
  return (
    <div className="relative z-20 mx-auto max-w-6xl px-6">
      <div className="glass rounded-2xl p-5 reveal">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-lg">
              Browse the <span className="gold-text">A–Z index</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pick a letter, then tap any condition to open its full profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-gold/60 hover:text-gold"
            aria-label="Close A to Z browser"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {ALPHABET.map((letter) => {
            const has = (DISEASE_INDEX[letter]?.length ?? 0) > 0;
            const active = letter === activeLetter;
            return (
              <button
                key={letter}
                type="button"
                disabled={!has}
                onClick={() => setActiveLetter(letter)}
                className={`grid h-8 w-8 place-items-center rounded-md text-xs font-semibold transition ${
                  active
                    ? "bg-gold text-primary-foreground shadow"
                    : has
                      ? "border border-border bg-navy/50 text-foreground hover:border-gold/60 hover:text-gold"
                      : "border border-border/40 text-muted-foreground/40"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onPick(name)}
              className="group flex items-center justify-between rounded-lg border border-gold/15 bg-navy/40 px-3 py-2 text-left text-sm text-foreground transition hover:border-gold/60 hover:bg-gold/10"
            >
              <span>{name}</span>
              <ChevronRight className="h-3.5 w-3.5 text-gold opacity-0 transition group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingCard({ mode }: { mode: Mode }) {
  return (
    <div className="glass mx-auto max-w-3xl rounded-2xl p-8 text-center reveal">
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
      <p className="mt-3 text-sm text-muted-foreground">
        Consulting the {mode === "disease" ? "clinical reference" : "differential engine"}…
      </p>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="glass mx-auto flex max-w-3xl items-start gap-3 rounded-2xl p-6 reveal">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <div>
        <div className="font-display text-lg">Couldn't complete the search</div>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function ResultRenderer({
  data,
  onSymptomClick,
}: {
  data: DiseaseResult | SymptomResult;
  onSymptomClick: (s: string) => void;
}) {
  if (data.mode === "disease") return <DiseaseCard data={data} onSymptomClick={onSymptomClick} />;
  return <SymptomMatches data={data} />;
}

const TYPE_STYLES: Record<string, string> = {
  disease: "border-gold/40 text-gold-soft bg-gold/10",
  condition: "border-teal/40 text-teal bg-teal/10",
  syndrome: "border-violet-400/40 text-violet-300 bg-violet-400/10",
  disorder: "border-rose-400/40 text-rose-300 bg-rose-400/10",
  infection: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        TYPE_STYLES[type] ?? "border-border text-muted-foreground"
      }`}
    >
      {type}
    </span>
  );
}

function DiseaseCard({
  data,
  onSymptomClick,
}: {
  data: DiseaseResult;
  onSymptomClick: (s: string) => void;
}) {
  return (
    <article className="glass mx-auto max-w-4xl rounded-3xl p-8 reveal">
      <div className="flex flex-wrap items-center gap-3">
        <TypeBadge type={data.type} />
        <span className="text-xs text-muted-foreground">
          Severity: <span className="text-foreground">{data.severity}</span>
        </span>
      </div>
      <h2 className="mt-4 font-display text-4xl tracking-tight">
        <span className="gold-text">{data.name}</span>
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {data.summary}
      </p>

      <div className="mt-8">
        <SectionLabel>Symptoms</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.symptoms.map((s, i) => (
            <button
              key={s + i}
              onClick={() => onSymptomClick(s)}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-gold/20 bg-navy/50 px-3 py-1.5 text-sm text-foreground transition hover:border-gold/60 hover:bg-gold/10"
            >
              {s}
              <ChevronRight className="h-3 w-3 text-gold opacity-0 transition group-hover:opacity-100" />
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tap any symptom to cross-search matching conditions.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <MetaBlock label="Onset" value={data.onset} />
        <MetaBlock label="Affected population" value={data.affectedPopulation} />
        <MetaBlock label="Type" value={data.type} />
      </div>

      {data.relatedConditions.length > 0 && (
        <div className="mt-8">
          <SectionLabel>Related conditions</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.relatedConditions.map((r) => (
              <span
                key={r}
                className="rounded-full border border-border bg-navy/40 px-3 py-1 text-xs text-muted-foreground"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function SymptomMatches({ data }: { data: SymptomResult }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Matches for</div>
        <div className="mt-1 font-display text-2xl italic">"{data.query}"</div>
      </div>
      <div className="space-y-4">
        {data.matches.map((m, i) => (
          <article
            key={m.name + i}
            className="glass rounded-2xl p-6 reveal"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={m.type} />
                  <LikelihoodBadge likelihood={m.likelihood} />
                </div>
                <h3 className="mt-2 font-display text-2xl">
                  <span className="gold-text">{m.name}</span>
                </h3>
              </div>
              <div className="text-xs text-muted-foreground">
                Severity: <span className="text-foreground">{m.severity}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gold/15 bg-navy/40 p-4">
              <div className="text-[10px] uppercase tracking-wider text-gold-soft">
                Why this matches
              </div>
              <p className="mt-1 text-sm text-foreground/90">{m.reasoning}</p>
            </div>

            <div className="mt-4">
              <SectionLabel>Key symptoms</SectionLabel>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.keySymptoms.map((s, j) => (
                  <span
                    key={s + j}
                    className="rounded-md border border-border bg-navy/40 px-2 py-1 text-xs text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function LikelihoodBadge({ likelihood }: { likelihood: "high" | "moderate" | "low" }) {
  const styles = {
    high: "bg-gold/15 text-gold-soft border-gold/40",
    moderate: "bg-teal/15 text-teal border-teal/40",
    low: "bg-muted text-muted-foreground border-border",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[likelihood]}`}
    >
      {likelihood} match
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-soft">
      {children}
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-navy/40 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm capitalize text-foreground">{value}</div>
    </div>
  );
}

/* ------- Ambient hero layer: EKG line + particles ------- */

function AmbientLayer() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 14 + Math.random() * 18,
        delay: Math.random() * 12,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* EKG line */}
      <div className="absolute inset-x-0 top-[42%] h-28 opacity-30 sm:opacity-40">
        <div className="ekg-line flex h-full w-[200%]">
          <EkgSvg />
          <EkgSvg />
        </div>
      </div>
      {/* Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute bottom-0 rounded-full bg-gold/70 shadow-[0_0_12px_2px_oklch(0.85_0.09_85/0.6)]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function EkgSvg() {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="h-full w-1/2"
      aria-hidden
    >
      <defs>
        <linearGradient id="ekgGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.12 85)" stopOpacity="0" />
          <stop offset="50%" stopColor="oklch(0.78 0.12 85)" stopOpacity="1" />
          <stop offset="100%" stopColor="oklch(0.78 0.12 85)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 L200,60 L230,60 L245,30 L260,90 L275,20 L290,100 L305,60 L500,60 L530,60 L545,40 L560,80 L575,60 L800,60 L830,60 L845,30 L860,90 L875,20 L890,100 L905,60 L1200,60"
        fill="none"
        stroke="url(#ekgGrad)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

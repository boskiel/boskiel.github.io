import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, X, Send, Loader2, Trash2, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "medlex.helpChat.v1";
const CHAT_ID = "medlex-help-chat";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function HelpChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initial] = useState<UIMessage[]>(() => loadMessages());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: CHAT_ID,
    messages: initial,
    transport,
  });

  // Persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota
    }
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, open]);

  // Focus
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, status]);

  const busy = status === "submitted" || status === "streaming";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  };

  const ask = (q: string) => {
    if (busy) return;
    sendMessage({ text: q });
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close help chat" : "Open help chat"}
        className="group fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold text-primary-foreground shadow-lg shadow-gold/30 transition hover:scale-105 hover:brightness-110"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(640px,80vh)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gold/30 bg-card shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-navy/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gold/15 text-gold">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold leading-tight">
                  MedLex <span className="gold-text">Assistant</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Friendly help · general info only
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
              }}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-navy/60 hover:text-gold"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="font-display text-lg">How can I help?</div>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Ask me how to use MedLex, what a medical term means, or any general health
                  question.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {[
                    "How do I search by symptoms?",
                    "What's the difference between a syndrome and a disorder?",
                    "Tips for talking to my doctor",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => ask(q)}
                      className="rounded-full border border-border bg-navy/40 px-3 py-1 text-[11px] text-muted-foreground transition hover:border-gold/50 hover:text-gold-soft"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {status === "submitted" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                    Thinking…
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 border-t border-border/60 bg-navy/40 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MedLex Assistant…"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              aria-label="Send"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gold px-3 py-2 text-sm text-primary-foreground">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="prose prose-sm max-w-[90%] text-foreground prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-strong:text-gold-soft">
        <ReactMarkdown>{text || "…"}</ReactMarkdown>
      </div>
    </div>
  );
}

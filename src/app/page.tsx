"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  labels: string[];
}

// ---------------------------------------------------------------------------
// Inline icon components (no lucide dependency at runtime)
// ---------------------------------------------------------------------------

function IconMail({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
    </svg>
  );
}

function IconShuffle({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" />
      <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
      <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
      <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconInbox({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function IconBook({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function MessageSkeleton() {
  return (
    <div className="divide-y divide-stone-100">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="h-9 w-9 rounded-full bg-stone-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-stone-100 animate-pulse" />
            <div className="h-3 w-48 rounded bg-stone-100 animate-pulse" />
            <div className="h-2.5 w-64 rounded bg-stone-50 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Home() {
  const [username, setUsername] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
  const [activeEmail, setActiveEmail] = useState("");
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [domainLoadError, setDomainLoadError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await fetch("/api/domains");
      const data = await res.json();
      if (data.success) {
        setDomains(data.domains);
        if (data.domains.length > 0) setSelectedDomain(data.domains[0]);
      } else {
        setDomainLoadError(true);
      }
    } catch {
      setDomainLoadError(true);
    }
  };

  const generateRandom = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let r = "";
    for (let i = 0; i < 8; i++) r += chars[Math.floor(Math.random() * chars.length)];
    setUsername(r);
  };

  const generateEmail = () => {
    if (!username.trim() || !selectedDomain) return;
    const email = `${username.trim().toLowerCase()}@${selectedDomain}`;
    setActiveEmail(email);
    setSelectedMessage(null);
    fetchMessages(email);
  };

  const fetchMessages = async (email: string) => {
    setLoading(true);
    try {
      const [user, domain] = email.split("@");
      const res = await fetch(`/api/i/${encodeURIComponent(user)}/${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch { /* */ }
    setLoading(false);
  };

  const fetchSingleMessage = async (email: string, id: string): Promise<EmailMessage | null> => {
    try {
      const [user, domain] = email.split("@");
      const res = await fetch(`/api/i/${encodeURIComponent(user)}/${encodeURIComponent(domain)}/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success) return data.message;
    } catch { /* */ }
    return null;
  };

  const deleteMessage = async (id: string) => {
    if (!activeEmail) return;
    try {
      const [user, domain] = activeEmail.split("@");
      await fetch(`/api/i/${encodeURIComponent(user)}/${encodeURIComponent(domain)}/${encodeURIComponent(id)}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch { /* */ }
  };

  const handleSelectMessage = async (msg: EmailMessage) => {
    if (!msg.body) {
      const full = await fetchSingleMessage(activeEmail, msg.id);
      if (full) {
        setSelectedMessage(full);
        setMessages((prev) => prev.map((m) => (m.id === full.id ? full : m)));
        return;
      }
    }
    setSelectedMessage(msg);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(activeEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Polling
  useEffect(() => {
    if (!activeEmail) return;
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const [user, domain] = activeEmail.split("@");
        const res = await fetch(`/api/i/${encodeURIComponent(user)}/${encodeURIComponent(domain)}?limit=50`);
        const data = await res.json();
        if (data.success) setMessages(data.messages);
      } catch { /* */ }
    }, 5000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeEmail]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!domainDropdownOpen) return;
    const handler = () => setDomainDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [domainDropdownOpen]);

  const canGenerate = username.trim().length > 0 && selectedDomain.length > 0;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="mx-auto max-w-3xl flex h-14 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="micromail" className="h-6 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/docs"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
              <IconBook className="text-sm" />
              API Docs
            </a>
            <span className="flex items-center gap-1.5 text-xs text-stone-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-[pulse-dot_2s_ease-in-out_infinite]" />
                <span className="relative block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">Online</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
          {/* Hero - left aligned */}
          <div className="mb-10 sm:mb-14">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 leading-tight">
              Temporary email,<br />instantly.
            </h1>
            <p className="mt-3 text-base text-stone-500 max-w-md leading-relaxed">
              Pick a name, choose a domain, start receiving. No sign-up, no tracking, no fuss.
            </p>
          </div>

          {/* Generator card */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Username input */}
                <div className="relative flex-1">
                  <input
                    className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 pr-10 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 focus:bg-white transition-colors"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateEmail()}
                  />
                  <button
                    type="button"
                    onClick={generateRandom}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Random username"
                  >
                    <IconShuffle className="text-sm" />
                  </button>
                </div>

                {/* Domain selector */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDomainDropdownOpen(!domainDropdownOpen); }}
                    className="h-11 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-700 flex items-center gap-1.5 hover:border-stone-300 focus:border-stone-400 transition-colors cursor-pointer min-w-[140px]"
                  >
                    <span className="text-stone-400">@</span>
                    <span className="truncate">{selectedDomain || "domain"}</span>
                    <IconChevronDown className="text-xs text-stone-400 ml-auto shrink-0" />
                  </button>
                  {domainDropdownOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-stone-200 shadow-lg py-1 z-10 animate-[fade-in_0.15s_ease-out]">
                      {domains.map((d) => (
                        <button
                          key={d}
                          onClick={() => { setSelectedDomain(d); setDomainDropdownOpen(false); }}
                          className={`w-full text-left px-3.5 py-2 text-sm hover:bg-stone-50 transition-colors cursor-pointer ${d === selectedDomain ? "text-stone-900 font-medium" : "text-stone-600"}`}
                        >
                          @{d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate button */}
                <button
                  className="h-11 px-5 rounded-xl bg-stone-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  disabled={!canGenerate}
                  onClick={generateEmail}
                >
                  <IconArrowRight className="text-sm" />
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Active email bar */}
            {activeEmail && (
              <div className="border-t border-stone-100 px-4 sm:px-5 py-3 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-white shrink-0">
                    <img src="/logo.png" alt="" className="h-4 w-auto brightness-0 invert" />
                  </div>
                  <span className="text-sm font-medium text-stone-900 truncate font-mono tracking-tight">
                    {activeEmail}
                  </span>
                </div>
                <button
                  onClick={copyEmail}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                >
                  {copied ? <IconCheck className="text-emerald-600" /> : <IconCopy className="text-sm" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* Inbox */}
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            {!activeEmail ? (
              <EmptyState
                icon={<IconInbox className="text-2xl text-stone-300" />}
                title="No mailbox active"
                description="Generate an address above to start receiving messages."
              />
            ) : loading ? (
              <MessageSkeleton />
            ) : messages.length === 0 ? (
              <EmptyState
                icon={<IconInbox className="text-2xl text-stone-300" />}
                title="Waiting for mail"
                description="Messages sent to this address will appear here automatically."
              />
            ) : (
              <>
                {/* Message list */}
                <div className="divide-y divide-stone-100">
                  {messages.map((msg, i) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-stone-50 transition-colors ${
                        selectedMessage?.id === msg.id ? "bg-stone-50 border-l-2 border-l-stone-900" : ""
                      }`}
                      style={{ animation: `slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms both` }}
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 text-xs font-semibold select-none">
                        {msg.from.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-stone-900 truncate">{msg.from.split("<")[0].trim()}</p>
                          <span className="text-[11px] text-stone-400 shrink-0 tabular-nums">
                            {formatRelativeTime(msg.date)}
                          </span>
                        </div>
                        <p className="text-sm text-stone-700 truncate mt-0.5">{msg.subject || "(no subject)"}</p>
                        <p className="text-xs text-stone-400 truncate mt-0.5 leading-relaxed">{msg.snippet}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 cursor-pointer mt-0.5"
                        title="Delete"
                      >
                        <IconTrash className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Message detail */}
                {selectedMessage && (
                  <div className="border-t border-stone-200 p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-stone-900 leading-snug">
                        {selectedMessage.subject || "(no subject)"}
                      </h3>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                      >
                        <IconX className="text-sm" />
                      </button>
                    </div>
                    <div className="space-y-1 text-xs text-stone-500 mb-5">
                      <p><span className="font-medium text-stone-600">From</span> {selectedMessage.from}</p>
                      <p><span className="font-medium text-stone-600">To</span> {selectedMessage.to}</p>
                      <p><span className="font-medium text-stone-600">Date</span> {new Date(selectedMessage.date).toLocaleString()}</p>
                    </div>
                    <div className="border-t border-stone-100 pt-4">
                      {selectedMessage.body?.includes("<") ? (
                        <div
                          className="prose-mail text-sm text-stone-700 leading-relaxed max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
                        />
                      ) : (
                        <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {selectedMessage.body}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error state */}
          {domainLoadError && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Could not load domains. Check your server configuration.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100">
        <div className="mx-auto max-w-3xl px-5 py-6 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} micromail
          </p>
          <a
            href="/docs"
            className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
          >
            API Docs
          </a>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 border border-stone-100">
        {icon}
      </div>
      <p className="text-sm font-medium text-stone-700">{title}</p>
      <p className="mt-1 text-xs text-stone-400 max-w-xs">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Relative time formatter
// ---------------------------------------------------------------------------

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = now - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

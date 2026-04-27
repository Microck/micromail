"use client";

import { useState, useEffect, useRef } from "react";
import { Select } from "@base-ui/react/select";
import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Tooltip } from "@base-ui/react/tooltip";

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

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg fill="currentcolor" width="10" height="10" viewBox="0 0 10 10" {...props}>
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function ChevronUpDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentcolor" strokeWidth={1.5} {...props}>
      <path d="M0.5 4.5L4 1.5L7.5 4.5" />
      <path d="M0.5 7.5L4 10.5L7.5 7.5" />
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

function IconShuffle({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
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
  const [activeEmail, setActiveEmail] = useState("");
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [domainLoadError, setDomainLoadError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Build domain items for Base UI Select
  const domainItems = domains.map((d) => ({ label: d, value: d }));

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

  useEffect(() => {
    void fetchDomains();
  }, []);

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

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeEmail]);

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
                  <Input
                    className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 pr-10 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-400 focus:bg-white transition-colors"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateEmail()}
                  />
                  <Tooltip.Provider>
                    <Tooltip.Root>
                      <Tooltip.Trigger
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                        onClick={generateRandom}
                      >
                        <IconShuffle className="text-sm" />
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Positioner sideOffset={8}>
                          <Tooltip.Popup className="rounded-md bg-stone-900 px-2 py-1 text-xs text-white shadow-md origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:opacity-0 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:scale-90">
                            Random username
                          </Tooltip.Popup>
                        </Tooltip.Positioner>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>

                {/* Domain selector - Base UI Select */}
                <Select.Root
                  value={selectedDomain}
                  onValueChange={(v) => { if (v !== null) setSelectedDomain(v); }}
                  items={domainItems}
                >
                  <Select.Trigger className="h-11 rounded-xl border border-stone-200 bg-stone-50 px-3.5 text-sm text-stone-700 flex items-center gap-1.5 hover:border-stone-300 focus:border-stone-400 transition-colors cursor-pointer min-w-[140px]">
                    <span className="text-stone-400">@</span>
                    <Select.Value className="truncate data-[placeholder]:opacity-60" placeholder="domain" />
                    <Select.Icon className="flex ml-auto shrink-0">
                      <ChevronUpDownIcon className="text-stone-400" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner className="outline-hidden z-10" sideOffset={4}>
                      <Select.Popup className="group min-w-[var(--anchor-width)] origin-[var(--transform-origin)] rounded-md bg-[canvas] text-stone-900 shadow-lg outline outline-1 outline-stone-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0">
                        <Select.List className="py-1 overflow-y-auto max-h-[var(--available-height)]">
                          {domainItems.map(({ label, value }) => (
                            <Select.Item
                              key={value}
                              value={value}
                              className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-4 pl-2.5 text-sm outline-hidden select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-stone-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-1 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-stone-900"
                            >
                              <Select.ItemIndicator className="col-start-1">
                                <CheckIcon className="size-3" />
                              </Select.ItemIndicator>
                              <Select.ItemText className="col-start-2">@{label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>

                {/* Generate button */}
                <Button
                  className="h-11 px-5 rounded-xl bg-stone-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-stone-800 active:bg-stone-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-stone-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 select-none"
                  disabled={!canGenerate}
                  onClick={generateEmail}
                >
                  <IconArrowRight className="text-sm" />
                  <span>Generate</span>
                </Button>
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
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger
                      className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                      onClick={copyEmail}
                    >
                      {copied ? <IconCheck className="text-emerald-600" /> : <IconCopy className="text-sm" />}
                      {copied ? "Copied" : "Copy"}
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Positioner sideOffset={8}>
                        <Tooltip.Popup className="rounded-md bg-stone-900 px-2 py-1 text-xs text-white shadow-md origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:opacity-0 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:scale-90">
                          Copy email
                        </Tooltip.Popup>
                      </Tooltip.Positioner>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
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
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger
                            className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 cursor-pointer mt-0.5"
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); deleteMessage(msg.id); }}
                          >
                            <IconTrash className="text-sm" />
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={8}>
                              <Tooltip.Popup className="rounded-md bg-stone-900 px-2 py-1 text-xs text-white shadow-md origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:opacity-0 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:scale-90">
                                Delete
                              </Tooltip.Popup>
                            </Tooltip.Positioner>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
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
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger
                            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                            onClick={() => setSelectedMessage(null)}
                          >
                            <IconX className="text-sm" />
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={8}>
                              <Tooltip.Popup className="rounded-md bg-stone-900 px-2 py-1 text-xs text-white shadow-md origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:opacity-0 data-[starting-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:scale-90">
                                Close
                              </Tooltip.Popup>
                            </Tooltip.Positioner>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
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

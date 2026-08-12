import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCheck, Paperclip, Search, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState, RequireAuth } from "@/components/RequireAuth";
import { useStore } from "@/lib/store";
import { timeAgo, timeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — TaskAnt" },
      {
        name: "description",
        content: "Chat with task posters and workers in real time inside TaskAnt.",
      },
      { property: "og:title", content: "Messages — TaskAnt" },
      { property: "og:description", content: "Secure in-app messaging for every task." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MessagesPage />
    </RequireAuth>
  ),
});

function MessagesPage() {
  const { db, currentUser, sendMessage, markConversationRead } = useStore();
  const me = currentUser!;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(
    () =>
      db.conversations
        .filter((c) => c.participants.includes(me.id))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [db.conversations, me.id],
  );

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const messages = db.messages.filter((m) => m.conversationId === active?.id);
  const other = db.users.find((u) => u.id === active?.participants.find((p) => p !== me.id));

  useEffect(() => {
    if (active) markConversationRead(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const filtered = conversations.filter((c) => {
    const o = db.users.find((u) => u.id === c.participants.find((p) => p !== me.id));
    return !q || (o?.name.toLowerCase().includes(q.toLowerCase()) ?? false);
  });

  const send = () => {
    if (!active || !text.trim()) return;
    sendMessage(active.id, text.trim());
    setText("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">Messages</h1>
      <p className="text-sm text-muted-foreground">
        Real-time style chat. Messages sync instantly across the demo session.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No conversations yet"
            description="Chats are created when you message a poster or when a bid is accepted."
          />
        </div>
      ) : (
        <div className="mt-6 grid h-[70vh] gap-4 overflow-hidden rounded-2xl border bg-card md:grid-cols-[300px_1fr]">
          {/* list */}
          <aside className={cn("flex flex-col border-r", active && "hidden md:flex")}>
            <div className="relative p-3">
              <Search
                size={15}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search conversations"
                className="pl-9"
              />
            </div>
            <ul className="flex-1 overflow-y-auto">
              {filtered.map((c) => {
                const o = db.users.find((u) => u.id === c.participants.find((p) => p !== me.id));
                const last = [...db.messages].reverse().find((m) => m.conversationId === c.id);
                const unread = db.messages.filter(
                  (m) => m.conversationId === c.id && !m.read && m.senderId !== me.id,
                ).length;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted",
                        active?.id === c.id && "bg-primary-soft",
                      )}
                    >
                      <span className="relative">
                        <Avatar className="size-10">
                          <AvatarImage src={o?.avatar} />
                          <AvatarFallback>{o?.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {o?.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{o?.name}</span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {timeAgo(c.updatedAt)}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {last?.text ?? "No messages yet"}
                        </span>
                      </span>
                      {unread > 0 && (
                        <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {unread}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* thread */}
          <section className="flex min-h-0 flex-col">
            <header className="flex items-center gap-3 border-b p-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setActiveId(null)}
              >
                ←
              </Button>
              <Avatar className="size-9">
                <AvatarImage src={other?.avatar} />
                <AvatarFallback>{other?.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{other?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {other?.online ? "Online now" : "Offline"}
                </p>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
              {messages.map((m) => {
                const mine = m.senderId === me.id;
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-card",
                        mine
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-card",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.attachment && <p className="mt-1 text-xs opacity-80">📎 {m.attachment}</p>}
                      <span
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[10px]",
                          mine ? "text-primary-foreground/75" : "text-muted-foreground",
                        )}
                      >
                        {timeLabel(m.createdAt)}
                        {mine && (
                          <CheckCheck size={12} className={m.read ? "opacity-100" : "opacity-50"} />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <footer className="flex items-center gap-2 border-t p-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast.info("Attachment upload is simulated in the demo build.")}
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </Button>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
              />
              <Button onClick={send} disabled={!text.trim()} aria-label="Send message">
                <Send size={16} />
              </Button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

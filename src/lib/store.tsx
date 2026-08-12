/**
 * TaskAnt data service (demo mode).
 *
 * This is the single repository/service layer used by the whole app.
 * It currently persists to localStorage with seeded demo data, and exposes the
 * same async-free interface a MongoDB/Express + JWT backend would expose, so
 * swapping `src/lib/api.ts` for real HTTP calls does not require UI changes.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedDB } from "./seed";
import { uid } from "./format";
import type {
  Bid,
  Category,
  Conversation,
  DB,
  Message,
  Notification,
  Payment,
  Report,
  Review,
  Task,
  TaskStatus,
  User,
} from "./types";

const DB_KEY = "taskant.db.v1";
const SESSION_KEY = "taskant.session.v1";
export const SERVICE_FEE_RATE = 0.1;

interface StoreValue {
  db: DB;
  currentUser: User | null;
  ready: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (data: Partial<User> & { name: string; email: string; password: string }) => {
    ok: boolean;
    error?: string;
  };
  logout: () => void;
  switchUser: (id: string) => void;
  createTask: (t: Omit<Task, "id" | "createdAt" | "status" | "posterId">) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  cancelTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  placeBid: (taskId: string, price: number, estimatedTime: string, message: string) => void;
  acceptBid: (bidId: string) => void;
  acceptTaskDirectly: (taskId: string) => void;
  sendMessage: (conversationId: string, text: string, attachment?: string) => void;
  openConversation: (otherUserId: string, taskId?: string) => Conversation;
  markConversationRead: (conversationId: string) => void;
  addReview: (taskId: string, toUserId: string, rating: number, comment: string) => void;
  payTask: (taskId: string, method: Payment["method"]) => void;
  submitReport: (r: Omit<Report, "id" | "createdAt" | "status" | "reporterId">) => void;
  submitVerification: () => void;
  setVerification: (userId: string, status: User["verification"]) => void;
  toggleSuspend: (userId: string) => void;
  resolveReport: (reportId: string, status: Report["status"]) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (patch: Partial<User>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => seedDB());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      const loaded: DB = raw ? JSON.parse(raw) : seedDB();
      setDb(loaded);
      const sid = localStorage.getItem(SESSION_KEY);
      if (sid) setCurrentUser(loaded.users.find((u) => u.id === sid) ?? null);
    } catch {
      setDb(seedDB());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(DB_KEY, JSON.stringify(db));
  }, [db, ready]);

  useEffect(() => {
    if (!ready) return;
    if (currentUser) localStorage.setItem(SESSION_KEY, currentUser.id);
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser, ready]);

  // keep the signed-in user object in sync with the db
  useEffect(() => {
    if (!currentUser) return;
    const fresh = db.users.find((u) => u.id === currentUser.id);
    if (fresh && fresh !== currentUser) setCurrentUser(fresh);
  }, [db, currentUser]);

  const notify = (
    draft: DB,
    userId: string,
    title: string,
    body: string,
    type: string,
    link?: string,
  ) => {
    const n: Notification = {
      id: uid("n"),
      userId,
      title,
      body,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    };
    draft.notifications = [n, ...draft.notifications];
  };

  const mutate = useCallback((fn: (draft: DB) => void) => {
    setDb((prev) => {
      const draft: DB = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const value = useMemo<StoreValue>(() => {
    const me = currentUser;

    return {
      db,
      currentUser,
      ready,
      login(email, password) {
        const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return { ok: false, error: "No account found with this email." };
        if (user.password !== password) return { ok: false, error: "Incorrect password." };
        if (user.suspended)
          return { ok: false, error: "This account is suspended. Contact support." };
        mutate((d) => {
          const u = d.users.find((x) => x.id === user.id)!;
          u.online = true;
        });
        setCurrentUser(user);
        return { ok: true };
      },
      register(data) {
        if (db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase()))
          return { ok: false, error: "An account with this email already exists." };
        const user: User = {
          id: uid("u"),
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone ?? "",
          city: data.city ?? "Dhaka",
          division: data.division ?? "Dhaka",
          role: (data.role as User["role"]) ?? "poster",
          avatar:
            data.avatar ||
            `https://api.dicebear.com/9.x/initials/svg?backgroundType=gradientLinear&seed=${encodeURIComponent(data.name)}`,
          bio: "",
          skills: [],
          serviceCategories: [],
          serviceAreas: [data.city ?? "Dhaka"],
          rating: 0,
          reviewCount: 0,
          completedTasks: 0,
          earnings: 0,
          spending: 0,
          verification: "NOT_VERIFIED",
          joinedAt: new Date().toISOString(),
          suspended: false,
          available: true,
          online: true,
        };
        mutate((d) => {
          d.users.push(user);
          notify(
            d,
            user.id,
            "Welcome to TaskAnt 🐜",
            "Complete your profile and verification to build trust.",
            "system",
            "/profile/" + user.id,
          );
        });
        setCurrentUser(user);
        return { ok: true };
      },
      logout() {
        if (me)
          mutate((d) => {
            const u = d.users.find((x) => x.id === me.id);
            if (u) u.online = false;
          });
        setCurrentUser(null);
      },
      switchUser(id) {
        const u = db.users.find((x) => x.id === id);
        if (u) setCurrentUser(u);
      },
      createTask(t) {
        const task: Task = {
          ...t,
          id: uid("t"),
          posterId: me!.id,
          status: "OPEN",
          createdAt: new Date().toISOString(),
        };
        mutate((d) => {
          d.tasks.unshift(task);
          notify(
            d,
            me!.id,
            "Task published",
            `“${task.title}” is now live in the marketplace.`,
            "task",
            `/tasks/${task.id}`,
          );
          d.users
            .filter(
              (u) =>
                u.role === "worker" && (u.city === task.city || u.serviceAreas.includes(task.city)),
            )
            .forEach((w) =>
              notify(
                d,
                w.id,
                "New task near you",
                `${task.title} — ${task.city} · ৳${task.budget}`,
                "task",
                `/tasks/${task.id}`,
              ),
            );
        });
        return task;
      },
      updateTaskStatus(taskId, status) {
        mutate((d) => {
          const task = d.tasks.find((t) => t.id === taskId);
          if (!task) return;
          task.status = status;
          const parties = [task.posterId, task.workerId].filter(Boolean) as string[];
          parties.forEach((p) =>
            notify(
              d,
              p,
              "Task status changed",
              `“${task.title}” is now ${status.replace("_", " ")}.`,
              "status",
              `/tasks/${task.id}`,
            ),
          );
          if (status === "COMPLETED" && task.workerId) {
            const w = d.users.find((u) => u.id === task.workerId);
            if (w) w.completedTasks += 1;
          }
        });
      },
      cancelTask(taskId) {
        mutate((d) => {
          const task = d.tasks.find((t) => t.id === taskId);
          if (!task) return;
          task.status = "CANCELLED";
          d.bids.filter((b) => b.taskId === taskId).forEach((b) => (b.status = "REJECTED"));
          notify(d, task.posterId, "Task cancelled", `“${task.title}” was cancelled.`, "status");
        });
      },
      removeTask(taskId) {
        mutate((d) => {
          const task = d.tasks.find((t) => t.id === taskId);
          d.tasks = d.tasks.filter((t) => t.id !== taskId);
          if (task)
            notify(
              d,
              task.posterId,
              "Task removed by admin",
              `“${task.title}” was removed for policy review.`,
              "admin",
            );
        });
      },
      placeBid(taskId, price, estimatedTime, message) {
        mutate((d) => {
          const task = d.tasks.find((t) => t.id === taskId);
          if (!task) return;
          const bid: Bid = {
            id: uid("b"),
            taskId,
            workerId: me!.id,
            price,
            estimatedTime,
            message,
            status: "PENDING",
            createdAt: new Date().toISOString(),
          };
          d.bids.unshift(bid);
          if (task.status === "OPEN") task.status = "BIDDING";
          notify(
            d,
            task.posterId,
            "New bid received",
            `${me!.name} bid ৳${price} on “${task.title}”.`,
            "bid",
            `/tasks/${task.id}`,
          );
        });
      },
      acceptBid(bidId) {
        mutate((d) => {
          const bid = d.bids.find((b) => b.id === bidId);
          if (!bid) return;
          const task = d.tasks.find((t) => t.id === bid.taskId);
          if (!task) return;
          bid.status = "ACCEPTED";
          d.bids
            .filter((b) => b.taskId === task.id && b.id !== bid.id)
            .forEach((b) => (b.status = "REJECTED"));
          task.workerId = bid.workerId;
          task.agreedAmount = bid.price;
          task.status = "ASSIGNED";
          notify(
            d,
            bid.workerId,
            "Bid accepted 🎉",
            `You were selected for “${task.title}”.`,
            "bid",
            `/tasks/${task.id}`,
          );
          notify(
            d,
            task.posterId,
            "Task assigned",
            `“${task.title}” is assigned.`,
            "status",
            `/tasks/${task.id}`,
          );
          if (
            !d.conversations.some(
              (c) =>
                c.participants.includes(task.posterId) && c.participants.includes(bid.workerId),
            )
          ) {
            d.conversations.push({
              id: uid("c"),
              participants: [task.posterId, bid.workerId],
              taskId: task.id,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },
      acceptTaskDirectly(taskId) {
        mutate((d) => {
          const task = d.tasks.find((t) => t.id === taskId);
          if (!task) return;
          task.workerId = me!.id;
          task.agreedAmount = task.budget;
          task.status = "ASSIGNED";
          notify(
            d,
            task.posterId,
            "Worker accepted your task",
            `${me!.name} accepted “${task.title}”.`,
            "status",
            `/tasks/${task.id}`,
          );
          if (
            !d.conversations.some(
              (c) => c.participants.includes(task.posterId) && c.participants.includes(me!.id),
            )
          ) {
            d.conversations.push({
              id: uid("c"),
              participants: [task.posterId, me!.id],
              taskId: task.id,
              updatedAt: new Date().toISOString(),
            });
          }
        });
      },
      openConversation(otherUserId, taskId) {
        const existing = db.conversations.find(
          (c) => c.participants.includes(me!.id) && c.participants.includes(otherUserId),
        );
        if (existing) return existing;
        const conv: Conversation = {
          id: uid("c"),
          participants: [me!.id, otherUserId],
          taskId,
          updatedAt: new Date().toISOString(),
        };
        mutate((d) => {
          d.conversations.push(conv);
        });
        return conv;
      },
      sendMessage(conversationId, text, attachment) {
        mutate((d) => {
          const conv = d.conversations.find((c) => c.id === conversationId);
          if (!conv) return;
          const msg: Message = {
            id: uid("m"),
            conversationId,
            senderId: me!.id,
            text,
            attachment,
            createdAt: new Date().toISOString(),
            read: false,
          };
          d.messages.push(msg);
          conv.updatedAt = msg.createdAt;
          const other = conv.participants.find((p) => p !== me!.id)!;
          notify(
            d,
            other,
            "New message",
            `${me!.name}: ${text.slice(0, 60)}`,
            "message",
            "/messages",
          );
        });
      },
      markConversationRead(conversationId) {
        mutate((d) => {
          d.messages
            .filter((m) => m.conversationId === conversationId && m.senderId !== me?.id)
            .forEach((m) => (m.read = true));
        });
      },
      addReview(taskId, toUserId, rating, comment) {
        mutate((d) => {
          const review: Review = {
            id: uid("r"),
            taskId,
            fromUserId: me!.id,
            toUserId,
            rating,
            comment,
            createdAt: new Date().toISOString(),
          };
          d.reviews.unshift(review);
          const target = d.users.find((u) => u.id === toUserId);
          if (target) {
            const total = target.rating * target.reviewCount + rating;
            target.reviewCount += 1;
            target.rating = Math.round((total / target.reviewCount) * 10) / 10;
          }
          notify(
            d,
            toUserId,
            "New review",
            `${me!.name} rated you ${rating} ★.`,
            "review",
            `/profile/${toUserId}`,
          );
        });
      },
      payTask(taskId, method) {
        mutate((d) => {
          const task = d.tasks.find((t) => t.id === taskId);
          if (!task || !task.workerId) return;
          const amount = task.agreedAmount ?? task.budget;
          const serviceFee = Math.round(amount * SERVICE_FEE_RATE);
          const payment: Payment = {
            id: uid("pay"),
            taskId,
            posterId: task.posterId,
            workerId: task.workerId,
            amount,
            serviceFee,
            total: amount + serviceFee,
            method,
            status: "PAID",
            createdAt: new Date().toISOString(),
          };
          d.payments.unshift(payment);
          task.status = "PAID";
          const poster = d.users.find((u) => u.id === task.posterId);
          const worker = d.users.find((u) => u.id === task.workerId);
          if (poster) poster.spending += payment.total;
          if (worker) worker.earnings += amount;
          notify(
            d,
            task.posterId,
            "Payment confirmed",
            `Demo payment of ৳${payment.total} completed via ${method}.`,
            "payment",
            `/tasks/${taskId}`,
          );
          notify(
            d,
            task.workerId,
            "You got paid 💸",
            `৳${amount} released for “${task.title}”.`,
            "payment",
            `/tasks/${taskId}`,
          );
        });
      },
      submitReport(r) {
        mutate((d) => {
          d.reports.unshift({
            ...r,
            id: uid("rep"),
            reporterId: me!.id,
            status: "OPEN",
            createdAt: new Date().toISOString(),
          });
          d.users
            .filter((u) => u.role === "admin")
            .forEach((a) =>
              notify(
                d,
                a.id,
                "New report submitted",
                `${r.category} — needs review.`,
                "report",
                "/admin",
              ),
            );
        });
      },
      submitVerification() {
        mutate((d) => {
          const u = d.users.find((x) => x.id === me!.id);
          if (u) u.verification = "PENDING";
          d.users
            .filter((x) => x.role === "admin")
            .forEach((a) =>
              notify(
                d,
                a.id,
                "Verification request",
                `${me!.name} submitted verification documents.`,
                "verification",
                "/admin",
              ),
            );
        });
      },
      setVerification(userId, status) {
        mutate((d) => {
          const u = d.users.find((x) => x.id === userId);
          if (u) u.verification = status;
          notify(
            d,
            userId,
            "Verification update",
            `Your verification status is now ${status.replace("_", " ").toLowerCase()}.`,
            "verification",
          );
        });
      },
      toggleSuspend(userId) {
        mutate((d) => {
          const u = d.users.find((x) => x.id === userId);
          if (u) u.suspended = !u.suspended;
        });
      },
      resolveReport(reportId, status) {
        mutate((d) => {
          const r = d.reports.find((x) => x.id === reportId);
          if (r) r.status = status;
        });
      },
      markAllNotificationsRead() {
        mutate((d) => {
          d.notifications.filter((n) => n.userId === me?.id).forEach((n) => (n.read = true));
        });
      },
      updateProfile(patch) {
        mutate((d) => {
          const u = d.users.find((x) => x.id === me!.id);
          if (u) Object.assign(u, patch);
        });
      },
    };
  }, [db, currentUser, ready, mutate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/* ---------- selectors / derived helpers ---------- */

export function useUser(id?: string) {
  const { db } = useStore();
  return db.users.find((u) => u.id === id);
}

export function matchScore(worker: User, task: Task) {
  let score = 40;
  if (worker.city === task.city) score += 25;
  else if (worker.serviceAreas.includes(task.city)) score += 18;
  else if (worker.division === task.division) score += 8;
  if ((worker.serviceCategories as unknown as Category[]).includes(task.category)) score += 12;
  const skillHit = task.skills.filter((s) => worker.skills.includes(s)).length;
  score += Math.min(skillHit * 5, 10);
  score += Math.round((worker.rating / 5) * 8);
  score += Math.min(Math.floor(worker.completedTasks / 10), 3);
  if (worker.verification === "VERIFIED") score += 2;
  if (!worker.available) score -= 15;
  return Math.max(35, Math.min(99, score));
}

export function recommendedWorkers(users: User[], task: Task, limit = 4) {
  return users
    .filter((u) => u.role === "worker" && !u.suspended)
    .map((u) => ({ worker: u, score: matchScore(u, task) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

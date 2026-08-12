import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Shield,
  User as UserIcon,
  X,
} from "lucide-react";
import { AntLogo } from "./AntLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/tasks", label: "Find Tasks" },
  { to: "/post-task", label: "Post a Task" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/become-a-worker", label: "Become a Worker" },
] as const;

export function Navbar() {
  const { currentUser, db, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const unread = db.notifications.filter((n) => n.userId === currentUser?.id && !n.read).length;
  const unreadMsgs = db.messages.filter(
    (m) =>
      !m.read &&
      m.senderId !== currentUser?.id &&
      db.conversations.some((c) => c.id === m.conversationId && c.participants.includes(currentUser?.id ?? "")),
  ).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <AntLogo className="size-9" />
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-tight">TaskAnt</span>
            <span className="hidden text-[10px] font-medium text-muted-foreground sm:block">
              Small Tasks. Big Impact.
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname === n.to && "bg-primary-soft text-primary",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {currentUser ? (
            <>
              <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
                <Link to="/messages" aria-label="Messages">
                  <MessageSquare size={18} />
                  {unreadMsgs > 0 && (
                    <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
                  )}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative">
                <Link to="/notifications" aria-label="Notifications">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {unread}
                    </span>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border p-1 pr-3 transition-colors hover:bg-muted">
                    <Avatar className="size-7">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:block">{currentUser.name.split(" ")[0]}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="capitalize">
                    {currentUser.name}
                    <span className="block text-xs font-normal text-muted-foreground">{currentUser.role}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/$userId" params={{ userId: currentUser.id }}>
                      <UserIcon size={16} /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">
                      <MessageSquare size={16} /> Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/verification">
                      <Shield size={16} /> Verification
                    </Link>
                  </DropdownMenuItem>
                  {currentUser.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield size={16} /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t bg-background px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
            {currentUser ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                Dashboard
              </Link>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)}>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function MobileTabBar() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  const items = [
    { to: "/tasks", icon: Search, label: "Tasks" },
    { to: "/post-task", icon: Plus, label: "Post" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/messages", icon: MessageSquare, label: "Chat" },
  ] as const;
  return (
    <nav className="sticky bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 backdrop-blur sm:hidden">
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <i.icon size={18} />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

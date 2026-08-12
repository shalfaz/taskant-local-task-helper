import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

/** Client-side protected route guard for the demo JWT session. */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { currentUser, ready } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!currentUser) navigate({ to: "/login" });
    else if (roles && !roles.includes(currentUser.role)) navigate({ to: "/dashboard" });
  }, [ready, currentUser, roles, navigate]);

  if (!ready || !currentUser || (roles && !roles.includes(currentUser.role))) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Checking your session…
      </div>
    );
  }
  return <>{children}</>;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

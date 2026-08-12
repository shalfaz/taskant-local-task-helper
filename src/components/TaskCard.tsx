import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, MessagesSquare, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { StarRating } from "./StarRating";
import { bdt, dateLabel, timeAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

export function TaskCard({ task }: { task: Task }) {
  const { db } = useStore();
  const poster = db.users.find((u) => u.id === task.posterId);
  const bidCount = db.bids.filter((b) => b.taskId === task.id).length;

  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: task.id }}
      className="card-surface group flex flex-col gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
            {task.category}
          </span>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold group-hover:text-primary">
            {task.title}
          </h3>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin size={14} className="text-primary" /> {task.city}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <Wallet size={14} className="text-primary" /> {bdt(task.budget)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar size={14} className="text-primary" /> {dateLabel(task.deadline)}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MessagesSquare size={14} className="text-primary" /> {bidCount} bid
          {bidCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarImage src={poster?.avatar} alt={poster?.name} />
            <AvatarFallback>{poster?.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <p className="text-xs font-medium">{poster?.name}</p>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <StarRating value={poster?.rating ?? 0} size={10} /> {poster?.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground">{timeAgo(task.createdAt)}</span>
      </div>
    </Link>
  );
}

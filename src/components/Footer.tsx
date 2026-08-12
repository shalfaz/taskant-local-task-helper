import { Link } from "@tanstack/react-router";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { AntLogo } from "./AntLogo";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <AntLogo className="size-9" />
            <span className="text-lg font-extrabold">TaskAnt</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Small Tasks. Big Impact. TaskAnt connects people across Bangladesh with trusted local helpers who
            complete real-world tasks on their behalf.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tasks" className="hover:text-primary">Find Tasks</Link></li>
            <li><Link to="/post-task" className="hover:text-primary">Post a Task</Link></li>
            <li><Link to="/how-it-works" className="hover:text-primary">How It Works</Link></li>
            <li><Link to="/become-a-worker" className="hover:text-primary">Become a Worker</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-primary">Login</Link></li>
            <li><Link to="/register" className="hover:text-primary">Register</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            <li><Link to="/verification" className="hover:text-primary">Verification</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin size={14} /> Dhaka, Bangladesh</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +880 1700 000000</li>
            <li className="flex items-center gap-2"><Mail size={14} /> hello@taskant.demo</li>
            <li className="flex items-center gap-2"><Facebook size={14} /> /taskant</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TaskAnt — University demo project. Payments are simulated (Demo Payment).
      </div>
    </footer>
  );
}

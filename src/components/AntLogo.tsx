export function AntLogo({ className = "size-8" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[62%]" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="5.5" r="2.4" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="11" rx="2" ry="2.3" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="17.4" rx="2.9" ry="3.4" fill="currentColor" stroke="none" />
        <path d="M10 4 8.4 2M14 4l1.6-2" strokeLinecap="round" />
        <path d="M9.8 10.4 6 8.6M14.2 10.4 18 8.6M9.6 12.4 6.2 14.6M14.4 12.4l3.4 2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

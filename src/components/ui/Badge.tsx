interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "neutral", size = "sm" }: BadgeProps) {
  const variants = {
    accent: "bg-accent/15 text-accent border border-accent/30",
    warning: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/15 text-red-400 border border-red-500/30",
    info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    neutral: "bg-navy-600 text-slate-300 border border-navy-500",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  accent?: boolean;
}

export function Card({ children, className = "", hover, accent, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-navy-800 border rounded-xl p-5
        ${accent ? "border-accent/40" : "border-navy-500"}
        ${hover ? "hover:bg-navy-700 hover:border-navy-400 transition-colors duration-200 cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

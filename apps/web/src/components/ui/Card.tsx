import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border border-brand-muted bg-white p-4 shadow dark:border-zinc-700 dark:bg-zinc-900 ${className}`}>
      {title && <h2 className="mb-2 text-lg font-semibold">{title}</h2>}
      {children}
    </div>
  );
}

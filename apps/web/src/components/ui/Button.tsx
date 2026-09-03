import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-nav text-white hover:bg-brand-quiz",
  outline: "border border-brand-quiz text-brand-quiz hover:bg-brand-muted/20 bg-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded px-4 py-2 font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

interface ButtonLinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#2F80ED] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white shadow-sm focus-visible:ring-[#2F80ED]",
  secondary:
    "bg-[#475569] hover:bg-[#334155] text-white shadow-sm focus-visible:ring-[#475569]",
  outline:
    "border-2 border-[#2F80ED] text-[#2F80ED] hover:bg-[#EFF6FF] focus-visible:ring-[#2F80ED]",
  ghost:
    "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] focus-visible:ring-[#94A3B8]",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm focus-visible:ring-red-500",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5 min-h-[36px]",
  md: "text-sm px-4 py-2.5 min-h-[44px]",
  lg: "text-base px-6 py-3 min-h-[52px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconPosition = "left",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        iconPosition === "left" && icon
      )}
      {children}
      {!loading && iconPosition === "right" && icon}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  href,
  external,
  className,
  children,
  "aria-label": ariaLabel,
}: ButtonLinkProps) {
  const cls = cn(base, variants[variant], sizes[size], className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={ariaLabel}
      >
        {iconPosition === "left" && icon}
        {children}
        {iconPosition === "right" && icon}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} aria-label={ariaLabel}>
      {iconPosition === "left" && icon}
      {children}
      {iconPosition === "right" && icon}
    </Link>
  );
}

import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function Section({ id, children, className, dark }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20",
        dark ? "bg-[#060F1E]" : "bg-[#0B1F3A]",
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10", className)}>
      <h2
        className="text-2xl sm:text-3xl font-bold text-white"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-slate-400">{subtitle}</p>
      )}
      <div className="mt-3 h-1 w-12 rounded-full bg-[#2F80ED]" />
    </div>
  );
}

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "li";
}

export default function Card({ children, className, hover, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-white rounded-[10px] shadow-sm border border-[#E2E8F0]",
        hover && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </Tag>
  );
}

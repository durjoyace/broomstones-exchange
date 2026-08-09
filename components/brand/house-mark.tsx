import { cn } from "@/lib/utils";

export function HouseMark({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        light ? "bg-white" : "bg-[#BC1F25]",
        className
      )}
    >
      <span
        className={cn(
          "absolute size-[72%] rounded-full",
          light ? "bg-[#5B6870]" : "bg-white"
        )}
      />
      <span
        className={cn(
          "absolute size-[43%] rounded-full",
          light ? "bg-white" : "bg-[#5B6870]"
        )}
      />
      <span className="absolute size-[16%] rounded-full bg-[#2C2E35]" />
    </span>
  );
}

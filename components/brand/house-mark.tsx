import { cn } from "@/lib/utils";

type HouseMarkProps = {
  className?: string;
  light?: boolean;
};

export function HouseMark({ className, light = false }: HouseMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full",
        light ? "bg-white" : "bg-[#751c2b]",
        className
      )}
    >
      <span
        className={cn(
          "absolute size-[72%] rounded-full",
          light ? "bg-[#2480a8]" : "bg-white"
        )}
      />
      <span
        className={cn(
          "absolute size-[43%] rounded-full",
          light ? "bg-white" : "bg-[#2480a8]"
        )}
      />
      <span className="absolute size-[18%] rounded-full bg-[#e5b94a]" />
    </span>
  );
}

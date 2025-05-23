import { Button } from "@/components/ui/button";
import Icon from "./icon";
import { cn } from "@/lib/utils";

export function LoadingButton({
  isLoading,
  children,
  ...props
}: {
  isLoading: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className="flex h-fit w-fit flex-row items-center justify-start gap-3 text-sm font-bold"
      disabled={isLoading}
    >
      <Icon
        id="loading"
        className={cn("mr-1 size-4 fill-white", isLoading ? "animate-spin" : "")}
      />
      {children}
    </Button>
  );
}

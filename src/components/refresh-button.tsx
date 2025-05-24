import { Button } from "@/components/ui/button";
import Icon from "./icon";
import { cn } from "@/lib/utils";

export function RefreshButton({
  isLoading,
  ...props
}: {
  isLoading: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="ghost"
      {...props}
      className="flex h-fit w-fit flex-row items-center justify-start gap-3 text-sm font-bold"
      disabled={isLoading}
    >
      {isLoading && (
        <Icon id="loading" className={cn("mr-1 size-4 animate-spin fill-gray-500")} />
      )}
      Refresh
    </Button>
  );
}

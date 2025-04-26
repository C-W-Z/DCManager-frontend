import { cn } from "../lib/utils";
import { Host } from "../lib/schema";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";

interface HostComponentProps {
  host: Host;
}

export default function HostComponent({ host }: HostComponentProps) {
  const heightPx = host.height * HOST_HEIGHT + (host.height - 1) * RACK_GAP;
  const isRunning = host.service_id !== "";

  return (
    <div
      className="flex w-[400px] flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-2 py-4 hover:opacity-60"
      style={{ height: `${heightPx}px` }}
    >
      <div className="text-sm font-bold">{host.name}</div>
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          isRunning ? "bg-green-600" : "bg-red-500",
        )}
      ></div>
    </div>
  );
}

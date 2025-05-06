import { cn } from "@/lib/utils";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { SimpleHost } from "@/lib/type";

interface HostComponentProps {
  host: SimpleHost;
}

export default function HostComponent({ host }: HostComponentProps) {
  const height_px = host.height * HOST_HEIGHT + (host.height - 1) * RACK_GAP;

  return (
    <div
      className="flex w-[400px] flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-2 py-4 hover:opacity-60"
      style={{ height: `${height_px}px` }}
    >
      <div className="text-sm font-bold">{host.name}</div>
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          host.status == "running" ? "bg-green-600" : "bg-red-400",
        )}
      ></div>
    </div>
  );
}

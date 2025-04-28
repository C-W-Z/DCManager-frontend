import { cn } from "../lib/utils";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";

interface HostComponentProps {
  name: string;
  height: number;
  isRunning: boolean;
}

export default function HostComponent({ name, height, isRunning }: HostComponentProps) {
  const heightPx = height * HOST_HEIGHT + (height - 1) * RACK_GAP;

  return (
    <div
      className="flex w-[400px] flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-2 py-4 hover:opacity-60"
      style={{ height: `${heightPx}px` }}
    >
      <div className="text-sm font-bold">{name}</div>
      <div
        className={cn("h-3 w-3 rounded-full", isRunning ? "bg-green-600" : "bg-red-400")}
      ></div>
    </div>
  );
}

import { height2Px } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { Host } from "@/lib/type";
import { pos2translateY } from "@/lib/constant";
import { Link } from "react-router-dom";

export const HostComponent = ({ host, rackHeight }: { host: Host; rackHeight: number }) => {
  const translateY = pos2translateY(host.pos, host.height, rackHeight);

  return (
    <Link to={`/host/${host.name}`}>
      <div
        className="absolute top-0 left-0 flex w-full flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2 hover:bg-gray-200"
        style={{
          height: height2Px(host.height),
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div className="text-sm font-bold">{host.name}</div>
        <div
          className={cn("h-3 w-3 rounded-full", host.running ? "bg-green-600" : "bg-red-400")}
        ></div>
      </div>
    </Link>
  );
};

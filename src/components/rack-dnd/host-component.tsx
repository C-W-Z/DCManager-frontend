import { height2Px } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { SimpleHost } from "@/lib/type";
import { pos2translateY } from "@/lib/constant";
import { Link } from "react-router-dom";

export const HostComponent = ({
  host,
  rackHeight,
}: {
  host: SimpleHost;
  rackHeight: number;
}) => {
  const translateY = pos2translateY(host.pos, host.height, rackHeight);

  return (
    <div
      className="absolute top-0 left-0 flex w-full cursor-not-allowed flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2"
      style={{
        height: height2Px(host.height),
        transform: `translateY(${translateY}px)`,
      }}
    >
      <Link to={`/host/${host.id}`} className="text-sm font-bold hover:underline">
        {host.name}
      </Link>
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          host.status === "running"
            ? "bg-green-600"
            : host.status === "idle"
              ? "bg-gray-400"
              : "bg-red-400",
        )}
      ></div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { getRack } from "@/lib/api";
import { Rack } from "@/lib/type";
import { Skeleton } from "@/components/ui/skeleton";
import RackComponent from "@/components/rack-component";

interface RackViewProps {
  rackId: string;
}

export default function RackView({ rackId }: RackViewProps) {
  const [rack, setRack] = useState<Rack | null>(null);

  useEffect(() => {
    // fetch rack data
    getRack(rackId)
      .then((rack) => {
        setRack(rack);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setRack(null);
      });
  }, [rackId]);

  return (
    <div className="my-auto flex min-h-screen max-w-screen flex-col items-center justify-center gap-10 p-8">
      {rack && (
        <div className="flex flex-row gap-10">
          <RackComponent rack={rack} setRack={setRack} />
          <div className="flex w-[300px] flex-col items-end justify-start">
            <div>just some info</div>
          </div>
        </div>
      )}
      {!rack && (
        <div className="flex flex-row gap-10">
          <Skeleton className="h-[70vh] w-full" />
          <Skeleton className="h-[70vh] w-[300px]" />
        </div>
      )}
    </div>
  );
}

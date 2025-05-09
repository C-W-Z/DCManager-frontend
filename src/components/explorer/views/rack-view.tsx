import { useEffect, useState } from "react";
import { getRack } from "@/lib/api";
import { Rack } from "@/lib/type";
import { Skeleton } from "@/components/ui/skeleton";
import RackDnD from "@/components/rack/rack-dnd";
import { AddHostDialog } from "../dialogs/add-host-dialog";

interface RackViewProps {
  rackId: string;
}

export default function RackView({ rackId }: RackViewProps) {
  const [rack, setRack] = useState<Rack | null>(null);

  useEffect(() => {
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
    <div>
      {rack && (
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <RackDnD rack={rack} setRack={setRack} />
          <AddHostDialog rack={rack} setRack={setRack} />
        </div>
      )}

      {!rack && (
        <div className="flex w-full items-center justify-center">
          <Skeleton className="h-96 w-96" />
        </div>
      )}
    </div>
  );
}

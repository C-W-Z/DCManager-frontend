import { useState } from "react";
import { generateMockRack } from "../lib/mock";
import { Button } from "@/components/ui/button";
import RackComponent from "@/components/RackComponent";
import { AddHostDialog } from "@/components/AddHostDialog";

import { z } from "zod";
import { addHostFormSchema } from "@/lib/form-schema";
import HostComponent from "@/components/HostComponent";

export default function RackView() {
  const [rackData, setRackData] = useState(generateMockRack());
  const [newHost, setNewHost] = useState({} as z.infer<typeof addHostFormSchema>);

  return (
    <div className="my-auto flex min-h-screen max-w-screen flex-col items-center justify-center gap-2 p-8">
      <Button onClick={() => setRackData(generateMockRack())}>Generate Mock Data</Button>
      <div className="flex flex-row gap-10">
        <RackComponent rack={rackData} />
        <div>
          <AddHostDialog setNewHost={setNewHost} />
          {newHost && (
            <HostComponent name={newHost.name} height={newHost.height} isRunning={false} />
          )}
        </div>
      </div>
    </div>
  );
}

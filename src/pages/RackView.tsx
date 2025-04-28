import { useState } from "react";
import { generateMockRack } from "../lib/mock";
import { Button } from "@/components/ui/button";
import RackComponent from "@/components/RackComponent";
import { AddHostDialog } from "@/components/AddHostDialog";

export default function RackView() {
  const [rack, setRack] = useState(generateMockRack());

  return (
    <div className="my-auto flex min-h-screen max-w-screen flex-col items-center justify-center gap-2 p-8">
      <Button onClick={() => setRack(generateMockRack())}>Generate Mock Data</Button>
      <div className="flex flex-row gap-10">
        <RackComponent rack={rack} />
        <AddHostDialog rack={rack} setRack={setRack} />
      </div>
    </div>
  );
}

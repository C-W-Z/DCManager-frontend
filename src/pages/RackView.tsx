import { useState } from "react";
import { generateMockRack } from "../lib/mock";
import { Button } from "@/components/ui/button";
import RackComponent from "@/components/RackComponent";

export default function RackView() {
  const [rack, setRack] = useState(generateMockRack());

  return (
    <div className="my-auto flex min-h-screen max-w-screen flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-row gap-10">
        <Button onClick={() => setRack(generateMockRack())}>Generate Mock Data</Button>
        <RackComponent rack={rack} setRack={setRack} />
        <div className="flex w-[300px] flex-col items-end justify-start">
          <div>just some info</div>
        </div>
      </div>
    </div>
  );
}

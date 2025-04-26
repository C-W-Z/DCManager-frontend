import { useState } from "react";
import { generateMockRack } from "../lib/mock";
import { Button } from "@/components/ui/button";
import RackComponent from "@/components/rack";

export default function App() {
  const [rackData, setRackData] = useState(generateMockRack());

  return (
    <div className="my-auto flex min-h-screen max-w-screen flex-col items-center justify-center gap-2 p-8">
      <Button onClick={() => setRackData(generateMockRack())}>
        Generate Mock Data
      </Button>
      <RackComponent rack={rackData} />
    </div>
  );
}

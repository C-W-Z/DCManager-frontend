import { Rack } from "@/lib/type";

interface RackInfoCardProps {
  rack: Rack;
}

export default function RackInfoCard({ rack }: RackInfoCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-lg font-bold">{rack.name}</div>
      <Separator />
      <div className="text-sm text-gray-500">
        {rack.rackType} - {rack.rackSize}
      </div>
      <div className="text-sm text-gray-500">
        {rack.rackLocation} - {rack.rackStatus}
      </div>
    </div>
  );
}

function Separator() {
  return <div className="my-2 h-px w-full bg-gray-200" />;
}

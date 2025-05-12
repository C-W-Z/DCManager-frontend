import { Host } from "@/lib/type";
import { Button } from "@/components/ui/button";

interface HostInfoCardProps {
  host: Host;
}

export default function HostInfoCard({ host }: HostInfoCardProps) {
  return (
    <div className="flex w-[400px] flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="text-lg font-bold">{host.name + " (host)"}</div>
      </div>
      <Separator />
      <DataColumn label={"IP address"} data={host.ip} />
      <Separator />
      <DataColumn label={"UUID"} data={host.id} />
      <DataColumn label={"Height"} data={host.height.toString()} />
      <div className="mt-4 flex flex-row items-center justify-center gap-8">
        <Button
          variant="outline"
          onClick={() => {
            console.log("Edit Host");
          }}
        >
          Edit Host
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            console.log("Move Host");
          }}
        >
          Move Host
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            console.log("Delete Host");
          }}
        >
          Delete Host
        </Button>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="my-2 h-[2px] w-full bg-gray-200" />;
}

interface DataColumnProps {
  data: string;
  label: string;
}

function DataColumn({ data, label }: DataColumnProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-bold">{data ? data : "null"}</div>
    </div>
  );
}

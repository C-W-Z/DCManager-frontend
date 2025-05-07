import type { SimpleDatacenter } from "@/lib/type";

interface RoomSummaryProps {
  datacenter: SimpleDatacenter;
}

export function RoomSummary({ datacenter }: RoomSummaryProps) {
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{datacenter.name} (Data Center)</h2>
      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Height</p>
          <p className="text-2xl font-bold text-gray-800">{datacenter.height}U</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Rooms</p>
          <p className="text-2xl font-bold text-gray-800">{datacenter.n_rooms}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Racks</p>
          <p className="text-2xl font-bold text-gray-800">{datacenter.n_racks}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Hosts</p>
          <p className="text-2xl font-bold text-gray-800">{datacenter.n_hosts}</p>
        </div>
      </div>
    </div>
  );
}

import type { SimpleRoom } from "@/lib/type";

interface RackSummaryProps {
  room: SimpleRoom;
}

export function RackSummary({ room }: RackSummaryProps) {
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{room.name} (Room)</h2>
      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Height</p>
          <p className="text-2xl font-bold text-gray-800">{room.height}U</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Racks</p>
          <p className="text-2xl font-bold text-gray-800">{room.n_racks}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Hosts</p>
          <p className="text-2xl font-bold text-gray-800">{room.n_hosts}</p>
        </div>
      </div>
    </div>
  );
}

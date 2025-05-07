export type Count = {
  dc: number;
  room: number;
  rack: number;
  host: number;
};

interface DataCenterSummaryProps {
  totalCount: Count;
}

export function DataCenterSummary({ totalCount }: DataCenterSummaryProps) {
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Data Centers</p>
          <p className="text-2xl font-bold text-gray-800">{totalCount.dc}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Rooms</p>
          <p className="text-2xl font-bold text-gray-800">{totalCount.room}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Racks</p>
          <p className="text-2xl font-bold text-gray-800">{totalCount.rack}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm text-gray-500">Hosts</p>
          <p className="text-2xl font-bold text-gray-800">{totalCount.host}</p>
        </div>
      </div>
    </div>
  );
}

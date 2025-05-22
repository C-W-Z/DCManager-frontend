import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import type { SimpleRoom, SimpleRack, SimpleDatacenter } from "@/lib/type";
import { getRoom } from "@/lib/api";
import { AddRackDialog } from "@/components/explorer/dialogs/add-rack-dialog";
import { RackSummary } from "../summary/rack-summary";
import { useParams, useOutletContext } from "react-router-dom";
import { useUser } from "@/context/use-user";

interface OutletContext {
  datacenter: SimpleDatacenter | null;
  room: SimpleRoom | null;
}

export default function RackTable() {
  const { user } = useUser();
  const { datacenter, room } = useOutletContext<OutletContext>();
  const { roomId } = useParams<{ roomId: string }>();
  const [racks, setRacks] = useState<SimpleRack[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRacks = useCallback((room_id: string) => {
    setLoading(true);
    getRoom(room_id)
      .then((room) => {
        setRacks(room.racks);
      })
      .catch((error) => {
        console.error("Error fetching racks data from room:", error);
        setRacks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (roomId) {
      loadRacks(roomId);
    }
  }, [roomId, loadRacks]);

  const onUpdateSuccess = (updatedRack: SimpleRack) => {
    if (updatedRack) {
      setRacks((prev) =>
        prev.map((rack) => (rack.name === updatedRack.name ? updatedRack : rack)),
      );
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedRacks = racks.filter((rack) => !idsToDelete.includes(rack.name));
    setRacks(updatedRacks);
  };

  const onMoveSuccess = (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => {
    // Handle the move success logic here
    console.log("Move success:", data);
    handleRefresh();
  };

  const handleRefresh = () => {
    if (roomId) {
      loadRacks(roomId);
    }
  };

  const columns = rackColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
    user: user || undefined,
  });

  return (
    <div>
      {room && <RackSummary room={room} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Racks</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {user?.role === "admin" && datacenter && room && <AddRackDialog currentDC={datacenter} currentRoom={room} />}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={racks}
        getRowId={(row) => row.name}
        loading={loading}
        onMoveSuccess={onMoveSuccess}
        onDeleteSuccess={onDeleteSuccess}
        type="rack"
      />
    </div>
  );
}

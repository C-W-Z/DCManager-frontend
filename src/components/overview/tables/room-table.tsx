"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC } from "@/lib/api";
import { AddRoomDialog } from "../../dialogs/add-room-dialog";
import { useParams } from "react-router-dom";
import { useUser } from "@/context/use-user";
import { Summary } from "../summary";

export default function RoomTable() {
  const { user } = useUser();
  const { dcName } = useParams<{ dcName: string }>();
  const [dc, setDC] = useState<SimpleDatacenter | null>(null);
  const [rooms, setRooms] = useState<SimpleRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRooms = useCallback((dcName: string) => {
    setLoading(true);
    getDC(dcName)
      .then((dc) => {
        setDC(dc);
        setRooms(dc.rooms);
      })
      .catch((error) => {
        console.error("Error fetching rooms data from datacenter:", error);
        setDC(null);
        setRooms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (dcName) {
      loadRooms(dcName);
    }
  }, [dcName, loadRooms]);

  const onUpdateSuccess = (updatedRoom: SimpleRoom) => {
    if (updatedRoom) {
      setRooms((prev) =>
        prev.map((room) => (room.name === updatedRoom.name ? updatedRoom : room)),
      );
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedRooms = rooms.filter((room) => !idsToDelete.includes(room.name));
    setRooms(updatedRooms);
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
    if (dcName) {
      loadRooms(dcName);
    }
  };

  const columns = roomColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
    user: user || undefined,
  });

  return (
    <div>
      <Summary
        title={dc?.name}
        loading={loading}
        contents={[
          { label: "資料中心限高", value: dc?.height },
          { label: "房間數量", value: dc?.n_rooms },
          { label: "機櫃數量", value: dc?.n_racks },
          { label: "主機數量", value: dc?.n_hosts },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {dc && <AddRoomDialog currentDC={dc} />}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rooms}
        getRowId={(row) => row.name}
        loading={loading}
        onMoveSuccess={onMoveSuccess}
        onDeleteSuccess={onDeleteSuccess}
        type="room"
      />
    </div>
  );
}

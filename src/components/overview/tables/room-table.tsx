"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import type { APIError, SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC } from "@/lib/api";
import { AddRoomDialog } from "../../dialogs/add-room-dialog";
import { useParams } from "react-router-dom";
import { useUser } from "@/context/use-user";
import { Summary } from "../summary";
import { RefreshButton } from "@/components/refresh-button";
import { toast } from "sonner";

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
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
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
          <RefreshButton isLoading={loading} onClick={() => handleRefresh()} />
          {dc && <AddRoomDialog currentDC={dc} onSuccess={() => handleRefresh()} />}
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

"use client";

import { useState } from "react";
import DataCenterTable from "@/components/explorer/tables/datacenter-table";
import RoomTable from "@/components/explorer/tables/room-table";
import RackTable from "@/components/explorer/tables/rack-table";
import Breadcrumb from "./breadcrumb";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";

export type ViewLevel = "datacenter-table" | "room-table" | "rack-table";

export default function Explorer() {
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter-table");
  const [selectedDataCenter, setSelectedDataCenter] = useState<SimpleDatacenter | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SimpleRoom | null>(null);

  const handleDataCenterSelect = (dc: SimpleDatacenter) => {
    setSelectedDataCenter(dc);
    setCurrentView("room-table");
  };

  const handleRoomSelect = (room: SimpleRoom) => {
    setSelectedRoom(room);
    setCurrentView("rack-table");
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    setCurrentView(level);
    if (level === "datacenter-table") {
      setSelectedDataCenter(null);
      setSelectedRoom(null);
    } else if (level === "room-table") {
      setSelectedRoom(null);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mt-4 ml-4 flex items-center justify-between p-4">
        <Breadcrumb
          currentView={currentView}
          dcName={selectedDataCenter ? selectedDataCenter.name : null}
          roomName={selectedRoom ? selectedRoom.name : null}
          onNavigate={handleBreadcrumbClick}
        />
      </div>

      <div className="flex-1 px-6">
        {currentView === "datacenter-table" && (
          <DataCenterTable onSelect={handleDataCenterSelect} />
        )}
        {currentView === "room-table" && selectedDataCenter && (
          <RoomTable datacenter={selectedDataCenter} onSelect={handleRoomSelect} />
        )}
        {currentView === "rack-table" && selectedDataCenter && selectedRoom && (
          <RackTable datacenter={selectedDataCenter} room={selectedRoom} />
        )}
      </div>
    </div>
  );
}

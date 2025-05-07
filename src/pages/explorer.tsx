"use client";

import { useState } from "react";
import DataCenterTable from "@/components/explorer/views/datacenter-table";
import RoomTable from "@/components/explorer/views/room-table";
import RackTable from "@/components/explorer/views/rack-table";
import Breadcrumb from "../components/explorer/breadcrumb";
import type { SimpleDatacenter, SimpleRoom, SimpleRack } from "@/lib/type";
import RackView from "@/components/explorer/views/rack-view";

export type ViewLevel = "datacenter-table" | "room-table" | "rack-table" | "rack";

export default function Explorer() {
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter-table");
  const [selectedDataCenter, setSelectedDataCenter] = useState<SimpleDatacenter | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SimpleRoom | null>(null);
  const [selectedRack, setSelectedRack] = useState<SimpleRack | null>(null);

  const handleDataCenterSelect = (dc: SimpleDatacenter) => {
    setSelectedDataCenter(dc);
    setCurrentView("room-table");
  };

  const handleRoomSelect = (room: SimpleRoom) => {
    setSelectedRoom(room);
    setCurrentView("rack-table");
  };

  const handleRackSelect = (rack: SimpleRack) => {
    setSelectedRack(rack);
    setCurrentView("rack");
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    setCurrentView(level);
    if (level === "datacenter-table") {
      setSelectedDataCenter(null);
      setSelectedRoom(null);
      setSelectedRack(null);
    } else if (level === "room-table") {
      setSelectedRoom(null);
      setSelectedRack(null);
    } else if (level === "rack-table") {
      setSelectedRack(null);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="ml-4 mt-4 flex items-center justify-between p-4">
        <Breadcrumb
          currentView={currentView}
          dcName={selectedDataCenter ? selectedDataCenter.name : null}
          roomName={selectedRoom ? selectedRoom.name : null}
          rackName={selectedRack ? selectedRack.name : null}
          onNavigate={handleBreadcrumbClick}
        />
      </div>

      <div className="flex-1 p-4">
        {currentView === "datacenter-table" && (
          <DataCenterTable onSelect={handleDataCenterSelect} />
        )}
        {currentView === "room-table" && selectedDataCenter && (
          <RoomTable datacenter={selectedDataCenter} onSelect={handleRoomSelect} />
        )}
        {currentView === "rack-table" && selectedDataCenter && selectedRoom && (
          <RackTable
            datacenter={selectedDataCenter}
            room={selectedRoom}
            onSelect={handleRackSelect}
          />
        )}
        {currentView === "rack" && selectedDataCenter && selectedRoom && selectedRack && (
          <RackView rackId={selectedRack.id} />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { DataCenterTable } from "@/components/explorer/tables/datacenter-table";
import { RoomTable } from "@/components/explorer/tables/room-table";
import { RackTable } from "@/components/explorer/tables/rack-table";
import { Breadcrumb } from "../components/explorer/breadcrumb";
import { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { AddDatacenterDialog } from "../components/explorer/dialogs/add-datacenter-dialog";
import { AddRoomDialog } from "../components/explorer/dialogs/add-room-dialog";
import { AddRackDialog } from "../components/explorer/dialogs/add-rack-dialog";

export type ViewLevel = "datacenter" | "room" | "rack";

export default function Explorer() {
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter");
  const [selectedDataCenter, setSelectedDataCenter] = useState<SimpleDatacenter | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SimpleRoom | null>(null);

  const handleDataCenterSelect = (dc: SimpleDatacenter) => {
    setSelectedDataCenter(dc);
    setCurrentView("room");
  };

  const handleRoomSelect = (room: SimpleRoom) => {
    setSelectedRoom(room);
    setCurrentView("rack");
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    setCurrentView(level);
    if (level === "datacenter") {
      setSelectedDataCenter(null);
      setSelectedRoom(null);
    } else if (level === "room") {
      setSelectedRoom(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <Breadcrumb
          currentView={currentView}
          dcName={selectedDataCenter ? selectedDataCenter.name : null}
          roomName={selectedRoom ? selectedRoom.name : null}
          onNavigate={handleBreadcrumbClick}
        />
        {currentView === "datacenter" && <AddDatacenterDialog />}
        {currentView === "room" && selectedDataCenter && (
          <AddRoomDialog currentDC={selectedDataCenter} />
        )}
        {currentView === "rack" && selectedDataCenter && selectedRoom && (
          <AddRackDialog currentDC={selectedDataCenter} currentRoom={selectedRoom} />
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {currentView === "datacenter" && <DataCenterTable onSelect={handleDataCenterSelect} />}
        {currentView === "room" && selectedDataCenter && (
          <RoomTable datacenter={selectedDataCenter} onSelect={handleRoomSelect} />
        )}
        {currentView === "rack" && selectedDataCenter && selectedRoom && (
          <RackTable room={selectedRoom} />
        )}
      </div>
    </div>
  );
}

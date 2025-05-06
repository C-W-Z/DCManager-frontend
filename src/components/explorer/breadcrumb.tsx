"use client";

import { ChevronRight } from "lucide-react";
import type { ViewLevel } from "../../pages/explorer";

interface BreadcrumbProps {
  currentView: ViewLevel;
  dcName: string | null;
  roomName: string | null;
  rackName: string | null;
  onNavigate: (level: ViewLevel) => void;
}

export default function Breadcrumb({
  currentView,
  dcName,
  roomName,
  rackName,
  onNavigate,
}: BreadcrumbProps) {
  return (
    <div className="flex items-center text-lg">
      <button
        onClick={() => onNavigate("datacenter-table")}
        className={`hover:underline ${currentView === "datacenter-table" ? "font-bold" : "text-gray-500"}`}
      >
        All
      </button>

      {dcName && (
        <>
          <ChevronRight className="mx-1 h-4 w-6 text-gray-400" />
          <button
            onClick={() => onNavigate("room-table")}
            className={`hover:underline ${currentView === "room-table" ? "font-bold" : "text-gray-500"}`}
          >
            {dcName}
          </button>
        </>
      )}

      {roomName && (
        <>
          <ChevronRight className="mx-1 h-4 w-6 text-gray-400" />
          <button
            onClick={() => onNavigate("rack-table")}
            className={`hover:underline ${currentView === "rack-table" ? "font-bold" : ""}`}
          >
            {roomName}
          </button>
        </>
      )}

      {rackName && (
        <>
          <ChevronRight className="mx-1 h-4 w-6 text-gray-400" />
          <button
            onClick={() => onNavigate("rack")}
            className={`hover:underline ${currentView === "rack" ? "font-bold" : ""}`}
          >
            {rackName}
          </button>
        </>
      )}
    </div>
  );
}

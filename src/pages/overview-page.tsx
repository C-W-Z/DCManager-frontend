"use client";

import { useState, useEffect, useCallback } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../components/overview/breadcrumb";
import { useUser } from "@/context/use-user";
import { FallbackView } from "@/components/fallback-view";
import { getRoom } from "@/lib/api";
import { APIError } from "@/lib/type";
import { toast } from "sonner";

export type ViewLevel = "datacenter-table" | "room-table" | "rack-table";

export function OverviewPage() {
  const navigate = useNavigate();
  const { dcName, roomName } = useParams<{ dcName?: string; roomName?: string }>();
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter-table");
  const [currentDCName, setCurrentDCName] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const { user } = useUser();

  const LoadItems = useCallback(() => {
    if (roomName) {
      setCurrentView("rack-table");
      setCurrentRoomName(roomName);
      getRoom(roomName)
        .then((room) => {
          setCurrentDCName(room.dc_name);
        })
        .catch((e: APIError) => {
          console.error(e);
          toast.error(e.error);
          setCurrentDCName(null);
        });
    } else if (dcName) {
      setCurrentView("room-table");
      setCurrentDCName(dcName);
      setCurrentRoomName(null);
    } else {
      setCurrentView("datacenter-table");
      setCurrentDCName(null);
      setCurrentRoomName(null);
    }
  }, [dcName, roomName]);

  // 根據 URL 參數加載數據
  useEffect(() => {
    if (user) {
      LoadItems();
    }
  }, [LoadItems, user]);

  if (!user) {
    return <FallbackView text="請登入以瀏覽此頁面。" />;
  }

  // if (user.role !== "admin") {
  //   return <FallbackView text="您沒有權限訪問此頁面。" />;
  // }

  const handleBreadcrumbClick = (level: ViewLevel) => {
    if (level === "datacenter-table") {
      navigate("/overview");
    } else if (level === "room-table" && currentDCName) {
      navigate(`/overview/dc/${currentDCName}`);
    } else if (level === "rack-table" && currentRoomName) {
      navigate(`/overview/room/${currentRoomName}`);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mt-5 ml-8 flex items-center justify-between p-4">
        <Breadcrumb
          currentView={currentView}
          dcName={currentDCName}
          roomName={currentRoomName}
          onNavigate={handleBreadcrumbClick}
        />
      </div>

      <div className="flex-1 px-12">
        <Outlet
          context={{ dcName: currentDCName, roomName: currentRoomName, onSelect: navigate }}
        />
      </div>
    </div>
  );
}

import type React from "react";
import Sidebar from "@/components/sidebar";
import { useMediaQuery } from "react-responsive";
import { TopBar } from "./components/topbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      {isMobile ? <TopBar /> : <Sidebar />}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

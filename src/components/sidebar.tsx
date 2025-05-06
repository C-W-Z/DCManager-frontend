import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useResolvedPath } from "react-router-dom";
import Icon from "@/components/icon";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = useResolvedPath("").pathname;

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col gap-4 border-r bg-gray-50 py-4 transition-all duration-300",
        collapsed ? "w-16 px-2" : "w-60 px-4",
      )}
    >
      <div
        className={cn(
          "border-b4bg-gray-100 flex h-16 items-center",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <div
          className={cn(
            "overflow-clip text-xl font-bold transition-all duration-300",
            collapsed ? "w-0" : "w-full",
          )}
        >
          DCManager
        </div>
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Icon id="sidebar-close" /> : <Icon id="sidebar-open" />}
        </button>
      </div>
      <SidebarItem
        iconId="home"
        label="Home"
        collapsed={collapsed}
        href="/"
        active={currentPath === "/"}
      />
      <SidebarItem
        iconId="explorer"
        label="Explorer"
        collapsed={collapsed}
        href="/explorer"
        active={currentPath === "/explorer"}
      />
      <SidebarItem iconId="host" label="Hosts" collapsed={collapsed} />
      <SidebarItem iconId="service" label="Services" collapsed={collapsed} />
      <div className="flex-1"></div>
      <SidebarItem iconId="settings" label="Setting" collapsed={collapsed} />
    </div>
  );
}

interface SidebarItemProps {
  iconId: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  href?: string;
}

function SidebarItem({ iconId, label, active, collapsed, href }: SidebarItemProps) {
  return (
    <Link
      to={href || "#"}
      className={cn(
        "flex h-fit items-center rounded-2xl p-2",
        collapsed ? "justify-center" : "justify-start gap-4",
        active ? "bg-gray-200" : "hover:bg-gray-100",
      )}
    >
      <Icon id={iconId} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

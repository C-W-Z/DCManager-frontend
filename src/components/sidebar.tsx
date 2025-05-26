import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useResolvedPath } from "react-router-dom";
import Icon from "@/components/icon";
import { useUser } from "@/context/use-user";
import { CircleUserRound } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useUser();

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
        iconId="overview"
        label="物件總覽"
        collapsed={collapsed}
        href="/overview"
        active={currentPath === "/overview"}
      />
      <SidebarItem
        iconId="host"
        label="主機管理"
        collapsed={collapsed}
        href="/host"
        active={currentPath === "/host"}
      />
      <SidebarItem
        iconId="service"
        label="服務管理"
        collapsed={collapsed}
        href="/service"
        active={currentPath === "/service"}
      />
      <div className="flex-1"></div>
      {user && (
        <SidebarItem label={user.username} collapsed={collapsed}>
          <CircleUserRound />
        </SidebarItem>
      )}
      <SidebarItem
        iconId="logout"
        label="Logout"
        collapsed={collapsed}
        href="/"
        active={currentPath === "/"}
        onClick={logout}
      />
      {/* <SidebarItem iconId="settings" label="Setting" collapsed={collapsed} /> */}
    </div>
  );
}

interface SidebarItemProps {
  iconId?: string;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  href?: string;
  children?: ReactNode;
  onClick?: React.MouseEventHandler;
}

function SidebarItem({
  iconId,
  label,
  active,
  collapsed,
  href,
  children,
  onClick,
}: SidebarItemProps) {
  return (
    <Link
      to={href || "#"}
      className={cn(
        "flex h-fit items-center rounded-2xl p-2",
        collapsed ? "justify-center" : "justify-start gap-4",
        active ? "bg-gray-200" : "hover:bg-gray-100",
      )}
      onClick={onClick}
    >
      {iconId && <Icon id={iconId} />}
      {children}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

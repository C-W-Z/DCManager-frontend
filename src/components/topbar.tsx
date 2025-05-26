import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/icon";
import { Link } from "react-router-dom";
import { useUser } from "@/context/use-user";

export function TopBar() {
  const { logout } = useUser();

  return (
    <div className="flex w-full items-center justify-between border-b bg-white p-4 shadow-sm">
      <span className="text-lg font-semibold">DCManager</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <Icon id="menu" className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link to="/overview" className="flex items-center gap-2">
                <Icon id="overview" className="size-4" />
                物件總覽
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/host" className="flex items-center gap-2">
                <Icon id="host" className="size-4" />
                主機管理
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/service" className="flex items-center gap-2">
                <Icon id="service" className="size-4" />
                服務管理
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link to="/" className="flex items-center gap-2" onClick={logout}>
              <Icon id="logout" className="size-4" />
              登出
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

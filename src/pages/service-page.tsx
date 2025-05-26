import { getService } from "@/lib/api";
import { Service, SimpleRack, Host, APIError } from "@/lib/type";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/icon";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EditServiceDialog } from "../components/dialogs/edit-service-dialog";
import { useUser } from "@/context/use-user";
import { LoadingView } from "@/components/loading-view";
import { FallbackView } from "@/components/fallback-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteServiceDialog } from "@/components/dialogs/delete-service-dialog";
import {
  CRITICAL_AVAILABLE_IP_PERCENT,
  CRITICAL_AVAILABLE_RACK_POS_PERCENT,
} from "@/lib/constant";

export function ServicePage() {
  const serviceName = useParams().serviceName as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const LoadService = useCallback((serviceName: string) => {
    setLoading(true);

    getService(serviceName)
      .then((service) => {
        setService(service);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setService(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    LoadService(serviceName);
  }, [LoadService, serviceName]);

  if (!user) {
    return <FallbackView text={"請登入以瀏覽此頁面。"} link="/" />;
  }

  if (loading) {
    return <LoadingView text="Loading service..." />;
  }

  if (!service) {
    return <FallbackView text={`Service: ${serviceName} not found.`} />;
  }

  if (user.username !== service.username && user.role !== "admin") {
    return <FallbackView text={`你沒有權限瀏覽 ${service.name}`} />;
  }

  const total_ip = service.total_ip_list.length;
  const available_ip = service.available_ip_list.length;

  const used_rack_pos = service.hosts.reduce((sum, host) => sum + host.height, 0);
  const total_rack_heights = Object.values(service.allocated_racks).reduce(
    (sum, racks) => sum + racks.reduce((sum, rack) => sum + rack.height, 0),
    0,
  );

  return (
    <div className="flex h-screen w-full flex-col items-start justify-between px-20 pt-12">
      <div className="mb-4 flex flex-row items-center gap-2">
        <Icon id="service" className="size-8" />
        <div className="text-2xl font-bold">{service.name}</div>
      </div>
      <div className="mb-4 grid w-full grid-cols-12 gap-2 p-2">
        <div className="col-span-2">
          <label className="text-sm text-gray-500">已上架機器數量</label>
          <p>{service.hosts.length}</p>
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-500">已使用櫃位空間</label>
          <p
            className={cn(
              total_rack_heights - used_rack_pos <=
                total_rack_heights * CRITICAL_AVAILABLE_RACK_POS_PERCENT
                ? "text-red-500"
                : "",
            )}
          >
            {used_rack_pos} / {total_rack_heights}
          </p>
        </div>

        <div className="item-center col-span-8 flex justify-end gap-8">
          <Link to={`/bulk-add-host/${service.name}`} className="h-fit pr-2">
            <Button className="flex h-fit w-fit flex-row items-center justify-start gap-3 text-sm font-bold">
              <Plus />
              批量新增主機
            </Button>
          </Link>
          <EditServiceDialog service={service} />
          <DeleteServiceDialog
            serviceName={service.name}
            onSuccess={() => navigate(`/service`)}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm text-gray-500">已使用 IP 數量</label>
          <p
            className={cn(
              available_ip <= total_ip * CRITICAL_AVAILABLE_IP_PERCENT ? "text-red-500" : "",
            )}
          >
            {total_ip - available_ip} / {total_ip}
          </p>
        </div>
        <div className="col-span-10">
          <label className="text-sm text-gray-500">已分配網段</label>
          <div className="flex overflow-x-auto">
            {service.allocated_subnets.length > 0 ? (
              service.allocated_subnets.map((subnet) => <p className="mr-1">{subnet}</p>)
            ) : (
              <p>"無"</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-[1fr_2fr_2fr_2fr] gap-4">
        <div className="translate-x-2 text-sm text-gray-500">Datacenter</div>
        <div className="translate-x-2 text-sm text-gray-500">Rack</div>
        <div className="text-sm text-gray-500">Host</div>
        <div className="text-sm text-gray-500">IP</div>
      </div>
      <div className="my-2 h-[2px] w-full bg-gray-200" />
      <div className="mb-4 flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll">
        {Object.entries(service.allocated_racks).map(([dc_name, racks]) => (
          <DCBlock
            key={dc_name}
            dc_name={dc_name}
            racks={racks}
            hosts={service.hosts.filter((host) => host.dc_name === dc_name)}
          />
        ))}
      </div>
    </div>
  );
}

function DCBlock({
  dc_name,
  racks,
  hosts,
}: {
  dc_name: string;
  racks: SimpleRack[];
  hosts: Host[];
}) {
  return (
    <div className="mb-4 grid h-fit w-full grid-cols-[1fr_6fr] items-start gap-2 p-2">
      <div className="py-1 text-base font-bold">{dc_name}</div>
      <div className="flex flex-col gap-2">
        {racks.map((rack) => {
          return (
            <RackBlock
              key={rack.name}
              rack={rack}
              hosts={hosts.filter((host) => host.rack_name === rack.name)}
            />
          );
        })}
      </div>
    </div>
  );
}

function RackBlock({ rack, hosts }: { rack: SimpleRack; hosts: Host[] }) {
  return (
    <div className="mb-4 grid h-fit w-full grid-cols-3 items-start gap-4 p-2 hover:bg-gray-100">
      <Link
        to={`/rack/${rack.name}`}
        className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-600"
      >
        {rack.name}
        <Icon id="open-new" className="size-4" />
      </Link>
      <div className="flex translate-x-2 flex-col gap-2">
        {hosts.map((host) => {
          return (
            <Link
              key={host.name}
              to={`/host/${host.name}`}
              className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-600"
            >
              <div
                className={cn(
                  "mr-2 h-3 w-3 rounded-full",
                  host.running ? "bg-green-600" : "bg-red-400",
                )}
              ></div>
              {host.name}
              <Icon id="open-new" className="size-4" />
            </Link>
          );
        })}
      </div>
      <div className="flex translate-x-4 flex-col gap-2">
        {hosts.map((host) => {
          return (
            <div key={host.name} className="text-sm text-gray-500">
              {host.ip ? host.ip : "無"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

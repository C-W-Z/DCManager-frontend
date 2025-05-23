import { getService } from "@/lib/api";
import { Service, SimpleRack, Host } from "@/lib/type";
import { useEffect, useState, useCallback } from "react";
import { Separator } from "../infocard";
import { useParams } from "react-router-dom";
import Icon from "@/components/icon";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EditServiceDialog } from "./edit-service";
import { useUser } from "@/context/use-user";
import { LoadingView } from "../loading-view";
import { FallbackView } from "../fallback-view";

export default function ServiceView() {
  const serviceId = useParams().serviceId as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const LoadService = useCallback((serviceId: string) => {
    setLoading(true);

    getService(serviceId)
      .then((service) => {
        setService(service);
      })
      .catch((error) => {
        console.error("Error fetching service data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    LoadService(serviceId);
  }, [LoadService, serviceId]);

  if (!user) {
    return <FallbackView text={"請登入以瀏覽此頁面。"} />;
  }

  if (loading || !service) {
    return <LoadingView text="Loading service..." />;
  }

  if (user.username !== service.username) {
    return <FallbackView text={"你沒有權限瀏覽此頁面。"} />;
  }

  const total_ip = service.total_ip_list.length;
  const available_ip = service.available_ip_list.length;

  if (!service) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-xl font-bold">Service ID: {serviceId} not found :(</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-start justify-between px-20 pt-12">
      <div className="mb-4 flex flex-row items-center gap-2">
        <Icon id="service" className="size-8" />
        <div className="text-2xl font-bold">{service.name}</div>
      </div>
      <div className="mb-8 flex w-full flex-row items-center gap-8 p-2">
        <div>
          <label className="text-sm text-gray-500">已上架機器數量</label>
          <p>{service.hosts.length}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">已使用 IP 數量</label>
          <p className={cn(available_ip <= 2 ? "text-red-500" : "")}>
            {total_ip - available_ip} / {total_ip}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500">已分配網段</label>
          <p>
            {service.allocated_subnets.length > 0
              ? service.allocated_subnets.join(", ")
              : "無"}
          </p>
        </div>
        <div className="flex-1"></div>
        <EditServiceDialog service={service} />
      </div>

      <div className="grid w-full grid-cols-[1fr_2fr_2fr_2fr] gap-4">
        <div className="translate-x-2 text-sm text-gray-500">Datacenter</div>
        <div className="translate-x-2 text-sm text-gray-500">Rack</div>
        <div className="text-sm text-gray-500">Host</div>
        <div className="text-sm text-gray-500">IP</div>
      </div>
      <Separator />
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
              {host.ip}
            </div>
          );
        })}
      </div>
    </div>
  );
}

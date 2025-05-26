import { APIError, SimpleService } from "@/lib/type";
import { getAllService, getUserService } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AddServiceDialog } from "../components/dialogs/add-service-dialog";
import { useUser } from "@/context/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshButton } from "@/components/refresh-button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import Icon from "@/components/icon";
import { LoadingView } from "@/components/loading-view";
import { FallbackView } from "@/components/fallback-view";
import { toast } from "sonner";
import { CRITICAL_AVAILABLE_IP_PERCENT } from "@/lib/constant";

export function ServiceBoardPage() {
  const [services, setServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, setAccessableService } = useUser();

  const LoadService = useCallback(() => {
    if (!user) return;

    setLoading(true);

    if (user.role === "admin") {
      getAllService()
        .then((serviceList) => {
          setServices(serviceList);
          setAccessableService(serviceList.map((service) => service.name));
        })
        .catch((e: APIError) => {
          console.error(e);
          toast.error(e.error)
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      getUserService(user.username)
        .then((serviceList) => {
          setServices(serviceList);
          setAccessableService(serviceList.map((service) => service.name));
        })
        .catch((e: APIError) => {
          console.error(e);
          toast.error(e.error)
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [setAccessableService, user]);

  useEffect(() => {
    LoadService();
  }, [LoadService]);

  if (!user) {
    return <FallbackView text={"請登入以瀏覽此頁面。"} />;
  }

  if (loading) {
    return <LoadingView text="Loading services..." />;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-12">
      <div className="flex flex-row items-start justify-between">
        <div className="mb-4 flex flex-row items-center gap-2">
          <Icon id="service" className="size-8" />
          <div className="text-2xl font-bold">服務管理</div>
        </div>
        <div>
          <div className="flex flex-row justify-end gap-4">
            <RefreshButton isLoading={loading} onClick={() => LoadService()} />
            <AddServiceDialog onSuccess={() => LoadService()} />
          </div>
        </div>
      </div>
      {services.length === 0 ? (
        <div>
          <h1 className="text-lg font-semibold">No services found.</h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              displayUsername={user.role === "admin"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  displayUsername,
}: {
  service: SimpleService;
  displayUsername?: boolean;
}) {
  const total_ip = service.total_ip_list.length;
  const available_ip = service.available_ip_list.length;

  return (
    <Card className="w-full bg-white shadow-md hover:bg-gray-50">
      <CardHeader>
        <CardTitle>
          <Link
            to={`/service/${service.name}`}
            className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-600"
          >
            {service.name}
            <Icon id="open-new" className="size-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <label className="text-sm text-gray-500">已上架機器數量</label>
          <p>{service.n_hosts}</p>
        </div>
        <div className="col-span-5">
          <label className="text-sm text-gray-500">已使用 IP 數量</label>
          <p className={cn(available_ip <= total_ip * CRITICAL_AVAILABLE_IP_PERCENT ? "text-red-500" : "")}>
            {total_ip - available_ip} / {total_ip}
          </p>
        </div>
        <div className="col-span-7">
          <label className="text-sm text-gray-500">已分配機櫃</label>
          {Object.entries(service.n_allocated_racks).map(([dc_name, n_racks], index) => (
            <p key={index}>
              {dc_name} ({n_racks})
            </p>
          ))}
        </div>
        {displayUsername && (
          <div className="col-span-5">
            <label className="text-sm text-gray-500">上架使用者</label>
            <p>{service.username}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

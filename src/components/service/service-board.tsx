import { SimpleService } from "@/lib/type";
import { getUserService } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AddServiceDialog } from "./add-service-dialog";
import { useUser } from "@/context/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/loading-button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import Icon from "@/components/icon";
import { LoadingView } from "../loading-view";

export default function ServiceBoard() {
  const [services, setServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const LoadService = useCallback((username: string) => {
    setLoading(true);

    getUserService(username)
      .then((serviceList) => {
        setServices(serviceList);
      })
      .catch((error) => {
        console.error("Error fetching all service data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    LoadService(user.username);
  }, [LoadService, user]);

  if (!user) {
    return <div className="text-lg font-semibold">Please log in to view services.</div>;
  }

  if (loading) {
    return <LoadingView text="Loading services..." />;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-12">
      <div className="text-2xl font-bold">Your Services</div>
      <div className="flex flex-row justify-end gap-4">
        <LoadingButton isLoading={loading} onClick={() => LoadService(user.username)}>
          Refresh
        </LoadingButton>
        <AddServiceDialog />
      </div>
      {services.length === 0 ? (
        <div>
          <h1 className="text-lg font-semibold">No services found.</h1>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service }: { service: SimpleService }) {
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
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">已上架機器數量</label>
          <p>{service.n_hosts}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">已使用 IP 數量</label>
          <p className={cn(available_ip <= 2 ? "text-red-500" : "")}>
            {total_ip - available_ip} / {total_ip}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500">已分配機櫃</label>
          {Object.entries(service.n_allocated_racks).map(([dc_name, n_racks]) => (
            <p>
              {dc_name} ({n_racks})
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { getRack, getService } from "@/lib/api";
import { Service, Rack } from "@/lib/type";
import { useEffect, useState } from "react";
import { InfoCard, CardColumn, Separator } from "../infocard";
import { useParams } from "react-router-dom";
import Icon from "@/components/icon";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ServiceView() {
  const serviceId = useParams().serviceId as string;
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    getService(serviceId)
      .then((service) => {
        setService(service);
      })
      .catch((error) => {
        console.error("Error fetching service data:", error);
        setService(null);
      });
  }, [serviceId]);

  return (
    <>
      {service ? (
        <div className="flex h-screen w-full flex-col items-start justify-between px-20 pt-12">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="service" className="size-8" />
            <div className="text-2xl font-bold">{service.name}</div>
          </div>
          <InfoCard>
            <>
              <CardColumn label="UUID" data={service.id} />
              <CardColumn label="n_hosts" data={`${service.n_hosts}`} />
              <CardColumn label="n_racks" data={`${service.n_racks}`} />
              <CardColumn label="total ip" data={`${service.total_ip}`} />
              <div className="mt-4 flex flex-row items-center justify-center gap-8"></div>
            </>
          </InfoCard>
          <div className="grid w-full grid-cols-4 gap-4">
            <div className="text-sm text-gray-500">Racks</div>
            <div className="text-sm text-gray-500">Hosts</div>
            <div className="text-sm text-gray-500">IP</div>
          </div>
          <Separator />
          <div className="mb-4 flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll">
            {service.racks.map((rack) => {
              return <RackBlock key={rack.id} rackId={rack.id} />;
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-xl font-bold">Service ID: {serviceId} not found :(</div>
        </div>
      )}
    </>
  );
}

function RackBlock({ rackId }: { rackId: string }) {
  const [rack, setRack] = useState<Rack | null>(null);

  useEffect(() => {
    getRack(rackId)
      .then((rack) => {
        setRack(rack);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setRack(null);
      });
  }, [rackId]);

  if (!rack) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="mb-4 grid h-fit w-full grid-cols-4 items-start gap-4 p-2 hover:bg-gray-100">
      <Link
        to={`/rack/${rack.id}`}
        className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-500"
      >
        {rack.name}
        <Icon id="open-new" className="size-4" />
      </Link>
      <div className="flex translate-x-2 flex-col gap-2">
        {rack.hosts.map((host) => {
          return (
            <Link
              key={host.id}
              to={`/host/${host.id}`}
              className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-500"
            >
              <div
                className={cn(
                  "mr-2 h-3 w-3 rounded-full",
                  host.status === "running"
                    ? "bg-green-600"
                    : host.status === "idle"
                      ? "bg-gray-400"
                      : "bg-red-400",
                )}
              ></div>
              {host.name}
              <Icon id="open-new" className="size-4" />
            </Link>
          );
        })}
      </div>
      <div className="flex translate-x-4 flex-col gap-2">
        {rack.hosts.map((host) => {
          return (
            <div key={host.id} className="text-sm text-gray-500">
              {host.ip}
            </div>
          );
        })}
      </div>
    </div>
  );
}

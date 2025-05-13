import { getService } from "@/lib/api";
import { Service } from "@/lib/type";
import { useEffect, useState } from "react";
import { InfoCard, CardColumn, Separator } from "../infocard";
import { useParams } from "react-router-dom";
import Icon from "@/components/icon";
import { Link } from "react-router-dom";

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
        <div className="flex h-fit w-full flex-col items-start justify-between px-20 pt-12">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="service" className="size-8" />
            <div className="text-2xl font-bold">{service.name}</div>
          </div>
          <div className="flex h-fit w-full flex-row items-start justify-start gap-20">
            <InfoCard>
              <>
                <Separator />
                <CardColumn label="UUID" data={service.id} />
                <CardColumn label="n_hosts" data={`${service.n_hosts}`} />
                <CardColumn label="n_racks" data={`${service.n_racks}`} />
                <div className="mt-4 flex flex-row items-center justify-center gap-8"></div>
              </>
            </InfoCard>
            <div className="flex h-fit flex-1 flex-col items-start justify-start gap-2">
              <div className="text-sm text-gray-500">Racks</div>
              {service.racks.map((rack) => {
                return (
                  <Link
                    to={`/rack/${rack.id}`}
                    className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-500"
                  >
                    {rack.name}
                    <Icon id="open-new" className="size-4" />
                  </Link>
                );
              })}
            </div>
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

import { SimpleService } from "@/lib/type";
import { getUserService } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AddServiceDialog } from "./add-service-dialog";
import { useUser } from "@/context/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="flex h-full w-full flex-col px-12 pt-12">
      <button
        onClick={() => LoadService(user.username)}
        className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        disabled={loading}
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
      <AddServiceDialog />
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}

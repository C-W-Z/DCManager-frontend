import React, { useState, useEffect, useCallback } from "react";
import { getService, addHost } from "@/lib/api";
import { Service, simple_rack_schema } from "@/lib/type";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { z } from "zod";
import { LoadingView } from "./loading-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useParams } from "react-router-dom";

interface CsvRow {
  room_name: string;
  new_host_name: string;
  height: string;
  position: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const rackWithDC_schema = simple_rack_schema.extend({
  dc_name: z.string(),
});
export type RackWithDC = z.infer<typeof rackWithDC_schema>;

export default function AddHosts() {
  const serviceName = useParams().serviceId as string;

  const [racks, setRacks] = useState<RackWithDC[]>([]);
  const [availablePositions, setAvailablePositions] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reusable function to refresh racks and positions
  const refreshRacks = useCallback(async () => {
    setLoading(true);
    try {
      const service: Service = await getService(serviceName);
      const allRacks: Array<RackWithDC> = [];
      const positions: Record<string, number[]> = {};

      // Aggregate racks from all datacenters
      Object.entries(service.allocated_racks).forEach(([dc_name, rackList]) => {
        allRacks.push(
          ...rackList.map((r) => ({
            ...r,
            dc_name: dc_name,
          })),
        );
      });

      // Calculate available positions for each rack
      allRacks.forEach((rack) => {
        const occupiedPositions = service.hosts
          .filter((host) => host.rack_name === rack.name)
          .flatMap((host) => Array.from({ length: host.height }, (_, i) => host.pos + i));
        const allPositions = Array.from({ length: rack.capacity }, (_, i) => i + 1);
        positions[rack.name] = allPositions.filter((pos) => !occupiedPositions.includes(pos));
      });

      setRacks(allRacks);
      setAvailablePositions(positions);
    } catch (error) {
      setError(`Failed to fetch service racks: ${error}`);
    } finally {
      setLoading(false);
    }
  }, [serviceName]);

  // Fetch service racks on mount
  useEffect(() => {
    refreshRacks();
  }, [refreshRacks]);

  // Download CSV template
  const downloadTemplate = () => {
    const csvData: CsvRow[] = [];
    racks.forEach((rack) => {
      const positions = availablePositions[rack.name] || [];
      positions.forEach((pos) => {
        csvData.push({
          room_name: rack.room_name,
          new_host_name: "",
          height: "1",
          position: pos.toString(),
        });
      });
    });

    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ["room_name", "new_host_name", "height", "position"],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${serviceName}_host_template.csv`);
  };

  // Handle CSV upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          for (const row of result.data) {
            const { room_name, new_host_name, height, position } = row;
            const rack = racks.find(
              (r) =>
                r.room_name === room_name &&
                availablePositions[r.name]?.includes(parseInt(position)),
            );

            if (!rack) {
              throw new Error(
                `Invalid rack or position for room: ${room_name}, position: ${position}`,
              );
            }

            if (new_host_name.length === 0) {
              throw new Error(`Some new host name is empty`);
            }

            console.log({
              name: new_host_name,
              height: parseInt(height),
              rack_name: rack.name,
              pos: parseInt(position),
            });

            await addHost({
              name: new_host_name,
              height: parseInt(height),
              rack_name: rack.name,
              pos: parseInt(position),
            });
          }
          setSuccess("Hosts added successfully");
          await refreshRacks();
        } catch (err) {
          setError("Failed to add hosts: " + (err as Error).message);
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
        setLoading(false);
      },
    });
  };

  return (
    <div className="m-12">
      <h1 className="mb-4 text-2xl font-bold">Bulk Host Addition for Service {serviceName}</h1>
      <div className="w-full">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="mb-4 border-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex gap-4">
          <Button
            onClick={downloadTemplate}
            disabled={loading || racks.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            Download CSV Template
          </Button>
          <div className="self-center">
            Upload CSV:
          </div>
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="hover:cursor-pointer"
            />
          </div>
        </div>

        {loading ? (
          <LoadingView text="Loading..." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datacenter</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Available Positions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {racks.map((rack) => (
                <TableRow key={rack.name}>
                  <TableCell>{rack.dc_name}</TableCell>
                  <TableCell>{rack.room_name}</TableCell>
                  <TableCell>{rack.name}</TableCell>
                  <TableCell>{(availablePositions[rack.name] || []).join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { getService, addHost } from "@/lib/api";
import { Service, simple_rack_schema } from "@/lib/type";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { z } from "zod";
import { LoadingView } from "./loading-view";
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
          await refreshRacks(); // Reuse the refresh function
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
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Bulk Host Addition for {serviceName}</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}

      <div className="mb-4">
        <button
          onClick={downloadTemplate}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading || racks.length === 0}
        >
          Download CSV Template
        </button>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="ml-4"
          disabled={loading}
        />
      </div>

      {loading ? (
        <LoadingView text="Loading..."/>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Datacenter</th>
              <th className="border p-2">Room</th>
              <th className="border p-2">Rack</th>
              <th className="border p-2">Available Positions</th>
            </tr>
          </thead>
          <tbody>
            {racks.map((rack) => (
              <tr key={rack.name}>
                <td className="border p-2">{rack.dc_name}</td>
                <td className="border p-2">{rack.room_name}</td>
                <td className="border p-2">{rack.name}</td>
                <td className="border p-2">
                  {(availablePositions[rack.name] || []).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

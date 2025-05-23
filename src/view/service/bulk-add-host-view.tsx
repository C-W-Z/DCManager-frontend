import React, { useState, useEffect, useCallback } from "react";
import { getService, addHost } from "@/lib/api";
import { Service, simple_rack_schema } from "@/lib/type";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { z } from "zod";
import { LoadingView } from "../../components/loading-view";
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
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useParams } from "react-router-dom";

interface CsvRow {
  rack_name: string;
  new_host_name: string;
  height: string;
  position: string;
}

interface PreviewRow extends CsvRow {
  status: "Pending" | "Added" | "Failed";
  error?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const rackWithDC_schema = simple_rack_schema.extend({
  dc_name: z.string(),
});
export type RackWithDC = z.infer<typeof rackWithDC_schema>;

export default function BulkAddHostView() {
  const serviceName = useParams().serviceId as string;

  const [racks, setRacks] = useState<RackWithDC[]>([]);
  const [availablePositions, setAvailablePositions] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

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
          rack_name: rack.name,
          new_host_name: "",
          height: "1",
          position: pos.toString(),
        });
      });
    });

    const csv = Papa.unparse(csvData, {
      header: true,
      columns: ["rack_name", "new_host_name", "height", "position"],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${serviceName}_host_template.csv`);
  };

  // Handle CSV upload and preview
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsPreviewVisible(false);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data.map(
          (row) =>
            ({
              ...row,
              status: "Pending",
            }) as PreviewRow,
        );

        // Validate rows
        const isValid = parsedData.every((row) => {
          const rack = racks.find(
            (r) =>
              r.name === row.rack_name &&
              availablePositions[r.name]?.includes(parseInt(row.position)),
          );
          const isHeightValid = !isNaN(parseInt(row.height)) && parseInt(row.height) > 0;
          const isPositionValid = !isNaN(parseInt(row.position));
          const isHostNameValid = row.new_host_name.length > 0;

          if (!rack) {
            row.status = "Failed";
            row.error = `Invalid rack or position, room: ${row.rack_name}, position: ${row.position}`;
            return false;
          }
          if (!isHostNameValid) {
            row.status = "Failed";
            row.error = "Host name cannot be empty";
            return false;
          }
          if (!isHeightValid) {
            row.status = "Failed";
            row.error = "Height must be a positive number";
            return false;
          }
          if (!isPositionValid) {
            row.status = "Failed";
            row.error = "Position must be a valid number";
            return false;
          }
          return true;
        });

        if (!isValid) {
          setError("Some rows in the CSV are invalid. Please review the preview.");
        }

        setPreviewData(parsedData);
        setIsPreviewVisible(true);
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
      },
    });
  };

  // Handle adding hosts from preview
  const handleAddHosts = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let updatedPreviewData = [...previewData]; // Create a local copy to track updates

      for (let i = 0; i < updatedPreviewData.length; i++) {
        const row = updatedPreviewData[i];
        if (row.status !== "Pending") continue; // Skip already processed rows

        // console.log("Processing row", i, row);

        try {
          const rack = racks.find(
            (r) =>
              r.name === row.rack_name &&
              availablePositions[r.name]?.includes(parseInt(row.position)),
          );

          if (!rack) {
            throw new Error(
              `Invalid rack or position, rack: ${row.rack_name}, position: ${row.position}`,
            );
          }

          await addHost({
            name: row.new_host_name,
            height: parseInt(row.height),
            rack_name: rack.name,
            pos: parseInt(row.position),
          });

          // Update the local copy
          updatedPreviewData = updatedPreviewData.map((r, index) =>
            index === i ? { ...r, status: "Added" as const } : r,
          );
          setPreviewData(updatedPreviewData);
          // console.log("Added row", i, updatedPreviewData[i]);
        } catch (err) {
          // Update the local copy on error
          updatedPreviewData = updatedPreviewData.map((r, index) =>
            index === i
              ? { ...r, status: "Failed" as const, error: (err as Error).message }
              : r,
          );
          setPreviewData(updatedPreviewData);
          // console.log("Failed row", i, updatedPreviewData[i]);
        }
      }

      const allSuccessful = updatedPreviewData.every((row) => row.status === "Added");
      if (allSuccessful) {
        setSuccess("All hosts added successfully");
        setIsPreviewVisible(false);
        setPreviewData([]);
      } else {
        setError("Some hosts failed to add. Please review the preview.");
      }

      await refreshRacks();
    } catch (err) {
      setError("Failed to process hosts: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-12">
      <h1 className="mb-4 text-2xl font-bold">
        Bulk Host Addition for Service: {serviceName}
      </h1>
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

        <div className="mb-6 flex items-center gap-4">
          <Button
            onClick={downloadTemplate}
            disabled={loading || racks.length === 0}
            className="bg-primary hover:bg-primary/90"
          >
            Download CSV Template
          </Button>
          <div>Upload CSV:</div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
            className="w-auto hover:cursor-pointer"
          />
          {isPreviewVisible && (
            <Button
              onClick={handleAddHosts}
              disabled={loading || previewData.some((row) => row.status !== "Pending")}
              className="bg-green-500 hover:bg-green-600"
            >
              Start Adding Hosts
            </Button>
          )}
        </div>

        {isPreviewVisible && (
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">CSV Preview</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rack</TableHead>
                  <TableHead>New Host Name</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.rack_name}</TableCell>
                    <TableCell>{row.new_host_name}</TableCell>
                    <TableCell>{row.height}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {row.status === "Pending" && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span>Pending</span>
                        </>
                      )}
                      {row.status === "Added" && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Added</span>
                        </>
                      )}
                      {row.status === "Failed" && (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>Failed: {row.error}</span>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

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

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { APIError, Service, simple_service_schema, SimpleDatacenter } from "@/lib/type";
import { toast } from "sonner";
import { getAllDC, modifyService } from "@/lib/api";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import { DataCenterSelect } from "../select-datacenter";
import ErrorAlert from "../error-alert";

// Update form_schema to make allocated_subnet a string array
const form_schema = z.object({
  name: simple_service_schema.shape.name,
  allocated_subnet: z.string().min(1, "IP Subnet is required").array(),
});

type RackAllocation = {
  dc_name: string;
  n_racks: number;
  isOriginal?: boolean;
  originalN_racks?: number;
};

interface EditServiceDialogProps {
  service: Service;
  onUpdateSuccess?: () => void;
}

export function EditServiceDialog({ service, onUpdateSuccess }: EditServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [allocatedRacks, setAllocatedRacks] = useState<RackAllocation[]>([]);
  const [allocatedSubnets, setAllocatedSubnets] = useState<
    { value: string; isOriginal: boolean }[]
  >([]);
  const [hasEmptyAllocatedRacks, setHasEmptyAllocatedRacks] = useState(false);
  const [hasEmptyAllocatedSubnets, setHasEmptyAllocatedSubnets] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: service.name,
      allocated_subnet: service.allocated_subnets || [""],
    },
  });

  // Initialize state when dialog opens
  useEffect(() => {
    if (open) {
      // Set allocated subnets with isOriginal flag
      const subnets = (service.allocated_subnets || []).map((value) => ({
        value,
        isOriginal: true,
      }));
      setAllocatedSubnets(subnets.length > 0 ? subnets : [{ value: "", isOriginal: false }]);
      form.setValue(
        "allocated_subnet",
        subnets.length > 0 ? subnets.map((s) => s.value) : [""],
      );

      // Convert allocated_racks record to RackAllocation array with original metadata
      const racks = Object.entries(service.allocated_racks || {}).map(([dc_name, racks]) => ({
        dc_name,
        n_racks: racks.length,
        isOriginal: true,
        originalN_racks: racks.length,
      }));
      setAllocatedRacks(
        racks.length > 0 ? racks : [{ dc_name: "", n_racks: 1, isOriginal: false }],
      );

      // Fetch data centers
      setLoading(true);
      getAllDC()
        .then((data) => {
          setDataCenters(data);
        })
        .catch((error) => {
          console.error("Failed to fetch data centers:", error);
          toast.error("Failed to load data centers");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset state when dialog closes
      form.reset({
        name: service.name,
        allocated_subnet: service.allocated_subnets || [""],
      });
      setAllocatedRacks([]);
      setAllocatedSubnets([]);
      setErrorMessage(null);
    }
  }, [open, service, form]);

  // Validate allocated racks and subnets for empty fields
  useEffect(() => {
    const hasEmptyRacks = allocatedRacks.some(
      (rack) => !rack.dc_name.trim() || rack.n_racks <= 0,
    );
    setHasEmptyAllocatedRacks(hasEmptyRacks);
    if (hasEmptyRacks) {
      setErrorMessage("Please choose all DC names or delete the blanks");
    }

    const hasEmptySubnets = allocatedSubnets.some((subnet) => !subnet.value.trim());
    setHasEmptyAllocatedSubnets(hasEmptySubnets);

    if (hasEmptySubnets) {
      setErrorMessage("Please fill in all IP Subnets or delete the blanks");
    }

  }, [allocatedRacks, allocatedSubnets]);

  const handleAllocatedRacksChange = (
    index: number,
    field: "dc_name" | "n_racks",
    value: string,
  ) => {
    setAllocatedRacks((prev) =>
      prev.map((rack, i) =>
        i === index
          ? {
              ...rack,
              [field]:
                field === "n_racks"
                  ? Math.max(rack.originalN_racks || 1, parseInt(value) || 1)
                  : value,
            }
          : rack,
      ),
    );
    setErrorMessage(null);
  };

  const addAllocatedRacks = () => {
    setAllocatedRacks((prev) => [...prev, { dc_name: "", n_racks: 1, isOriginal: false }]);
    setErrorMessage(null);
  };

  const removeAllocatedRacks = (index: number) => {
    setAllocatedRacks((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const handleAllocatedSubnetChange = (index: number, value: string) => {
    setAllocatedSubnets((prev) =>
      prev.map((subnet, i) => (i === index ? { ...subnet, value } : subnet)),
    );
    setErrorMessage(null);
    // Update form value for validation
    form.setValue(
      "allocated_subnet",
      allocatedSubnets.map((subnet, i) => (i === index ? value : subnet.value)),
    );
  };

  const addAllocatedSubnet = () => {
    setAllocatedSubnets((prev) => [...prev, { value: "", isOriginal: false }]);
    form.setValue("allocated_subnet", [...allocatedSubnets.map((s) => s.value), ""]);
    setErrorMessage(null);
  };

  const removeAllocatedSubnet = (index: number) => {
    setAllocatedSubnets((prev) => prev.filter((_, i) => i !== index));
    form.setValue(
      "allocated_subnet",
      allocatedSubnets.filter((_, i) => i !== index).map((s) => s.value),
    );
    setErrorMessage(null);
  };

  function onSubmit(values: z.infer<typeof form_schema>) {
    setErrorMessage(null);
    const n_allocated_racks = allocatedRacks.reduce(
      (acc, rack) => {
        if (rack.dc_name.trim() && rack.n_racks > 0) {
          acc[rack.dc_name] = rack.n_racks;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    setLoading(true);

    modifyService(service.name, {
      name: values.name,
      n_allocated_racks,
      allocated_subnets: values.allocated_subnet.filter((subnet) => subnet.trim()),
    })
      .then(() => {
        toast.success(`Service ${values.name} updated successfully!`);
        form.reset({
          name: service.name,
          allocated_subnet: service.allocated_subnets || [""],
        });
        setAllocatedRacks([]);
        setAllocatedSubnets([]);
        setOpen(false);
        if (onUpdateSuccess) onUpdateSuccess();
      })
      .catch((e: APIError) => {
        toast.error(e.error);
        console.error(e);
        setErrorMessage(e.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
      modal={false}
    >
      <DialogTrigger asChild>
        <Button className="flex h-fit w-fit flex-row items-center justify-start gap-3 text-sm font-bold">
          <Edit />
          <p className="pr-2">Edit</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>
        {errorMessage && <ErrorAlert error={errorMessage} />}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cloud-Service-A"
                      {...field}
                      value={field.value || ""}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>IP Subnets</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllocatedSubnet}
                  className="h-8"
                  disabled={loading}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Subnet
                </Button>
              </div>
              {allocatedSubnets.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                  No IP Subnet has been set. Click the button above to add one.
                </div>
              ) : (
                <div className="max-h-[240px] space-y-3 overflow-y-auto pr-2">
                  {allocatedSubnets.map((subnet, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`allocated_subnet.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="192.168.1.0/24"
                                  value={subnet.value}
                                  onChange={(e) => {
                                    if (!subnet.isOriginal) {
                                      handleAllocatedSubnetChange(index, e.target.value);
                                      field.onChange(e.target.value);
                                    }
                                  }}
                                  className={subnet.value.trim() ? "" : "border-red-300"}
                                  disabled={loading || subnet.isOriginal}
                                  // readOnly={subnet.isOriginal}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAllocatedSubnet(index)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        disabled={loading || subnet.isOriginal}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Racks in Data Centers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllocatedRacks}
                  className="h-8"
                  disabled={loading}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Data Center
                </Button>
              </div>
              {allocatedRacks.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                  No Data Center has been set. Click the button above to add one.
                </div>
              ) : (
                <div className="max-h-[240px] space-y-3 overflow-y-auto pr-2">
                  {allocatedRacks.map((rack, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <DataCenterSelect
                          dataCenters={dataCenters}
                          value={rack.dc_name}
                          onChange={(value) => {
                            if (!rack.isOriginal) {
                              handleAllocatedRacksChange(index, "dc_name", value);
                            }
                          }}
                          disabled={loading || rack.isOriginal}
                          allocatedRacks={allocatedRacks}
                          index={index}
                        />
                      </div>
                      <div className="flex w-8 items-center justify-center">
                        <span className="text-gray-500">to</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Number of Racks"
                          value={rack.n_racks.toString()}
                          min={rack.isOriginal ? rack.originalN_racks : 1}
                          onChange={(e) =>
                            handleAllocatedRacksChange(index, "n_racks", e.target.value)
                          }
                          className={rack.n_racks > 0 ? "" : "border-red-300"}
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAllocatedRacks(index)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        disabled={loading || rack.isOriginal}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || hasEmptyAllocatedRacks || hasEmptyAllocatedSubnets}
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      {open && (
        <div className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"></div>
      )}
    </Dialog>
  );
}

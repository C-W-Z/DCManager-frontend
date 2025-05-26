import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { host_schema, Host, APIError } from "@/lib/type";
import { modifyHost } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { AlertError } from "../alert-error-success";

interface EditHostDialogProps {
  host: Host | null;
  onUpdateSuccess?: (updatedHost: Host) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const form_schema = host_schema.pick({
  name: true,
});

export function EditHostDialog({ host, onUpdateSuccess }: EditHostDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<z.infer<typeof form_schema>>({
    name: "",
  });

  useEffect(() => {
    if (!host) return;
    setOpen(true);
    setFormData({
      name: host.name,
    });
  }, [host]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!host) return;
    e.preventDefault();
    setError(null);

    modifyHost(host.name, {
      name: formData.name,
    })
      .then(() => {
        const updatedHost: Host = {
          ...host,
          name: formData.name,
        };
        if (onUpdateSuccess) onUpdateSuccess(updatedHost);
        setOpen(false);
        toast.success(`Host ${formData.name} edited successfully`);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setError(e.error);
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Host
          </DialogTitle>
        </DialogHeader>

        {error && <AlertError message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

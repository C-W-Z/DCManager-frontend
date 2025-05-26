import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { deleteService } from "@/lib/api";
import { toast } from "sonner";
import { APIError } from "@/lib/type";
import { Trash2 } from "lucide-react";

export function DeleteServiceDialog({
  serviceName,
  onSuccess,
}: {
  serviceName: string;
  onSuccess: () => void;
}) {
  const handleDelete = () => {
    deleteService(serviceName)
      .then(() => {
        toast.success(`Service ${serviceName} deleted successfully`);
        onSuccess();
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-5 w-5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{`刪除服務 ${serviceName}`}</DialogTitle>
          <DialogDescription>
            <Alert
              variant="destructive"
              className="mt-4 border-red-200 bg-red-50 text-red-800"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                正在被該服務使用的所有機櫃和 IP 將被釋放。 此動作無法復原。
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              是的，刪除服務
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

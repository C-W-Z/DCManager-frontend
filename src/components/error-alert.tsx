import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export default function ErrorAlert({error}: {error: string}) {
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
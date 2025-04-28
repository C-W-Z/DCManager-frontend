import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import RackView from "./pages/RackView.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RackView />
    <Toaster />
  </StrictMode>,
);

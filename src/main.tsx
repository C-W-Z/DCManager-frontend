import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "@/pages/Home";
import { Toaster } from "@/components/ui/sonner";
import "./global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
    <Toaster />
  </StrictMode>,
);

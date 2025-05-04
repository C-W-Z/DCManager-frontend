import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "@/pages/List.tsx";
import "./global.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RackView from "./pages/RackView.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RackView />
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./global.css";

import Home from "@/pages/Home";
import Explorer from "@/pages/explorer";
import RackView from "@/pages/rack-view";
import Layout from "./layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/explorer"
          element={
            <Layout>
              <Explorer />
            </Layout>
          }
        />
        <Route
          path="/rack/:rackId"
          element={
            <Layout>
              <RackView />
            </Layout>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
);

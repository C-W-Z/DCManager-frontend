// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./global.css";

import Home from "@/pages/Home";
import Explorer from "@/components/explorer/explorer";
import Layout from "./layout";
import HostView from "./components/host/host-view";
import HostTable from "./components/host/host-table";
import RackView from "./components/rack/rack-view";

createRoot(document.getElementById("root")!).render(
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
        path="/rack"
        element={
          <Layout>
            <HostTable />
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
      <Route
        path="/host"
        element={
          <Layout>
            <HostTable />
          </Layout>
        }
      />
      <Route
        path="/host/:hostId"
        element={
          <Layout>
            <HostView />
          </Layout>
        }
      />
    </Routes>
    <Toaster />
  </BrowserRouter>,
);

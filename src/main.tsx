// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./global.css";

import Home from "./home";
import Explorer from "@/components/explorer/explorer";
import Layout from "./layout";
import HostView from "./components/host/host-view";
import RackView from "./components/rack/rack-view";
import ServiceTable from "./components/service/service-table";
import ServiceView from "./components/service/service-view";
import DataCenterTable from "@/components/explorer/tables/datacenter-table";
import RoomTable from "@/components/explorer/tables/room-table";
import RackTable from "@/components/explorer/tables/rack-table";
import HostTable from "./components/explorer/tables/host-table";
import { UserProvider } from "./context/user-context";
import LoginPage from "./login";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/explorer"
          element={
            <Layout>
              <Explorer />
            </Layout>
          }
        >
          <Route index element={<DataCenterTable />} />
          <Route path="dc/:dcId" element={<RoomTable />} />
          <Route path="room/:roomId" element={<RackTable />} />
        </Route>
        <Route
          path="/host"
          element={
            <Layout>
              <div className="flex h-full flex-1 flex-col overflow-auto px-12 pt-12">
                <HostTable />
              </div>
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
          path="/host/:hostId"
          element={
            <Layout>
              <HostView />
            </Layout>
          }
        />
        <Route
          path="/service"
          element={
            <Layout>
              <ServiceTable />
            </Layout>
          }
        />
        <Route
          path="/service/:serviceId"
          element={
            <Layout>
              <ServiceView />
            </Layout>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </UserProvider>,
);

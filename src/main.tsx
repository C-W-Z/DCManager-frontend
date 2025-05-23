// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./global.css";

// import Home from "./home";
import Explorer from "@/components/explorer/explorer";
import Layout from "./layout";
import HostView from "@/view/host/host-view";
import RackView from "@/view/rack/rack-view";
import ServiceBoard from "./view/service/service-board";
import ServiceView from "./view/service/service-view";
import DataCenterTable from "@/components/explorer/tables/datacenter-table";
import RoomTable from "@/components/explorer/tables/room-table";
import RackTable from "@/components/explorer/tables/rack-table";
import HostTable from "./components/explorer/tables/host-table";
import { UserProvider } from "./context/user-context";
import LoginPage from "@/view/login";
import BulkAddHostView from "@/view/bulk-add-host-view";

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
          path="/bulk-add-host/:serviceId"
          element={
            <Layout>
              <BulkAddHostView />
            </Layout>
          }
        />
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
          path="/rack/:rackName"
          element={
            <Layout>
              <RackView />
            </Layout>
          }
        />
        <Route
          path="/host/:hostName"
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
              <ServiceBoard />
            </Layout>
          }
        />
        <Route
          path="/service/:serviceName"
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

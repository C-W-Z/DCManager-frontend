// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "./global.css";

import { UserProvider } from "./context/user-context";
import Layout from "./layout";
import { OverviewPage } from "@/pages/overview-page";
import DataCenterTable from "@/components/overview/tables/datacenter-table";
import RoomTable from "@/components/overview/tables/room-table";
import RackTable from "@/components/overview/tables/rack-table";
import { RackPage } from "@/pages/rack-page";
import { HostTablePage } from "./pages/host-table-page";
import { HostPage } from "@/pages/host-page";
import { ServiceBoardPage } from "./pages/service-board-page";
import { ServicePage } from "./pages/service-page";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { BulkAddHostPage } from "@/pages/bulk-add-host-page";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/overview"
          element={
            <Layout>
              <OverviewPage />
            </Layout>
          }
        >
          <Route index element={<DataCenterTable />} />
          <Route path="dc/:dcName" element={<RoomTable />} />
          <Route path="room/:roomName" element={<RackTable />} />
        </Route>
        <Route
          path="/rack/:rackName"
          element={
            <Layout>
              <RackPage />
            </Layout>
          }
        />
        <Route
          path="/host"
          element={
            <Layout>
              <HostTablePage />
            </Layout>
          }
        />
        <Route
          path="/host/:hostName"
          element={
            <Layout>
              <HostPage />
            </Layout>
          }
        />
        <Route
          path="/service"
          element={
            <Layout>
              <ServiceBoardPage />
            </Layout>
          }
        />
        <Route
          path="/service/:serviceName"
          element={
            <Layout>
              <ServicePage />
            </Layout>
          }
        />
        <Route
          path="/bulk-add-host/:serviceId"
          element={
            <Layout>
              <BulkAddHostPage />
            </Layout>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </UserProvider>,
);

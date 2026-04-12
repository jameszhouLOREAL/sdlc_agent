import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/app-layout";
import { DashboardPage } from "./components/dashboard-page";
import { SettingsPage } from "./components/settings-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);

import { Outlet } from "react-router-dom";

import { Toaster } from 'sonner';

export function Layout() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
import Titulo from "./components/Titulo";
import { Outlet } from "react-router-dom";

import { Toaster } from 'sonner';

export function Layout() {
  return (
    <>
      <Titulo />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
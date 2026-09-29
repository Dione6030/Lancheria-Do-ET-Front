import Titulo from "./components/Titulo";
import { InputPesquisa } from "./components/InputPesquisa";
import { Outlet } from "react-router-dom";

import { Toaster } from 'sonner';

export function Layout() {
  return (
    <>
      <Titulo />
      <InputPesquisa setLanches={() => {}} />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
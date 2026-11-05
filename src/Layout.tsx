import Titulo from "./components/Titulo";
import { Outlet } from "react-router-dom";

import { Toaster, toast } from "sonner";
import { useClienteStore } from "./context/ClienteContext";
import { useCallback } from "react";
import { ROTULOS_STATUS, type StatusPedido } from "./util/StatusPedido";
import { useSocketEvento } from "./util/useSocketEvent";


export function Layout() {
  const { cliente } = useClienteStore();

  const avisaStatus = useCallback((p: { id: number; status: StatusPedido }) => {
    toast.info(`Pedido #${p.id}: ${ROTULOS_STATUS[p.status]}`);
  }, []);

  useSocketEvento("pedido:status", avisaStatus, Boolean(cliente.id));
  return (
    <>
      <Titulo />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

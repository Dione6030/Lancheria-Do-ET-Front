import { useEffect } from "react";
import { obtemSocket } from "./socket";

export function useSocketEvento<T>(
  evento: string,
  tratador: (dados: T) => void,
  ativo: boolean,
) {
  useEffect(() => {
    if (!ativo) return;
    const socket = obtemSocket();
    if (!socket) return;

    socket.on(evento, tratador);
    return () => {
      socket.off(evento, tratador);
    };
  }, [evento, tratador, ativo]);
}

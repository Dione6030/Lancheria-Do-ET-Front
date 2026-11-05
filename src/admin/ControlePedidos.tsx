import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useSocketEvento } from "../util/useSocketEvent";
import { useCallback } from "react";
import { ROTULOS_STATUS, type StatusPedido } from "../util/StatusPedido";

const apiUrl = import.meta.env.VITE_API_URL;

// ---------- Tipos ----------

type Pagamento = "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO" | "DINHEIRO";

type PedidoType = {
  id: number;
  pagamento: Pagamento;
  status: StatusPedido;
  itens: { id: number; quantidade: number; item: { nome: string } }[];
  clienteTabela: { nome: string; endereco: string };
};

const ROTULOS_PAGAMENTO: Record<Pagamento, string> = {
  PIX: "Pix",
  CARTAO_DEBITO: "Cartão de débito",
  CARTAO_CREDITO: "Cartão de crédito",
  DINHEIRO: "Dinheiro",
};

// ---------- Utilidades ----------

function cabecalhoAutorizado() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function temaEscuroAtivo() {
  return (
    document.documentElement.classList.contains("dark") ||
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// Pendentes primeiro; a ordem por data (mais recente) é mantida dentro de cada grupo
const finalizado = (p: PedidoType) =>
  p.status === "ENTREGUE" || p.status === "CANCELADO";

const TRANSICOES: Record<string, StatusPedido[]> = {
  RECEBIDO: ["EM_PREPARO", "CANCELADO"] as StatusPedido[],
  EM_PREPARO: ["SAIU_PARA_ENTREGA", "CANCELADO"] as StatusPedido[],
  SAIU_PARA_ENTREGA: ["ENTREGUE", "CANCELADO"] as StatusPedido[],
  ENTREGUE: [],
  CANCELADO: [],
};

function pendentesPrimeiro(pedidos: PedidoType[]) {
  return [...pedidos].sort(
    (a, b) => Number(finalizado(a)) - Number(finalizado(b)),
  );
}

// ---------- Chamadas à API ----------

async function buscarPedidos(): Promise<PedidoType[]> {
  const response = await fetch(`${apiUrl}/admin/pedidos`, {
    headers: cabecalhoAutorizado(),
  });

  if (!response.ok) {
    throw new Error();
  }

  return response.json();
}

// ---------- Confirmações e avisos ----------

async function atualizarStatus(
  id: number,
  status: StatusPedido,
): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/admin/pedidos/${id}/status`, {
      method: "PATCH",
      headers: cabecalhoAutorizado(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error();
    return true;
  } catch {
    toast.error("Não foi possível atualizar o status. Tente novamente.");
    return false;
  }
}

async function confirmarAcao(opcoes: {
  titulo: string;
  texto: string;
  textoBotao: string;
  corBotao: string;
}) {
  const escuro = temaEscuroAtivo();

  const { isConfirmed } = await Swal.fire({
    title: opcoes.titulo,
    text: opcoes.texto,
    icon: "question",
    background: escuro ? "#151024" : "#FFFFFF",
    color: escuro ? "#F7F2FF" : "#20152E",
    showCancelButton: true,
    confirmButtonColor: opcoes.corBotao,
    confirmButtonText: opcoes.textoBotao,
    cancelButtonText: "Cancelar",
  });

  return isConfirmed;
}

// ---------- Componente ----------

export default function ControlePedidos() {
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);

  async function carregarPedidos() {
    try {
      setPedidos(pendentesPrimeiro(await buscarPedidos()));
    } catch {
      toast.error("Não foi possível carregar os pedidos.");
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  const insereNovo = useCallback((novo: PedidoType) => {
    setPedidos((atual) =>
      atual.some((p) => p.id === novo.id) ? atual : [novo, ...atual],
    );
    toast.info(`Novo pedido #${novo.id}`);
  }, []);

  const atualizaStatus = useCallback(
    ({ id, status }: { id: number; status: StatusPedido }) => {
      setPedidos((atual) =>
        pendentesPrimeiro(
          atual.map((p) => (p.id === id ? { ...p, status } : p)),
        ),
      );
    },
    [],
  );

  useSocketEvento("pedido:novo", insereNovo, true);
  useSocketEvento("pedido:status", atualizaStatus, true);

  async function mudarStatus(pedido: PedidoType, novo: StatusPedido) {
    if (novo === "CANCELADO") {
      const ok = await confirmarAcao({
        titulo: "Cancelar pedido?",
        texto: `O pedido #${pedido.id} será marcado como cancelado.`,
        textoBotao: "Cancelar pedido",
        corBotao: "#D6284B",
      });
      if (!ok) return;
    }
    await atualizarStatus(pedido.id, novo);
  }

  return (
    <section className="mt-24 max-w-screen-lg mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-claro-texto dark:text-escuro-texto">
        Controle de Pedidos
      </h2>

      <div className="overflow-x-auto rounded-lg border border-claro-form-border bg-claro-superficie dark:border-escuro-form-border dark:bg-escuro-superficie">
        <table className="w-full text-left text-sm text-claro-texto dark:text-escuro-texto">
          <thead className="border-b border-claro-form-border text-xs text-claro-texto-secundario dark:border-escuro-form-border dark:text-escuro-texto-secundario">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Localização</th>
              <th className="p-4">Pagamento</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  Nenhum pedido recebido ainda.
                </td>
              </tr>
            )}

            {pedidos.map((pedido) => (
              <tr
                key={pedido.id}
                className="border-b border-claro-form-border last:border-0 dark:border-escuro-form-border"
              >
                <td className="p-4 font-semibold">
                  {pedido.itens.map((linha) => (
                    <div key={linha.id}>
                      {linha.quantidade}x {linha.item.nome}
                    </div>
                  ))}
                </td>
                <td className="p-4">{pedido.clienteTabela.endereco}</td>
                <td className="p-4">{ROTULOS_PAGAMENTO[pedido.pagamento]}</td>
                <td className="p-4">{ROTULOS_STATUS[pedido.status]}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {TRANSICOES[pedido.status].map((prox) => (
                      <button
                        key={prox}
                        type="button"
                        onClick={() => mudarStatus(pedido, prox)}
                        className="rounded-lg border border-claro-button-border px-3 py-1 text-xs dark:border-escuro-button-border"
                      >
                        {ROTULOS_STATUS[prox]}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

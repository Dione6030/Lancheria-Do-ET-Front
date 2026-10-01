import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { IoCheckmarkCircle, IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

const apiUrl = import.meta.env.VITE_API_URL;

// ---------- Tipos ----------

type Pagamento = "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO" | "DINHEIRO";

type PedidoType = {
  id: number;
  pagamento: Pagamento;
  entregue: boolean;
  itens: { id: number; quantidade: number; item: { nome: string } }[];
  clienteTabela: { nome: string; endereco: string };
};

type AcaoPedido = "entregar" | "recusar";

type ResultadoAcao = { emailEnviado: boolean };

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
function pendentesPrimeiro(pedidos: PedidoType[]) {
  return [...pedidos].sort((a, b) => Number(a.entregue) - Number(b.entregue));
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

async function enviarAcao(id: number, acao: AcaoPedido): Promise<ResultadoAcao | null> {
  try {
    const response = await fetch(`${apiUrl}/admin/pedidos/${id}/${acao}`, {
      method: acao === "entregar" ? "PATCH" : "DELETE",
      headers: cabecalhoAutorizado(),
    });

    if (!response.ok) {
      throw new Error();
    }

    return response.json();
  } catch {
    toast.error("Não foi possível concluir a ação. Tente novamente.");
    return null;
  }
}

// ---------- Confirmações e avisos ----------

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

function confirmarEntrega(pedido: PedidoType) {
  return confirmarAcao({
    titulo: "Marcar como enviado?",
    texto: `${pedido.clienteTabela.nome} receberá um e-mail avisando que o pedido foi enviado.`,
    textoBotao: "Marcar como enviado",
    corBotao: "#16A34A",
  });
}

function confirmarRecusa(pedido: PedidoType) {
  return confirmarAcao({
    titulo: "Excluir pedido?",
    texto: `O pedido será removido e ${pedido.clienteTabela.nome} receberá um e-mail avisando que foi recusado.`,
    textoBotao: "Excluir",
    corBotao: "#D6284B",
  });
}

function avisarResultado(resultado: ResultadoAcao, mensagemSucesso: string) {
  if (resultado.emailEnviado) {
    toast.success(`${mensagemSucesso} E-mail enviado ao cliente.`);
  } else {
    toast.warning(`${mensagemSucesso} Mas não foi possível enviar o e-mail ao cliente.`);
  }
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

  async function marcarComoEnviado(pedido: PedidoType) {
    if (!(await confirmarEntrega(pedido))) return;

    const resultado = await enviarAcao(pedido.id, "entregar");
    if (!resultado) return;

    avisarResultado(resultado, "Pedido marcado como enviado.");
    carregarPedidos();
  }

  async function excluirPedido(pedido: PedidoType) {
    if (!(await confirmarRecusa(pedido))) return;

    const resultado = await enviarAcao(pedido.id, "recusar");
    if (!resultado) return;

    avisarResultado(resultado, "Pedido excluído.");
    carregarPedidos();
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
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center">
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
                <td className="p-4">
                  {pedido.entregue ? (
                    <span title="Pedido enviado" className="text-3xl text-green-500">
                      <IoCheckmarkCircle />
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-2xl">
                      <button
                        type="button"
                        title="Excluir pedido"
                        aria-label={`Excluir pedido ${pedido.id}`}
                        onClick={() => excluirPedido(pedido)}
                        className="text-claro-erro dark:text-escuro-erro"
                      >
                        <IoCloseCircleOutline />
                      </button>
                      <button
                        type="button"
                        title="Marcar como enviado"
                        aria-label={`Marcar pedido ${pedido.id} como enviado`}
                        onClick={() => marcarComoEnviado(pedido)}
                        className="text-green-500"
                      >
                        <IoCheckmarkCircleOutline />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
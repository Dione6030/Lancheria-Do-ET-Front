import type { LancheType } from "./util/LancheType";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Swal from "sweetalert2";

import { TabelaNutricional } from "./components/TabelaNutricional";
import type { TabelaNutricionalType } from "./util/TabelaNutricionalType";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  pagamento: string;
  observacoes?: string;
};

type PerfilType = {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
};

const formasPagamento = [
  { valor: "PIX", rotulo: "Pix" },
  { valor: "CARTAO_DEBITO", rotulo: "Cartão de débito" },
  { valor: "CARTAO_CREDITO", rotulo: "Cartão de crédito" },
  { valor: "DINHEIRO", rotulo: "Dinheiro" },
];

async function buscaPerfil(): Promise<PerfilType | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const response = await fetch(`${apiUrl}/clientes/eu`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json();
}
async function buscaTabelaNutricional(
  id: number,
): Promise<TabelaNutricionalType | null> {
  const response = await fetch(`${apiUrl}/lanches/${id}/tabela-nutricional`);

  if (!response.ok) return null;

  const dados = await response.json();
  return dados.tabelaNutricional;
}

type DadosAvaliacao = { nota: number; comentario: string };

type RespostaAvaliacao = { status: number; erro?: string };

function temaDoAlerta() {
  const escuro = document.documentElement.classList.contains("dark");
  return escuro ? { background: "#1f2937", color: "#f3f4f6" } : {};
}

async function abreFormularioAvaliacao(): Promise<DadosAvaliacao | null> {
  let nota = 0;

  const resultado = await Swal.fire({
    ...temaDoAlerta(),
    title: "Avaliar lanche",
    html: `
      <div id="estrelas" style="display:flex;justify-content:center;gap:4px;margin-bottom:8px">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) => `
          <button type="button" data-nota="${n}" aria-label="${n} estrela(s)"
            style="font-size:2.25rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af">★</button>`,
          )
          .join("")}
      </div>
      <textarea id="comentario" class="swal2-textarea" maxlength="1000"
        placeholder="Conte o que achou (opcional)"></textarea>`,
    showCancelButton: true,
    confirmButtonText: "Enviar avaliação",
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    didOpen: () => {
      const botoes =
        Swal.getHtmlContainer()!.querySelectorAll<HTMLButtonElement>(
          "[data-nota]",
        );

      const pintaEstrelas = (ate: number) =>
        botoes.forEach((b) => {
          b.style.color = Number(b.dataset.nota) <= ate ? "#facc15" : "#9ca3af";
        });

      botoes.forEach((b) =>
        b.addEventListener("click", () => {
          nota = Number(b.dataset.nota);
          pintaEstrelas(nota);
        }),
      );
    },
    preConfirm: () => {
      if (nota === 0) {
        Swal.showValidationMessage("Escolha uma nota de 1 a 5 estrelas");
        return false;
      }

      const campo =
        Swal.getHtmlContainer()!.querySelector<HTMLTextAreaElement>(
          "#comentario",
        );
      return { nota, comentario: campo?.value.trim() ?? "" };
    },
  });

  return resultado.isConfirmed ? resultado.value : null;
}

async function enviaAvaliacao(
  lancheId: number,
  dados: DadosAvaliacao,
): Promise<RespostaAvaliacao> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${apiUrl}/lanches/${lancheId}/avaliacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nota: dados.nota,
      comentario: dados.comentario || undefined,
    }),
  });

  if (response.status === 201) return { status: 201 };

  const corpo = await response.json().catch(() => null);
  const erro = typeof corpo?.erro === "string" ? corpo.erro : undefined;
  return { status: response.status, erro };
}

function mostraResultado({ status, erro }: RespostaAvaliacao) {
  const tema = temaDoAlerta();

  if (status === 201) {
    return Swal.fire({
      ...tema,
      icon: "success",
      title: "Obrigado pela avaliação!",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  if (status === 409) {
    return Swal.fire({
      ...tema,
      icon: "info",
      title: "Você já avaliou este lanche.",
    });
  }

  return Swal.fire({
    ...tema,
    icon: "error",
    title: "Não foi possível enviar",
    text: erro ?? "Tente novamente em instantes.",
  });
}

export default function Detalhes() {
  const params = useParams();

  const [lanche, setLanche] = useState<LancheType>();
  const [fotoAtual, setFotoAtual] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilType | null>(null);
  const [tabela, setTabela] = useState<TabelaNutricionalType | null>(null);
  const { cliente } = useClienteStore();

  const { register, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { pagamento: "" },
  });

  useEffect(() => {
    async function buscaDados() {
      try {
        setCarregando(true);
        setErro(null);

        const response = await fetch(`${apiUrl}/lanches/${params.LancheId}`);
        console.log("status:", response.status, "url:", response.url);

        if (!response.ok) {
          throw new Error(`API respondeu ${response.status}`);
        }

        const dados = await response.json();
        console.log("dados recebidos:", dados);

        setLanche(dados);
        setFotoAtual(0);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar este lanche.");
      } finally {
        setCarregando(false);
      }
    }
    buscaDados();
  }, [params.LancheId]);

  useEffect(() => {
    if (!cliente.id) {
      setPerfil(null);
      return;
    }
    buscaPerfil()
      .then(setPerfil)
      .catch(() => setPerfil(null));
  }, [cliente.id]);

  useEffect(() => {
    if (!lanche || lanche.condimentos.length === 0) {
      setTabela(null);
      return;
    }

    buscaTabelaNutricional(lanche.id)
      .then(setTabela)
      .catch(() => setTabela(null));
  }, [lanche]);

  async function enviaPedido(data: Inputs) {
    const token = localStorage.getItem("token");

    if (!token || !perfil || !lanche) {
      toast.error("Sua sessão expirou. Faça login novamente.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/pedidos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: JSON.stringify({
          clienteTabelaId: perfil.id,
          pagamento: data.pagamento,
          observacoes: data.observacoes?.trim() || undefined,
          itens: [{ itemId: lanche.id, quantidade: 1 }],
        }),
      });

      if (response.status === 201) {
        toast.success("Pedido enviado! Aguarde a confirmação.");
        reset();
      } else {
        toast.error("Erro... Não foi possível enviar seu pedido");
      }
    } catch {
      toast.error("Não foi possível se conectar ao servidor. Tente novamente.");
    }
  }

  async function avaliaLanche() {
    if (!lanche) return;

    const dados = await abreFormularioAvaliacao();
    if (!dados) return;

    try {
      mostraResultado(await enviaAvaliacao(lanche.id, dados));
    } catch {
      mostraResultado({
        status: 0,
        erro: "Não foi possível se conectar ao servidor.",
      });
    }
  }

  const fotos = lanche?.fotos ?? [];

  if (carregando)
    return (
      <p className="p-6 text-center dark:text-escuro-texto">Carregando...</p>
    );
  if (erro || !lanche)
    return (
      <p className="p-6 text-center dark:text-escuro-texto">
        {erro ?? "Lanche não encontrado."}
      </p>
    );
  return (
    <section className="bg-claro-fundo dark:bg-escuro-fundo">
      <div className="mt-6 mx-auto max-w-5xl bg-claro-superficie border border-gray-200 rounded-lg shadow dark:border-escuro-ciano dark:bg-escuro-superficie">
        {fotos.length > 0 ? (
          <img
            className="w-full h-auto max-h-[20rem] object-contain rounded-t-lg bg-black"
            src={fotos[fotoAtual]?.url}
            alt={fotos[fotoAtual]?.descricao || lanche?.nome}
          />
        ) : (
          <div className="flex h-96 w-full items-center justify-center rounded-t-lg bg-gray-100 text-claro-texto-secundario dark:bg-gray-800 dark:text-escuro-texto-secundario">
            Sem foto disponível
          </div>
        )}

        {fotos.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {fotos.map((foto, index) => (
              <img
                key={foto.id}
                src={foto.url}
                alt={foto.descricao || lanche?.nome}
                onClick={() => setFotoAtual(index)}
                className={`h-20 w-20 shrink-0 object-cover rounded-lg cursor-pointer border-2 ${
                  index === fotoAtual
                    ? "border-claro-magenta dark:border-escuro-magenta"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h5 className="text-2xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
              {lanche?.tipo.nome} {lanche?.nome}
            </h5>
            {lanche && !lanche.disponivel && (
              <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                Indisponível
              </span>
            )}
          </div>

          <h5 className="mb-4 text-xl font-extrabold text-claro-promocao dark:text-escuro-promocao">
            R${" "}
            {lanche
              ? Number(lanche.preco).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })
              : "0,00"}
          </h5>

          <p className="mb-4 font-normal text-claro-texto-secundario dark:text-escuro-texto-secundario">
            {lanche?.descricao}
          </p>

          {lanche?.condimentos && lanche.condimentos.length > 0 && (
            <div className="mb-6">
              <h6 className="mb-2 font-semibold text-claro-texto dark:text-escuro-texto">
                Condimentos:
              </h6>
              <ul className="list-disc list-inside text-claro-texto-secundario dark:text-escuro-texto-secundario text-sm">
                {lanche.condimentos.map((c) => (
                  <li key={c.id}>{c.condimento.nome}</li>
                ))}
              </ul>
            </div>
          )}

          {tabela && <TabelaNutricional tabela={tabela} />}

          {cliente.id && perfil && (
            <button
              type="button"
              onClick={avaliaLanche}
              className="mb-6 w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-claro-magenta text-claro-magenta hover:bg-claro-magenta hover:text-white dark:border-escuro-magenta dark:text-escuro-magenta dark:hover:bg-escuro-magenta dark:hover:text-white"
            >
              ⭐ Avaliar este lanche
            </button>
          )}

          {lanche && !lanche.disponivel ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
                😕 Este item está indisponível no momento.
              </h2>
            </div>
          ) : cliente.id && perfil ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="mb-4 text-xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
                🙂 Faça seu Pedido!
              </h3>

              <form onSubmit={handleSubmit(enviaPedido)}>
                <input
                  type="text"
                  className="mb-4 bg-claro-form-fundo border border-claro-form-border text-claro-form-texto text-sm rounded-lg block w-full p-2.5 cursor-not-allowed dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:text-escuro-form-texto"
                  value={`${perfil.nome} (${cliente.email})`}
                  disabled
                  readOnly
                />

                <select
                  className="mb-4 bg-claro-form-fundo border border-claro-form-border text-claro-form-texto text-sm rounded-lg block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:text-escuro-form-texto"
                  required
                  {...register("pagamento")}
                >
                  <option value="" disabled>
                    Como você vai pagar na entrega?
                  </option>
                  {formasPagamento.map((f) => (
                    <option key={f.valor} value={f.valor}>
                      {f.rotulo}
                    </option>
                  ))}
                </select>

                <label
                  htmlFor="observacoes"
                  className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto"
                >
                  Observações (opcional)
                </label>
                <textarea
                  id="observacoes"
                  rows={3}
                  maxLength={500}
                  placeholder="Ex.: sem tomate, molho à parte..."
                  className="mb-4 bg-claro-form-fundo border border-claro-form-border text-claro-form-texto text-sm rounded-lg block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:text-escuro-form-texto"
                  {...register("observacoes")}
                />

                <button
                  type="submit"
                  className="w-full text-claro-button-texto bg-claro-button-fundo hover:bg-claro-button-fundo focus:ring-4 focus:outline-none focus:ring-claro-button-border font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-escuro-button-fundo dark:hover:bg-escuro-button-fundo dark:focus:ring-escuro-button-border"
                >
                  Enviar Pedido
                </button>
              </form>
            </div>
          ) : cliente.id ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
                Falta pouco!{" "}
                <Link to="/cadastro-cliente" className="underline">
                  Complete seu cadastro
                </Link>{" "}
                para fazer pedidos.
              </h2>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
                😎 Gostou? Identifique-se e faça seu Pedido!
              </h2>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import type { LancheType } from "./util/LancheType";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  descricao: string;
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

export default function Detalhes() {
  const params = useParams();

  const [lanche, setLanche] = useState<LancheType>();
  const [fotoAtual, setFotoAtual] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilType | null>(null);
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

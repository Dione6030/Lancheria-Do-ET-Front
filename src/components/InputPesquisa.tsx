import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { LancheType } from "../util/LancheType";
import type { ModoLista } from "../util/ModoListaType";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  termo: string;
};

type InputPesquisaProps = {
  setLanches: React.Dispatch<React.SetStateAction<LancheType[]>>;
  modo: ModoLista;
  setModo: React.Dispatch<React.SetStateAction<ModoLista>>;
};

export function InputPesquisa({
  setLanches,
  modo,
  setModo,
}: InputPesquisaProps) {
  const { register, handleSubmit, reset } = useForm<Inputs>();

  async function buscarLanches(caminho: string): Promise<boolean> {
    try {
      const response = await fetch(`${apiUrl}${caminho}`);
      if (!response.ok) throw new Error("Resposta inválida da API");

      const dados = await response.json();
      setLanches(Array.isArray(dados) ? dados : []);
      return true;
    } catch {
      toast.error("Não foi possível buscar os lanches. Tente novamente.");
      return false;
    }
  }

  async function enviaPesquisa(data: Inputs) {
    const termo = data.termo.trim();

    if (termo.length < 2) {
      toast.error("Informe, no mínimo, 2 caracteres");
      return;
    }

    const sucesso = await buscarLanches(
      `/lanches/pesquisa/${encodeURIComponent(termo)}`,
    );
    if (sucesso) setModo("pesquisa");
  }

  async function mostraDestaques() {
    reset({ termo: "" });
    const sucesso = await buscarLanches("/lanches/destaques");
    if (sucesso) setModo("destaques");
  }

  async function mostraTodos() {
    reset({ termo: "" });
    const sucesso = await buscarLanches("/lanches");
    if (sucesso) setModo("todos");
  }

  function alternaDestaques() {
    return modo === "destaques" ? mostraTodos() : mostraDestaques();
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3 mx-auto max-w-5xl mt-4 px-4">
      <form className="flex-1" onSubmit={handleSubmit(enviaPesquisa)}>
        <label htmlFor="default-search" className="sr-only">
          Pesquisar lanche
        </label>

        {/* Borda em gradiente neon + brilho quando o campo está em foco */}
        <div
          className="rounded-xl p-[1.5px] transition-shadow duration-300
                                bg-gradient-to-r from-claro-primaria via-claro-magenta to-claro-ciano
                                dark:from-escuro-primaria dark:via-escuro-magenta dark:to-escuro-ciano
                                focus-within:shadow-[0_0_18px_rgba(109,40,217,0.45)]
                                dark:focus-within:shadow-[0_0_22px_rgba(139,61,255,0.65)]"
        >
          <div className="relative rounded-[10px] bg-claro-form-fundo dark:bg-escuro-form-fundo">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
              <svg
                className="w-5 h-5 text-claro-ciano dark:text-escuro-ciano dark:drop-shadow-[0_0_6px_#20E3FF]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>

            <input
              type="search"
              id="default-search"
              autoComplete="off"
              placeholder="Busque por lanche ou tipo (ex.: X-Burger, bebida...)"
              required
              className="block w-full py-4 ps-12 pe-36 text-sm rounded-[10px] bg-transparent outline-none
                                       text-claro-form-texto placeholder:text-claro-texto-secundario
                                       dark:text-escuro-form-texto dark:placeholder:text-escuro-texto-secundario"
              {...register("termo")}
            />

            <button
              type="submit"
              className="absolute end-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider
                         border transition-all duration-200 cursor-pointer
                       bg-claro-button-fundo border-claro-button-border text-claro-button-texto
                       dark:bg-escuro-button-fundo dark:border-escuro-button-border dark:text-escuro-button-texto
                         hover:brightness-125 hover:shadow-[0_0_14px_rgba(112,0,255,0.8)]
                         active:scale-95"
            >
              Pesquisar
            </button>
          </div>
        </div>
      </form>

      <button
        type="button"
        onClick={alternaDestaques}
        className="px-5 py-4 rounded-xl text-sm font-bold uppercase tracking-wider border-2 bg-transparent
                           transition-all duration-200 cursor-pointer
                           border-claro-magenta text-claro-magenta
                           dark:border-escuro-magenta dark:text-escuro-magenta
                           hover:bg-claro-magenta hover:text-white
                           dark:hover:bg-escuro-magenta dark:hover:text-escuro-fundo
                           hover:shadow-[0_0_18px_rgba(255,60,172,0.6)]
                           active:scale-95"
      >
        {modo === "destaques" ? "Mostrar todos" : "Mostrar destaques"}
      </button>
    </div>
  );
}

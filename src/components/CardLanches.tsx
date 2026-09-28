import { Link } from "react-router-dom"
import type { LancheType } from "../util/LancheType"

export function CardLanche({ data }: { data: LancheType }) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-lg bg-claro-superficie shadow dark:border dark:border-escuro-ciano dark:bg-escuro-superficie">
            <img
                className="h-48 w-full object-cover"
                src={data.fotos[0]?.url}
                alt={data.fotos[0]?.descricao || data.nome}
            />
            <div className="flex flex-1 flex-col p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
                    {data.tipo.nome} {data.nome}
                </h5>

                <p className="mb-3 font-extrabold text-claro-promocao dark:text-escuro-promocao">
                    Preço R$: {Number(data.preco).toLocaleString("pt-br", {
                        minimumFractionDigits: 2
                    })}
                </p>

                <p className="mb-3 text-claro-texto-secundario dark:text-escuro-texto-secundario">
                    {data.descricao}
                </p>

                <p className="mb-3 text-sm text-claro-texto-secundario dark:text-escuro-texto-secundario">
                    {data.condimentos.length} condimentos
                </p>

                <Link
                    to={`/detalhes/${data.id}`}
                    className="mt-auto inline-flex w-fit items-center rounded-lg bg-claro-button-fundo px-3 py-2 text-center text-sm font-medium text-claro-button-texto hover:bg-claro-button-fundo focus:outline-none focus:ring-4 focus:ring-claro-button-border dark:bg-escuro-button-fundo dark:hover:bg-escuro-button-fundo dark:focus:ring-escuro-button-border"
                >
                    Ver Detalhes
                    <svg className="ms-2 h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}
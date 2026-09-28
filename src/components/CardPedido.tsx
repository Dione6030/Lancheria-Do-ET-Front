import type { PedidoType } from "../util/PedidoType"

const rotulosPagamento: Record<PedidoType["pagamento"], string> = {
    PIX: "Pix",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    DINHEIRO: "Dinheiro",
}

function formataPreco(valor: number | string) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    })
}

function formataData(data: string) {
    return new Date(data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    })
}

function calculaTotal(pedido: PedidoType) {
    return pedido.itens.reduce(
        (soma, i) => soma + Number(i.preco) * i.quantidade,
        0
    )
}

export function CardPedido({ data }: { data: PedidoType }) {
    return (
        <div className="overflow-hidden rounded-lg bg-claro-superficie shadow dark:border dark:border-escuro-ciano dark:bg-escuro-superficie">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-claro-form-border p-4 dark:border-escuro-form-border">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-claro-texto dark:text-escuro-texto">
                        Pedido #{data.id}
                    </h2>
                    <p className="text-sm text-claro-texto-secundario dark:text-escuro-texto-secundario">
                        Feito em {formataData(data.data)}
                    </p>
                </div>
                <span className="rounded-full bg-claro-form-fundo px-3 py-1 text-xs font-semibold text-claro-texto dark:bg-escuro-form-fundo dark:text-escuro-texto">
                    Pagar na entrega: {rotulosPagamento[data.pagamento]}
                </span>
            </div>

            <ul className="divide-y divide-claro-form-border dark:divide-escuro-form-border">
                {data.itens.map((linha) => (
                    <li key={linha.id} className="flex items-center gap-4 p-4">
                        <img
                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                            src={linha.item.fotos[0]?.url}
                            alt={linha.item.fotos[0]?.descricao || linha.item.nome}
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-claro-texto dark:text-escuro-texto">
                                {linha.item.tipo.nome} {linha.item.nome}
                            </p>
                            <p className="text-sm text-claro-texto-secundario dark:text-escuro-texto-secundario">
                                {linha.quantidade}x {formataPreco(linha.preco)}
                            </p>
                        </div>
                        <p className="font-extrabold text-claro-promocao dark:text-escuro-promocao">
                            {formataPreco(Number(linha.preco) * linha.quantidade)}
                        </p>
                    </li>
                ))}
            </ul>

            {data.observacoes && (
                <p className="border-t border-claro-form-border px-4 py-3 text-sm italic text-claro-texto-secundario dark:border-escuro-form-border dark:text-escuro-texto-secundario">
                    Obs.: {data.observacoes}
                </p>
            )}

            <div className="flex items-center justify-between border-t border-claro-form-border p-4 dark:border-escuro-form-border">
                <span className="font-medium text-claro-texto dark:text-escuro-texto">
                    Total
                </span>
                <span className="text-xl font-extrabold text-claro-promocao dark:text-escuro-promocao">
                    {formataPreco(calculaTotal(data))}
                </span>
            </div>
        </div>
    )
}
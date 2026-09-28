import type { LancheType } from "./LancheType"

export type PedidoItemType = {
    id: number
    pedidoId: number
    itemId: number
    quantidade: number
    preco: number | string
    item: LancheType
}

export type PedidoType = {
    id: number
    data: string
    pagamento: "PIX" | "CARTAO_DEBITO" | "CARTAO_CREDITO" | "DINHEIRO"
    observacoes: string | null
    itens: PedidoItemType[]
}
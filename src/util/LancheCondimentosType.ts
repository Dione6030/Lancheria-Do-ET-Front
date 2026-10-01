import type { CondimentosType } from "./CondimentosType";

export type LancheCondimentoType = {
    id: number
    itemId: number
    condimentoId: number
    quantidadeGramas: number | null
    condimento: CondimentosType
}
import type { LancheCondimentoType } from "./LancheCondimentoType";
import type { FotoType } from "./FotoType";
import type { TipoType } from "./TipoType";

export type LancheType = {
    id: number
    nome: string
    descricao: string
    tipoId: number
    preco: number
    disponivel: boolean
    tipo: TipoType
    condimentos: LancheCondimentoType[]
    fotos: FotoType[]
}
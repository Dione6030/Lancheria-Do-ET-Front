import type { TabelaNutricionalType } from "../util/TabelaNutricionalType"

function formataValor(valor: number) {
    return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
}

export function TabelaNutricional({ tabela }: { tabela: TabelaNutricionalType }) {
    const linhas = [
        { rotulo: "Valor energético", valor: `${formataValor(tabela.calorias)} kcal` },
        { rotulo: "Carboidratos", valor: `${formataValor(tabela.carboidratos)} g` },
        { rotulo: "Proteínas", valor: `${formataValor(tabela.proteinas)} g` },
        { rotulo: "Gorduras", valor: `${formataValor(tabela.gorduras)} g` },
    ]

    return (
        <div className="mb-6 rounded-lg border border-claro-form-border p-4 dark:border-escuro-form-border">
            <h6 className="font-semibold text-claro-texto dark:text-escuro-texto">
                Informação nutricional
            </h6>
            <p className="mb-3 text-xs text-claro-texto-secundario dark:text-escuro-texto-secundario">
                Total do lanche ({formataValor(tabela.pesoTotalGramas)} g de ingredientes)
            </p>

            <table className="w-full text-sm text-claro-texto dark:text-escuro-texto">
                <tbody>
                    {linhas.map((linha) => (
                        <tr
                            key={linha.rotulo}
                            className="border-b border-claro-form-border last:border-0 dark:border-escuro-form-border"
                        >
                            <td className="py-2">{linha.rotulo}</td>
                            <td className="py-2 text-right font-semibold">{linha.valor}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {!tabela.completa && (
                <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
                    Tabela parcial: faltam dados de {tabela.ingredientesIncompletos.join(", ")}.
                </p>
            )}

            <p className="mt-3 text-xs italic text-claro-texto-secundario dark:text-escuro-texto-secundario">
                Valores estimados por inteligência artificial; podem variar.
            </p>
        </div>
    )
}
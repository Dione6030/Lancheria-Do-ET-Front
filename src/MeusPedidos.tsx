import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useClienteStore } from "./context/ClienteContext"
import { CardPedido } from "./components/CardPedido"
import type { PedidoType } from "./util/PedidoType"

const apiUrl = import.meta.env.VITE_API_URL

async function buscaPedidos(): Promise<PedidoType[]> {
    const token = localStorage.getItem("token")

    const response = await fetch(`${apiUrl}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`)
    }
    return response.json()
}

function Mensagem({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="mt-10 text-2xl font-extrabold tracking-tight text-claro-texto dark:text-escuro-texto">
            {children}
        </h2>
    )
}

export default function MeusPedidos() {
    const { cliente } = useClienteStore()
    const [pedidos, setPedidos] = useState<PedidoType[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        if (!cliente.id) {
            setCarregando(false)
            return
        }

        buscaPedidos()
            .then(setPedidos)
            .catch(() => setErro("Não foi possível carregar seus pedidos."))
            .finally(() => setCarregando(false))
    }, [cliente.id])

    function conteudo() {
        if (!cliente.id) {
            return (
                <Mensagem>
                    😎 <Link to="/login" className="underline">Identifique-se</Link> para ver seus pedidos.
                </Mensagem>
            )
        }
        if (carregando) return <Mensagem>Carregando...</Mensagem>
        if (erro) return <Mensagem>{erro}</Mensagem>
        if (pedidos.length === 0) {
            return (
                <Mensagem>
                    🙄 Você ainda não fez pedidos.{" "}
                    <Link to="/" className="underline">Veja o cardápio</Link>
                </Mensagem>
            )
        }
        return (
            <div className="flex flex-col gap-4">
                {pedidos.map((pedido) => (
                    <CardPedido key={pedido.id} data={pedido} />
                ))}
            </div>
        )
    }

    return (
        <section className="bg-claro-fundo px-4 pb-10 dark:bg-escuro-fundo">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-6 mt-4 text-4xl font-extrabold leading-none tracking-tight text-claro-ciano md:text-5xl dark:text-escuro-ciano">
                    Meus{" "}
                    <span className="underline underline-offset-3 decoration-8 decoration-claro-magenta dark:decoration-escuro-magenta">
                        Pedidos
                    </span>
                </h1>
                {conteudo()}
            </div>
        </section>
    )
}
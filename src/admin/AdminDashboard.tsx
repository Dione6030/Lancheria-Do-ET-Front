import './AdminDashboard.css'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const apiUrl = import.meta.env.VITE_API_URL

type ResumoType = {
  pedidosRealizados: number
  lanchesNoCardapio: number
  clientesRegistrados: number
}

export default function AdminDashboard() {
  const [resumo, setResumo] = useState<ResumoType | null>(null)

  useEffect(() => {
    async function carregarResumo() {
      const token = localStorage.getItem('token')

      if (!token) {
        return
      }

      try {
        const response = await fetch(`${apiUrl}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
          throw new Error()
        }

        const dados = await response.json()
        setResumo(dados.resumo)
      } catch {
        toast.error('Não foi possível carregar os dados do painel administrativo.')
      }
    }

    carregarResumo()
  }, [])

  return (
    <section className="mt-24 max-w-screen-lg mx-auto">
      <h2 className="text-3xl mb-2 font-bold text-claro-texto dark:text-escuro-texto">
        Painel Administrativo
      </h2>
      <p className="mb-6 text-claro-texto dark:text-escuro-texto">
        Visão geral da Lancheria do ET.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-claro-button-border bg-claro-superficie p-6 text-center dark:border-escuro-button-border dark:bg-escuro-superficie">
          <span className="block text-4xl font-bold text-claro-button-fundo dark:text-escuro-button-border">
            {resumo?.pedidosRealizados ?? '—'}
          </span>
          <p className="mt-2 font-medium text-claro-texto dark:text-escuro-texto">Pedidos realizados</p>
        </div>

        <div className="rounded-lg border border-claro-button-border bg-claro-superficie p-6 text-center dark:border-escuro-button-border dark:bg-escuro-superficie">
          <span className="block text-4xl font-bold text-claro-button-fundo dark:text-escuro-button-border">
            {resumo?.lanchesNoCardapio ?? '—'}
          </span>
          <p className="mt-2 font-medium text-claro-texto dark:text-escuro-texto">Lanches no cardápio</p>
        </div>

        <div className="rounded-lg border border-claro-button-border bg-claro-superficie p-6 text-center dark:border-escuro-button-border dark:bg-escuro-superficie">
          <span className="block text-4xl font-bold text-claro-button-fundo dark:text-escuro-button-border">
            {resumo?.clientesRegistrados ?? '—'}
          </span>
          <p className="mt-2 font-medium text-claro-texto dark:text-escuro-texto">Clientes cadastrados</p>
        </div>
      </div>
    </section>
  )
}

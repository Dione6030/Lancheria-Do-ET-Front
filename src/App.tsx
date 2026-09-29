import './App.css'
import { InputPesquisa } from './components/InputPesquisa'
import { CardLanche } from './components/CardLanches'
import type { LancheType } from './util/LancheType'
import type { ModoLista } from './util/ModoListaType'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

const TITULOS: Record<ModoLista, { inicio: string; destaque: string }> = {
  todos: { inicio: 'Nosso', destaque: 'cardápio' },
  destaques: { inicio: 'Lanches', destaque: 'em destaque' },
  pesquisa: { inicio: 'Resultados da', destaque: 'pesquisa' },
}

export default function App() {
  const [lanches, setLanches] = useState<LancheType[]>([])
  const [modo, setModo] = useState<ModoLista>('todos')

  useEffect(() => {
    async function buscaDados() {
      try {
        const response = await fetch(`${API_URL}/lanches`)
        if (!response.ok) throw new Error('Resposta inválida da API')
        const dados = await response.json()
        setLanches(Array.isArray(dados) ? dados : [])
      } catch {
        setLanches([])
      }
    }
    buscaDados()
  }, [])

  const listaLanches = lanches.map((lanche) => (
    <CardLanche key={lanche.id} data={lanche} />
  ))

  const titulo = TITULOS[modo]

  return (
    <>
      <InputPesquisa setLanches={setLanches} modo={modo} setModo={setModo} />
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-claro-ciano md:text-5xl lg:text-6xl dark:text-escuro-ciano">
          {titulo.inicio}{' '}
          <span className="underline underline-offset-3 decoration-8 decoration-claro-magenta dark:decoration-escuro-magenta">
            {titulo.destaque}
          </span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {listaLanches}
        </div>
      </div>
    </>
  )
}
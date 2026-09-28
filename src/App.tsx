import './App.css'
import { CardLanche } from './components/CardLanches'
import type { LancheType } from './util/LancheType'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [lanches, setLanches] = useState<LancheType[]>([])

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${API_URL}/lanches`)
      const dados = await response.json()
      setLanches(dados)
    }
    buscaDados()
  }, [])

  const listaLanches = lanches.map((lanche) => (
    <CardLanche key={lanche.id} data={lanche} />
  ))


  return (
    <>
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-claro-ciano md:text-5xl lg:text-6xl dark:text-escuro-ciano">
          Lanches <span className="underline underline-offset-3 decoration-8 decoration-claro-magenta dark:decoration-escuro-magenta">em destaque</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {listaLanches}
        </div>
      </div>
    </>
  )
}
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Swal from 'sweetalert2'
import { z } from 'zod'
import {
  IoCloseCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoStar,
  IoStarOutline
} from 'react-icons/io5'

const apiUrl = import.meta.env.VITE_API_URL

// ---------- Tipos e validação ----------

type LancheType = {
  id: number
  nome: string
  preco: number | string
  categoria: 'LANCHE' | 'BEBIDA'
  disponivel: boolean
  destaque: boolean
  tipo: { nome: string }
  fotos: { url: string }[]
}

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do produto.'),
  descricao: z.string().trim().max(500, 'A descrição pode ter no máximo 500 caracteres.'),
  preco: z.number({ error: 'Informe um preço válido.' }).positive('O preço deve ser maior que zero.'),
  tipo: z.string().trim().min(2, 'Informe o tipo do produto.'),
  imagemUrl: z.url('Informe um link de imagem válido.'),
  categoria: z.enum(['LANCHE', 'BEBIDA']),
  condimentos: z.string().trim()
})

type FormData = z.infer<typeof schema>

// ---------- Utilidades (cada função faz uma coisa só) ----------

function cabecalhoAutorizado() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

function formatarPreco(preco: number | string) {
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function listaDeCondimentos(texto: string) {
  return [...new Map(
    texto
      .split(',')
      .map(condimento => condimento.trim())
      .filter(Boolean)
      .map(condimento => [condimento.toLocaleLowerCase(), condimento])
  ).values()]
}

function temaEscuroAtivo() {
  return document.documentElement.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ---------- SweetAlert: formulário de novo lanche ----------

const classeCampo =
  'w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-sm text-claro-form-texto ' +
  'dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto'

function htmlCampo(id: string, rotulo: string, entrada: string, ajuda = '') {
  return `
    <div class="mb-3">
      <label for="${id}" class="block mb-1 text-sm font-medium">${rotulo}</label>
      ${entrada}
      ${ajuda ? `<p class="mt-1 text-xs opacity-80">${ajuda}</p>` : ''}
    </div>`
}

function htmlFormularioLanche() {
  return `
    <div class="text-left">
      ${htmlCampo('swal-nome', 'Nome do produto',
        `<input id="swal-nome" type="text" class="${classeCampo}" />`)}
      ${htmlCampo('swal-descricao', 'Descrição',
        `<textarea id="swal-descricao" rows="3" class="${classeCampo}"></textarea>`)}
      <div class="grid gap-3 sm:grid-cols-2">
        ${htmlCampo('swal-preco', 'Preço',
          `<input id="swal-preco" type="number" min="0.01" step="0.01" class="${classeCampo}" />`)}
        ${htmlCampo('swal-categoria', 'Categoria',
          `<select id="swal-categoria" class="${classeCampo}">
             <option value="LANCHE">Lanche</option>
             <option value="BEBIDA">Bebida</option>
           </select>`)}
      </div>
      ${htmlCampo('swal-tipo', 'Tipo do produto',
        `<input id="swal-tipo" type="text" placeholder="Ex.: Salgado, Doce ou Bebida" class="${classeCampo}" />`,
        'Se o tipo ainda não existir, ele será criado.')}
      ${htmlCampo('swal-imagem', 'Link da imagem',
        `<input id="swal-imagem" type="url" placeholder="https://exemplo.com/imagem.jpg" class="${classeCampo}" />`)}
      ${htmlCampo('swal-condimentos', 'Condimentos',
        `<input id="swal-condimentos" type="text" placeholder="Ex.: carne bovina, alface, tomate" class="${classeCampo}" />`,
        'Separe cada condimento por vírgula. Deixe vazio para bebidas.')}
    </div>`
}

function lerCamposDoFormulario() {
  const valorDe = (id: string) => (document.getElementById(id) as HTMLInputElement).value

  return {
    nome: valorDe('swal-nome'),
    descricao: valorDe('swal-descricao'),
    preco: Number(valorDe('swal-preco')),
    categoria: valorDe('swal-categoria'),
    tipo: valorDe('swal-tipo'),
    imagemUrl: valorDe('swal-imagem'),
    condimentos: valorDe('swal-condimentos')
  }
}

function validarFormulario() {
  const valida = schema.safeParse(lerCamposDoFormulario())

  if (!valida.success) {
    Swal.showValidationMessage(valida.error.issues[0].message)
    return false
  }

  return valida.data
}

async function abrirFormularioNovoLanche(): Promise<FormData | undefined> {
  const escuro = temaEscuroAtivo()

  const { value } = await Swal.fire({
    title: 'Novo lanche',
    html: htmlFormularioLanche(),
    background: escuro ? '#151024' : '#FFFFFF',
    color: escuro ? '#F7F2FF' : '#20152E',
    confirmButtonColor: escuro ? '#7000FF' : '#5A18C9',
    confirmButtonText: 'Adicionar lanche',
    cancelButtonText: 'Cancelar',
    showCancelButton: true,
    focusConfirm: false,
    width: 640,
    preConfirm: validarFormulario
  })

  return value
}

// ---------- Chamadas à API ----------

async function buscarLanches(): Promise<LancheType[]> {
  const response = await fetch(`${apiUrl}/lanches`)

  if (!response.ok) {
    throw new Error()
  }

  return response.json()
}

async function enviarNovoLanche(dados: FormData): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/lanches/completo`, {
      method: 'POST',
      headers: cabecalhoAutorizado(),
      body: JSON.stringify({ ...dados, condimentos: listaDeCondimentos(dados.condimentos) })
    })

    const resposta = await response.json()

    if (!response.ok) {
      toast.error(typeof resposta.erro === 'string' ? resposta.erro : 'Não foi possível adicionar o lanche.')
      return false
    }

    toast.success(resposta.mensagem ?? 'Lanche adicionado com sucesso!')
    return true
  } catch {
    toast.error('Não foi possível se conectar ao servidor.')
    return false
  }
}

async function atualizarLanche(id: number, campos: Partial<Pick<LancheType, 'disponivel' | 'destaque'>>) {
  try {
    const response = await fetch(`${apiUrl}/lanches/${id}`, {
      method: 'PATCH',
      headers: cabecalhoAutorizado(),
      body: JSON.stringify(campos)
    })

    if (!response.ok) {
      throw new Error()
    }

    return true
  } catch {
    toast.error('Não foi possível atualizar o lanche.')
    return false
  }
}

async function removerLanche(id: number) {
  try {
    const response = await fetch(`${apiUrl}/lanches/${id}`, {
      method: 'DELETE',
      headers: cabecalhoAutorizado()
    })

    if (!response.ok) {
      throw new Error()
    }

    return true
  } catch {
    toast.error('Não foi possível excluir. Se o lanche já foi pedido, desative-o em vez de excluir.')
    return false
  }
}

async function confirmarExclusao(nome: string) {
  const escuro = temaEscuroAtivo()

  const { isConfirmed } = await Swal.fire({
    title: 'Excluir lanche?',
    text: `"${nome}" será removido do cardápio.`,
    icon: 'warning',
    background: escuro ? '#151024' : '#FFFFFF',
    color: escuro ? '#F7F2FF' : '#20152E',
    showCancelButton: true,
    confirmButtonColor: '#D6284B',
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar'
  })

  return isConfirmed
}

// ---------- Componente ----------

export default function CadastroLanches() {
  const [lanches, setLanches] = useState<LancheType[]>([])

  async function carregarLanches() {
    try {
      setLanches(await buscarLanches())
    } catch {
      toast.error('Não foi possível carregar os lanches.')
    }
  }

  useEffect(() => {
    carregarLanches()
  }, [])

  async function cadastrarNovoLanche() {
    const dados = await abrirFormularioNovoLanche()

    if (dados && await enviarNovoLanche(dados)) {
      carregarLanches()
    }
  }

  async function alternarDisponivel(lanche: LancheType) {
    if (await atualizarLanche(lanche.id, { disponivel: !lanche.disponivel })) {
      carregarLanches()
    }
  }

  async function alternarDestaque(lanche: LancheType) {
    if (await atualizarLanche(lanche.id, { destaque: !lanche.destaque })) {
      carregarLanches()
    }
  }

  async function excluirLanche(lanche: LancheType) {
    if (await confirmarExclusao(lanche.nome) && await removerLanche(lanche.id)) {
      toast.success('Lanche excluído.')
      carregarLanches()
    }
  }

  return (
    <section className="mt-24 max-w-screen-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-claro-texto dark:text-escuro-texto">Cadastro de Lanches</h2>
        <button
          type="button"
          onClick={cadastrarNovoLanche}
          className="rounded-lg bg-claro-button-fundo px-5 py-2.5 text-sm font-medium text-claro-button-texto transition-colors hover:ring-2 hover:ring-claro-button-border dark:bg-escuro-button-fundo dark:hover:ring-escuro-button-border"
        >
          Novo lanche
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-claro-form-border bg-claro-superficie dark:border-escuro-form-border dark:bg-escuro-superficie">
        <table className="w-full text-left text-sm text-claro-texto dark:text-escuro-texto">
          <thead className="border-b border-claro-form-border text-xs text-claro-texto-secundario dark:border-escuro-form-border dark:text-escuro-texto-secundario">
            <tr>
              <th className="p-4">Foto</th>
              <th className="p-4">Nome</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lanches.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Nenhum lanche cadastrado. Use o botão "Novo lanche" para começar.
                </td>
              </tr>
            )}

            {lanches.map(lanche => (
              <tr
                key={lanche.id}
                className={`border-b border-claro-form-border last:border-0 dark:border-escuro-form-border ${lanche.disponivel ? '' : 'opacity-50'}`}
              >
                <td className="p-4">
                  {lanche.fotos[0] && (
                    <img src={lanche.fotos[0].url} alt={lanche.nome} className="h-20 w-28 rounded-md object-cover" />
                  )}
                </td>
                <td className="p-4 font-semibold">{lanche.nome}</td>
                <td className="p-4">{lanche.tipo.nome}</td>
                <td className="p-4">{lanche.categoria === 'BEBIDA' ? 'Bebida' : 'Lanche'}</td>
                <td className="p-4">{formatarPreco(lanche.preco)}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-2xl">
                    <button
                      type="button"
                      title="Excluir lanche"
                      aria-label={`Excluir ${lanche.nome}`}
                      onClick={() => excluirLanche(lanche)}
                      className="text-claro-erro dark:text-escuro-erro"
                    >
                      <IoCloseCircleOutline />
                    </button>
                    <button
                      type="button"
                      title={lanche.disponivel ? 'Desativar no cardápio' : 'Ativar no cardápio'}
                      aria-label={lanche.disponivel ? `Desativar ${lanche.nome}` : `Ativar ${lanche.nome}`}
                      onClick={() => alternarDisponivel(lanche)}
                      className="text-claro-ciano dark:text-escuro-ciano"
                    >
                      {lanche.disponivel ? <IoEyeOutline /> : <IoEyeOffOutline />}
                    </button>
                    <button
                      type="button"
                      title={lanche.destaque ? 'Remover destaque' : 'Destacar lanche'}
                      aria-label={lanche.destaque ? `Remover destaque de ${lanche.nome}` : `Destacar ${lanche.nome}`}
                      onClick={() => alternarDestaque(lanche)}
                      className="text-yellow-500"
                    >
                      {lanche.destaque ? <IoStar /> : <IoStarOutline />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
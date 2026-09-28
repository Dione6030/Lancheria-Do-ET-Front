import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

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

const apiUrl = import.meta.env.VITE_API_URL

export default function NovoLanche() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoria: 'LANCHE',
      condimentos: '',
      descricao: ''
    }
  })

  async function adicionarLanche(dados: FormData) {
    const token = localStorage.getItem('token')

    if (!token) {
      toast.error('Sua sessão administrativa não foi encontrada.')
      navigate('/login', { replace: true })
      return
    }

    const condimentos = [...new Map(
      dados.condimentos
        .split(',')
        .map(condimento => condimento.trim())
        .filter(Boolean)
        .map(condimento => [condimento.toLocaleLowerCase(), condimento])
    ).values()]

    try {
      const response = await fetch(`${apiUrl}/lanches/completo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...dados,
          condimentos
        })
      })

      const resposta = await response.json()

      if (!response.ok) {
        toast.error(typeof resposta.erro === 'string' ? resposta.erro : 'Não foi possível adicionar o lanche.')
        return
      }

      toast.success(resposta.mensagem ?? 'Lanche adicionado com sucesso!')
      reset()
    } catch {
      toast.error('Não foi possível se conectar ao servidor.')
    }
  }

  return (
    <section className="mt-24 max-w-2xl mx-auto">
      <div className="rounded-lg bg-claro-superficie p-6 shadow dark:border dark:border-escuro-ciano dark:bg-escuro-superficie sm:p-8">
        <h2 className="text-3xl font-bold text-claro-texto dark:text-escuro-texto">Novo lanche</h2>
        <p className="mt-2 text-claro-texto dark:text-escuro-texto">
          Cadastre o produto, a imagem, o tipo e os condimentos em uma única etapa.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(adicionarLanche)}>
          <div>
            <label htmlFor="nome" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Nome do produto</label>
            <input id="nome" type="text" className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('nome')} />
            {errors.nome && <p className="error" role="alert">{errors.nome.message}</p>}
          </div>

          <div>
            <label htmlFor="descricao" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Descrição</label>
            <textarea id="descricao" rows={3} className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('descricao')} />
            {errors.descricao && <p className="error" role="alert">{errors.descricao.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="preco" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Preço</label>
              <input id="preco" type="number" min="0.01" step="0.01" className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('preco', { valueAsNumber: true })} />
              {errors.preco && <p className="error" role="alert">{errors.preco.message}</p>}
            </div>

            <div>
              <label htmlFor="categoria" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Categoria</label>
              <select id="categoria" className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('categoria')}>
                <option value="LANCHE">Lanche</option>
                <option value="BEBIDA">Bebida</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tipo" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Tipo do produto</label>
            <input id="tipo" type="text" placeholder="Ex.: Salgado, Doce ou Bebida" className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('tipo')} />
            <p className="mt-1 text-xs text-claro-texto dark:text-escuro-texto">Se o tipo ainda não existir, ele será criado.</p>
            {errors.tipo && <p className="error" role="alert">{errors.tipo.message}</p>}
          </div>

          <div>
            <label htmlFor="imagemUrl" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Link da imagem</label>
            <input id="imagemUrl" type="url" placeholder="https://exemplo.com/imagem.jpg" className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('imagemUrl')} />
            {errors.imagemUrl && <p className="error" role="alert">{errors.imagemUrl.message}</p>}
          </div>

          <div>
            <label htmlFor="condimentos" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Condimentos</label>
            <input id="condimentos" type="text" placeholder="Ex.: carne bovina, alface, tomate" className="w-full rounded-lg border border-claro-form-border bg-claro-form-fundo p-2.5 text-claro-form-texto dark:border-escuro-form-border dark:bg-escuro-form-fundo dark:text-escuro-form-texto" {...register('condimentos')} />
            <p className="mt-1 text-xs text-claro-texto dark:text-escuro-texto">Separe cada condimento por vírgula. Deixe vazio para bebidas.</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-claro-button-fundo px-5 py-2.5 text-sm font-medium text-claro-button-texto transition-colors hover:border-claro-button-border hover:ring-2 hover:ring-claro-button-border disabled:cursor-not-allowed disabled:opacity-60 dark:bg-escuro-button-fundo dark:hover:ring-escuro-button-border">
            {isSubmitting ? 'Adicionando...' : 'Adicionar lanche ao cardápio'}
          </button>
        </form>
      </div>
    </section>
  )
}

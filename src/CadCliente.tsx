import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import './CadCliente.css'
// ... não precisa mais com o Zod
// type Inputs = {
//     nome: string
//     email: string
//     cidade: string
//     senha: string
//     senha2: string
// }

// Schema Zod com validações
const schema = z.object({
    nome: z.string()
        .min(6, "Nome deve ter pelo menos 6 caracteres")
        .max(60, "Nome deve ter no máximo 60 caracteres")
        .refine(value => value.includes(' '), {
            message: "Informe o nome completo (nome e sobrenome)",
        }),
    endereco: z.string()
        .min(10, "Endereço deve ter pelo menos 10 caracteres")
        .max(100, "Endereço deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-Z0-9\s\.,'-]+$/, "Endereço contém caracteres inválidos"),
    telefone: z.string()
        .min(10, "Telefone deve ter pelo menos 10 caracteres")
        .max(15, "Telefone deve ter no máximo 15 caracteres")
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Formato de telefone inválido")
})

type FormData = z.infer<typeof schema>

const apiUrl = import.meta.env.VITE_API_URL

export default function CadCliente() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)  // Validação Zod
    });

    const navigate = useNavigate()

    async function cadastraCliente(data: FormData) {

        const response = await
            fetch(`${apiUrl}/clientes`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    email: data.nome,
                    endereco: data.endereco,
                    telefone: data.telefone
                })
            })


        if (response.status == 201) {
            toast.success("Ok! Cadastro realizado com sucesso...")
            // carrega a página principal, após login do cliente
            setTimeout(() => {
                navigate("/login")
            }, 3000)  // Aguarda 3 segundos (3000 ms)
        } else {
            
            const responseData = await response.json()
            console.log(responseData)
            // Erro específico de nome duplicado
            if (responseData.erro == "nome já cadastrado") {
                setError("nome", { type: "server", message: responseData.erro })
                toast.error(responseData.erro)
                return
            }
            // Outros erros genéricos
            toast.error(responseData.erro)
        }

    }

    return (
        <section className="bg-claro-fundo dark:bg-escuro-fundo">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-claro-superficie rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-escuro-superficie dark:border-escuro-ciano">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-claro-texto md:text-2xl dark:text-escuro-texto">
                            Cadastro de Cliente
                        </h1>
                        <form className="space-y-4 md:space-y-6"
                            onSubmit={handleSubmit(cadastraCliente)}>
                            <div>
                                <label htmlFor="nome" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Nome:</label>
                                <input type="text" id="nome" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Seu nome completo" required
                                    {...register("nome")} />
                                {errors.nome && <p role="alert" className="error">{errors.nome.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="endereco" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Endereço:</label>
                                <input type="text" id="endereco" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Rua, número, bairro" required
                                    {...register("endereco")} />
                                {errors.endereco && <p role="alert" className="error">{errors.endereco.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Telefone:</label>
                                <input type="tel" id="telefone" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="(00) 00000-0000" required
                                    {...register("telefone")} />
                                {errors.telefone && <p role="alert" className="error">{errors.telefone.message}</p>}
                            </div>
                            <button type="submit" className="w-full text-claro-button-texto bg-claro-button-fundo hover:bg-claro-button-fundo focus:ring-4 focus:outline-none focus:ring-claro-button-border font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-escuro-button-fundo dark:hover:bg-escuro-button-fundo dark:focus:ring-escuro-button-border">Criar sua Conta</button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Já possui uma conta? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Faça Login</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
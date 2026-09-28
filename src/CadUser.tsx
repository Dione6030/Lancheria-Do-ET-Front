import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClienteStore } from "./context/ClienteContext";

import './CadCliente.css'

const schema = z.object({
    email: z.email("Email inválido")
        .max(100, "Email deve ter no máximo 100 caracteres"),
    senha: z.string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .max(20, "Senha deve ter no máximo 20 caracteres")
        .refine(value => /[A-Z]/.test(value), {
            message: "Senha deve conter pelo menos uma letra maiúscula",
        })
        .refine(value => /[a-z]/.test(value), {
            message: "Senha deve conter pelo menos uma letra minúscula",
        })
        .refine(value => /[0-9]/.test(value), {
            message: "Senha deve conter pelo menos um número",
        })
        .refine(value => /[^A-Za-z0-9]/.test(value), {
            message: "Senha deve conter pelo menos um caractere especial",
        }),
    senha2: z.string()
}).refine((data) => data.senha == data.senha2, {  // Validação cross-field
    message: "Senhas não coincidem",
    path: ["senha2"]  // Erro aparece no campo senha2
})

type FormData = z.infer<typeof schema>

const apiUrl = import.meta.env.VITE_API_URL

export default function CadUser() {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)  // Validação Zod
    });

    const navigate = useNavigate()
    const { logaCliente } = useClienteStore()

    async function cadastraUser(data: FormData) {
        try {
            const response = await fetch(`${apiUrl}/usuarios`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    email: data.email,
                    senha: data.senha
                })
            })

            const responseData = await response.json()

            if (!response.ok) {
                // Erro específico de email duplicado
                if (responseData.erro == "email já cadastrado") {
                    setError("email", { type: "server", message: responseData.erro })
                    toast.error(responseData.erro)
                    return
                }

                toast.error(responseData.erro ?? "Não foi possível criar a conta.")
                return
            }

            const loginResponse = await fetch(`${apiUrl}/login`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ email: data.email, senha: data.senha })
            })

            const loginData = await loginResponse.json()

            if (!loginResponse.ok || !loginData.token) {
                toast.error("Conta criada, mas não foi possível iniciar sua sessão. Faça login para continuar.")
                navigate("/login", { replace: true })
                return
            }

            if (!logaCliente(loginData.token)) {
                toast.error("Não foi possível iniciar sua sessão. Faça login para continuar.")
                navigate("/login", { replace: true })
                return
            }

            toast.success("Conta criada com sucesso! Complete seu cadastro de cliente.")
            navigate("/cadastro-cliente", { replace: true })
        } catch {
            toast.error("Não foi possível se conectar ao servidor. Tente novamente.")
        }
    }

    return (
        <section className="bg-claro-fundo dark:bg-escuro-fundo">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-claro-superficie rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-escuro-superficie dark:border-escuro-ciano">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-claro-texto md:text-2xl dark:text-escuro-texto">
                            Cadastro de Usuário
                        </h1>
                        <form className="space-y-4 md:space-y-6"
                            onSubmit={handleSubmit(cadastraUser)}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Email:</label>
                                <input type="email" id="email" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="seu.email@exemplo.com" required
                                    {...register("email")} />
                                {errors.email && <p role="alert" className="error">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="senha" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Senha:</label>
                                <input type="password" id="senha" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Sua senha" required
                                    {...register("senha")} />
                                {errors.senha && <p role="alert" className="error">{errors.senha.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="confirmar-senha" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Confirmar Senha:</label>
                                <input type="password" id="confirmar-senha" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Confirme sua senha" required
                                    {...register("senha2")} />
                                {errors.senha2 && <p role="alert" className="error">{errors.senha2.message}</p>}
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

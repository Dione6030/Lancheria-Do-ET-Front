import { useForm } from "react-hook-form"

import { Link, useNavigate } from "react-router-dom";

import { toast } from "sonner"
import { useClienteStore } from "./context/ClienteContext"
import { useAdminStore } from "./admin/context/AdminContext"
import { dadosDoToken } from "./util/token"

type Inputs = {
    email: string
    senha: string
    manter: boolean
}

const apiUrl = import.meta.env.VITE_API_URL

export default function Login() {
    const { register, handleSubmit } = useForm<Inputs>()    
    const { logaCliente } = useClienteStore()
    const { logaAdmin } = useAdminStore()

    const navigate = useNavigate()

    async function verificaLogin(data: Inputs) {
        const response = await
          fetch(`${apiUrl}/login`, {
            headers: {"Content-Type": "application/json"},
            method: "POST",
            body: JSON.stringify({ email: data.email, senha: data.senha })
          })
        
        if (response.status == 200) {
            const dados = await response.json()
            const usuario = dados.token ? dadosDoToken(dados.token) : null

            if (!usuario) {
                toast.error("Não foi possível iniciar sua sessão.")
                return
            }

            if (usuario.nivelAcesso === 'ADMIN') {
                localStorage.setItem('token', dados.token)
                logaAdmin({
                    id: usuario.id,
                    email: usuario.email,
                    nome: usuario.email
                })
                toast.success("Login administrativo realizado com sucesso!")
                navigate("/admin", { replace: true })
                return
            }

            if (!logaCliente(dados.token)) {
                toast.error("Não foi possível iniciar sua sessão.")
                return
            }

            toast.success("Login realizado com sucesso!")
            navigate("/")
        } else {
            toast.error("Erro... Login ou senha incorretos")
        }
    }

    return (
        <section className="bg-claro-fundo dark:bg-escuro-fundo">
            <p style={{ height: 48 }}></p>
            <div className="flex flex-col items-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-claro-superficie rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-escuro-superficie dark:border-escuro-ciano">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-claro-texto md:text-2xl dark:text-escuro-texto">
                            Dados de Acesso do Cliente
                        </h1>
                        <form className="space-y-4 md:space-y-6" 
                           onSubmit={handleSubmit(verificaLogin)} >
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Seu e-mail</label>
                                <input type="email" id="email" 
                                       className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                       required 
                                       {...register("email")} />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Senha de Acesso</label>
                                <input type="password" id="password" 
                                       className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                       required 
                                       {...register("senha")} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="remember" 
                                               aria-describedby="remember" type="checkbox" 
                                               className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" 
                                               {...register("manter")} />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="remember" className="text-claro-texto dark:text-escuro-texto">Manter Conectado</label>
                                    </div>
                                </div>
                                <a href="#" className="text-sm font-medium text-claro-texto hover:underline dark:text-escuro-texto">Esqueceu sua senha?</a>
                            </div>
                            <button type="submit" className="w-full text-claro-button-texto bg-claro-button-fundo hover:bg-claro-button-fundo focus:ring-4 focus:outline-none focus:ring-claro-button-border font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-escuro-button-fundo dark:hover:bg-escuro-button-fundo dark:focus:ring-escuro-button-border">
                                Entrar
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Ainda não possui conta? <Link to="/cadastro-user" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Cadastre-se</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Toaster, toast } from 'sonner'
import { useAdminStore } from "./context/AdminContext"

import { useNavigate } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
  email: string
  senha: string
}

export default function AdminLogin() {
  const { register, handleSubmit, setFocus } = useForm<Inputs>()
  const navigate = useNavigate()
  const { logaAdmin } = useAdminStore()

  useEffect(() => {
    setFocus("email")
  }, [])

  async function verificaLogin(data: Inputs) {
    const response = await fetch(`${apiUrl}/admins/login`, {
      method: "POST",
      headers: { "Content-type": "Application/json" },
      body: JSON.stringify({ email: data.email, senha: data.senha })
    })

    // console.log(response)
    if (response.status == 200) {
      const admin = await response.json()
      logaAdmin(admin)
      navigate("/admin", { replace: true })
    } else if (response.status == 400) {
      toast.error("Erro... Login ou senha incorretos")
    }
  }

  return (
    <main className="max-w-screen-xl flex flex-col items-center mx-auto p-6 bg-claro-fundo dark:bg-escuro-fundo">
      <img src="../assets/Logo.png" alt="logo" style={{ width: 240 }}
        className="d-block" />
      <div className="w-full bg-claro-superficie rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-escuro-superficie dark:border-escuro-ciano">
        <h1 className="text-3xl font-bold my-8 text-claro-texto dark:text-escuro-texto">Admin: ET LANCHES</h1>
        <form className="max-w-sm mx-auto"
          onSubmit={handleSubmit(verificaLogin)} >
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">E-mail:</label>
            <input type="email" id="email" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500"
              {...register("email")}
              required />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-claro-texto dark:text-escuro-texto">Senha:</label>
            <input type="password" id="password" className="bg-claro-form-fundo border border-claro-form-border text-claro-form-texto rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-escuro-form-fundo dark:border-escuro-form-border dark:placeholder-gray-400 dark:text-escuro-form-texto dark:focus:ring-blue-500 dark:focus:border-blue-500"
              {...register("senha")}
              required />
          </div>
          <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Entrar</button>
        </form>
      </div>
      <Toaster richColors position="top-right" />
    </main>
  );
}

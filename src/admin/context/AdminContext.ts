import type { AdminType } from '../util/AdminType'
import { dadosDoToken } from '../../util/token'
import { create } from 'zustand'

function adminDoToken(token: string): AdminType | null {
    const dados = dadosDoToken(token)

    if (!dados || dados.nivelAcesso !== 'ADMIN') {
        return null
    }

    return {
        id: dados.id,
        email: dados.email,
        nome: dados.email
    }
}

const tokenSalvo = localStorage.getItem('token')
const adminInicial = tokenSalvo ? adminDoToken(tokenSalvo) : null

type AdminStore = {
    admin: AdminType
    logaAdmin: (adminLogado: AdminType) => void
    deslogaAdmin: () => void
}

export const useAdminStore = create<AdminStore>((set) => ({
    admin: adminInicial ?? {} as AdminType,
    logaAdmin: (adminLogado) => set({admin: adminLogado}),
    deslogaAdmin: () => {
        localStorage.removeItem('token')
        set({admin: {} as AdminType})
    }
}))

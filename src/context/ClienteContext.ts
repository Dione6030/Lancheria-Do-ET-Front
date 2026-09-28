import type { ClienteType } from '../util/ClienteType'
import { dadosDoToken } from '../util/token'
import { create } from 'zustand'

function clienteDoToken(token: string): ClienteType | null {
    const dados = dadosDoToken(token)

    if (!dados || dados.nivelAcesso !== 'CLIENTE') {
        return null
    }

    return {
        id: dados.id,
        email: dados.email,
        nome: dados.email
    }
}

const tokenSalvo = localStorage.getItem('token')
const clienteInicial = tokenSalvo ? clienteDoToken(tokenSalvo) : null

type ClienteStore = {
    cliente: ClienteType
    logaCliente: (token: string) => boolean
    deslogaCliente: () => void
}

export const useClienteStore = create<ClienteStore>((set) => ({
    cliente: clienteInicial ?? {} as ClienteType,
    logaCliente: (token) => {
        const cliente = clienteDoToken(token)

        if (!cliente) {
            return false
        }

        localStorage.setItem('token', token)
        set({ cliente })
        return true
    },
    deslogaCliente: () => {
        localStorage.removeItem('token')
        set({ cliente: {} as ClienteType })
    }
}))

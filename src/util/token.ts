export type UsuarioToken = {
    id: string
    email: string
    nivelAcesso: 'CLIENTE' | 'ADMIN'
}

export function dadosDoToken(token: string): UsuarioToken | null {
    try {
        const payload = token.split('.')[1]

        if (!payload) {
            return null
        }

        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
        const dados = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))

        if (
            (typeof dados.id !== 'number' && typeof dados.id !== 'string') ||
            typeof dados.email !== 'string' ||
            (dados.nivelAcesso !== 'CLIENTE' && dados.nivelAcesso !== 'ADMIN') ||
            (typeof dados.exp === 'number' && dados.exp * 1000 <= Date.now())
        ) {
            return null
        }

        return {
            id: String(dados.id),
            email: dados.email,
            nivelAcesso: dados.nivelAcesso
        }
    } catch {
        return null
    }
}

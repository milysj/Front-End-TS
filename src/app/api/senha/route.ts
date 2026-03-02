import {NextRequest, NextResponse} from 'next/server'

// Endpoint que lida com requisições POST para envio de email (ex: redefinição de senha)
export async function POST(request: NextRequest) {
    try {
        // Lê o corpo da requisição em formato JSON
        const body = await request.json()
        const {email} = body

        // Validação simples: verifica se o email foi fornecido
        if (!email) {
            return NextResponse.json(
                {sucesso: false, mensagem: 'Email é obrigatório.'},
                {status: 400} // Bad Request
            )
        }

        // Aqui você poderia integrar com um serviço de envio de emails
        // Por enquanto, apenas retorna sucesso simulando envio
        return NextResponse.json(
            {
                sucesso: true,
                mensagem: 'Email enviado com sucesso! Verifique sua caixa de entrada.'
            }
        )

    } catch (error) {
        // Captura e loga qualquer erro inesperado no servidor
        console.error('Erro no servidor:', error)
        return NextResponse.json(
            {
                sucesso: false,
                mensagem: 'Erro no servidor ao tentar enviar o email.'
            },
            {status: 500} // Internal Server Error
        )
    }
}

import {NextRequest, NextResponse} from 'next/server';

// Função que lida com requisições POST para autenticação
export async function POST(request: NextRequest) {
    try {
        // Recebe o corpo da requisição em formato JSON
        const body = await request.json();
        const {email, senha} = body;

        // Validação básica: verifica se email e senha foram fornecidos
        if (!email || !senha) {
            return NextResponse.json(
                {sucesso: false, mensagem: 'Email e senha são obrigatórios.'},
                {status: 400} // Bad Request
            );
        }

        // Validação de credenciais (simulada / hardcoded)
        // Retorna sucesso apenas se email e senha correspondem a combinações pré-definidas
        if (
            (email === 'admin@example.com' && senha === 'pisenha123') ||
            (email === 'teste@example.com' && senha === 'teste123pi') ||
            (email === '1@1' && senha === '1')
        ) {
            return NextResponse.json({sucesso: true, mensagem: 'Login realizado com sucesso!'});
        } else {
            // Credenciais inválidas
            return NextResponse.json(
                {sucesso: false, mensagem: 'Credenciais inválidas.'},
                {status: 401} // Unauthorized
            );
        }
    } catch (error) {
        // Captura e loga qualquer erro inesperado no servidor
        console.error('Erro no servidor:', error);
        return NextResponse.json(
            {sucesso: false, mensagem: 'Erro no servidor.'},
            {status: 500} // Internal Server Error
        );
    }
}

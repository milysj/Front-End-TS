# EstudeMy — Front-End

Aplicação web do **EstudeMy**, plataforma de estudos **gamificada** voltada a tornar o aprendizado mais dinâmico. Professores podem organizar cursos, trilhas e conteúdos; alunos percorrem trilhas, acompanham progresso, ranking e conquistas. Este repositório contém o **front-end** em **Next.js** (App Router), que se comunica com uma **API Java (Spring Boot)**.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Requisitos](#requisitos)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts npm](#scripts-npm)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Rotas principais](#rotas-principais)
- [Autenticação e middleware](#autenticação-e-middleware)
- [Integração com a API](#integração-com-a-api)
- [Testes](#testes)
- [Docker](#docker)
- [Build e deploy](#build-e-deploy)
- [Colaboradores](#colaboradores)

---

## Funcionalidades

- **Conta e perfil**: cadastro, login, recuperação de senha, confirmação de e-mail, dados pessoais, personagem, configurações (tema/idioma conforme integração com API).
- **Trilhas e cursos**: busca, trilha, curso, conteúdo, lições salvas, “meus cursos”.
- **Gestão (fluxos administrativos na UI)**: criar trilha/fase, gerenciar trilha, fases e perguntas.
- **Gamificação**: progresso, ranking, conquistas, barra de experiência.
- **Jogo educativo**: experiência com **Phaser** (páginas em `/game`).
- **Outros**: FAQ, fale conosco, feedback, NPS, calendário (**FullCalendar**), assistente (**Consult AI** — conforme backend).

---

## Stack tecnológica

| Área | Tecnologia |
|------|------------|
| Framework | [Next.js](https://nextjs.org/) 15 (App Router) |
| UI | [React](https://react.dev/) 19 |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Estilo | [Tailwind CSS](https://tailwindcss.com/) 4, [Bootstrap](https://getbootstrap.com/) / [react-bootstrap](https://react-bootstrap.github.io/) |
| Componentes | [Radix UI](https://www.radix-ui.com/), ícones ([Lucide](https://lucide.dev/), [react-bootstrap-icons](https://www.npmjs.com/package/react-bootstrap-icons)) |
| HTTP | [Axios](https://axios-http.com/) |
| Animações | [Framer Motion](https://www.framer.com/motion/) |
| Tema | [next-themes](https://github.com/pacocoursey/next-themes) |
| Jogo | [Phaser](https://phaser.io/) 3 |
| Testes | [Jest](https://jestjs.io/), [Testing Library](https://testing-library.com/) |
| Lint | [ESLint](https://eslint.org/) + `eslint-config-next` |

---

## Requisitos

- **Node.js** 20 ou superior (recomendado alinhar com o `dockerfile`, que usa Node 20).
- **npm** (instalação via `package-lock.json` com `npm ci` ou `npm install`).
- **Backend Spring Boot** acessível na URL configurada em `NEXT_PUBLIC_API_URL` (padrão no código: `http://localhost:8080`).

---

## Como rodar localmente

```bash
# Clonar o repositório
git clone <url-do-repositório>
cd Front-End-TS

# Instalar dependências
npm ci
# ou: npm install

# Criar .env.local (veja seção Variáveis de ambiente)
# Depois:
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O dev server usa **Turbopack** (`next dev --turbopack`).

---

## Variáveis de ambiente

Crie um arquivo **`.env.local`** na raiz do projeto (não commite segredos).

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API Java (Spring Boot) | `http://localhost:8080` |

A URL padrão usada quando a variável não está definida está em `src/app/config/api.config.ts`.

> **Nota:** variáveis com prefixo `NEXT_PUBLIC_` são embutidas no bundle no **build**. Para produção (incluindo imagem Docker), ajuste o ambiente **no momento do build** se precisar de outra API.

---

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção com Turbopack |
| `npm run vercel-build` | Build de produção com `next build` (sem Turbopack) |
| `npm start` | Sobe a app após `build` (porta padrão 3000) |
| `npm run lint` | ESLint |
| `npm test` | Jest (todos os testes) |
| `npm run test:watch` | Jest em modo watch |
| `npm run test:coverage` | Cobertura de testes |

---

## Estrutura do projeto

```
Front-End-TS/
├── src/
│   ├── app/                 # App Router: páginas, layouts, API routes, componentes de feature
│   │   ├── api/             # Route Handlers Next (ex.: login, register, senha)
│   │   ├── components/      # Componentes específicos das telas
│   │   ├── contexts/        # React Context (ex.: Auth)
│   │   ├── hooks/           # Hooks reutilizáveis
│   │   ├── services/        # Chamadas HTTP, helpers de auth
│   │   └── config/          # api.config.ts — base URL e endpoints
│   ├── components/ui/       # Componentes de UI compartilhados
│   └── lib/                 # Utilitários (ex.: `cn` para classes)
├── public/                  # Assets estáticos
├── middleware.ts            # Middleware Next (rotas públicas listadas)
├── next.config.ts           # Configuração Next.js
├── jest.config.js           # Jest
├── dockerfile               # Imagem Docker (produção)
└── package.json
```

**Alias:** imports com `@/` apontam para `src/` (ver `tsconfig.json`).

---

## Rotas principais

Páginas sob `src/app/*/page.tsx` (URLs em camelCase como no App Router):

| Rota | Área |
|------|------|
| `/` | Landing |
| `/login`, `/cadastro`, `/recuperar-senha`, `/verificarEmail`, `/confirmar`, `/email-enviado`, `/reenviar-verificacao` | Autenticação e e-mail |
| `/home` | Home autenticada / hub |
| `/busca`, `/trilha`, `/curso`, `/conteudo`, `/meusCursos`, `/salvas` | Conteúdo e trilhas |
| `/ranking`, `/personagem`, `/perfil`, `/dadosPessoais`, `/conta`, `/configuracoes` | Perfil e gamificação |
| `/criarPerfil`, `/criarFase`, `/gerenciarTrilha`, `/gerenciarFases`, `/gerenciarPerguntas` | Criação / gestão |
| `/game` | Jogo (Phaser) |
| `/faq`, `/faleConosco`, `/feedback`, `/consultAi` | Suporte e extras |

Há também **API Routes** em `src/app/api/` (ex.: `login`, `register`, `senha`).

---

## Autenticação e middleware

- **`AuthContext`** (`src/app/contexts/AuthContext.tsx`): estado de sessão no cliente.
- **`ProtectedRoute`**: proteção de rotas no **cliente** (o `localStorage` não está disponível no middleware).
- **`middleware.ts`**: define **rotas públicas** (ex.: `/`, `/login`, `/cadastro`, `/home`, `/recuperar-senha`) e deixa as demais passarem; a checagem forte fica no cliente.

---

## Integração com a API

- Configuração central: **`src/app/config/api.config.ts`** — `API_BASE_URL`, timeout e constantes **`API_ENDPOINTS`** (auth, usuários, trilhas, fases, progresso, ranking, etc.).
- Cliente HTTP: serviços em `src/app/services/` usando essa base URL.

Garanta que o backend exponha CORS e os endpoints esperados, ou ajuste os paths em `API_ENDPOINTS` conforme o contrato real da API.

---

## Testes

Resumo rápido:

```bash
npm test
npm run test:watch
npm run test:coverage
```

Documentação complementar: **[README_TESTES.md](./README_TESTES.md)** (guia rápido) e **[TESTES.md](./TESTES.md)** (detalhes).

---

## Docker

O repositório inclui um **`dockerfile`** (nome em minúsculas) em duas etapas: build com Node 20 e imagem final Alpine com `npm start`.

**Build:**

```bash
docker build -f dockerfile -t estudemy-frontend .
```

**Executar:**

```bash
docker run -p 3000:3000 estudemy-frontend
```

**Observações:**

- O `dockerfile` aplica um passo que gera um `next.config.js` mínimo no container para ignorar ESLint no build; o restante do projeto usa `next.config.ts` localmente.
- Para apontar a API correta em produção, configure `NEXT_PUBLIC_API_URL` no **build** da imagem (por exemplo estendendo o `dockerfile` com `ARG`/`ENV` antes do `RUN npm run build`) ou use a estratégia de deploy da sua plataforma.

---

## Build e deploy

1. Defina `NEXT_PUBLIC_API_URL` para o ambiente alvo.
2. Execute `npm run build` (ou `npm run vercel-build` em pipelines que evitam Turbopack).
3. `npm start` ou use a imagem Docker conforme acima.

Plataformas como **Vercel** costumam usar o script `vercel-build` quando configurado no painel.

---

## Colaboradores

| Nome | Função |
|------|--------|
| João Milone | Frontend / Backend |
| João Quaresma | Frontend / Backend |
| Gabriel Lupateli | Product Owner |
| Beatriz Siqueira | Scrum Master |


---

## Licença

Projeto **privado** (`"private": true` no `package.json`). Ajuste esta secção se houver licença explícita no repositório.

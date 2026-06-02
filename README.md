# EstudeMy — Front-End 🎮📚

Aplicação web do **EstudeMy**, uma plataforma de estudos **gamificada** e interativa projetada para tornar o aprendizado envolvente e dinâmico. Professores e administradores gerenciam cursos, trilhas e conteúdos de aprendizagem; os alunos percorrem trilhas de conhecimento, resolvem desafios, acompanham seu progresso e competem em rankings saudáveis com base em conquistas.

Este repositório contém o código-fonte do **front-end** desenvolvido em **Next.js 15 (App Router)** com **TypeScript** e **Tailwind CSS v4**, o qual consome uma API RESTful em **Java (Spring Boot)**.

---

## 📌 Links Rápidos para Documentações Detalhadas

*   ♿ **[Guia de Acessibilidade](./ACESSIBILIDADE.md)** — Detalhes sobre conformidade (WCAG/LBI), componentes e hooks acessíveis.
*   🧪 **[Guia de Testes Jest](./TESTES.md)** & **[Guia Rápido de Testes](./README_TESTES.md)** — Princípios, matchers, exemplos e como escrever testes.
*   📡 **[Configuração da API Java](./CONFIG_API.md)** — Como funciona a integração, endpoints e configuração CORS.
*   🎵 **[Estrutura de Áudio do Projeto](./AUDIO_STRUCTURE.md)** — Organização de arquivos de áudio e integração de volume no jogo.

---

## 🗂️ Sumário

- [Funcionalidades Principais](#-funcionalidades-principais)
- [Stack Tecnológica](#-stack-tecnológica)
- [Requisitos do Sistema](#-requisitos-do-sistema)
- [Configuração de Ambientes](#-configuração-de-ambientes)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Scripts npm](#-scripts-npm)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Rotas da Aplicação](#-rotas-da-aplicação)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Integração e Comunicação com a API](#-integração-e-comunicação-com-a-api)
- [Arquitetura de Testes (Jest & Vitest)](#-arquitetura-de-testes-jest--vitest)
- [Docker e Docker Compose](#-docker-e-docker-compose)
- [Build e Deploy](#-build-e-deploy)
- [Colaboradores](#-colaboradores)
- [Licença](#-licença)

---

## 🚀 Funcionalidades Principais

### 👤 Perfil e Gamificação
*   **Gestão de Conta**: Cadastro, login, recuperação de senha, confirmação de e-mail e dados pessoais.
*   **Avatar/Personagem**: Seleção de personagem com customização de sprite e preview visual.
*   **Gamificação Ativa**: Acompanhamento de nível, barra de experiência (**XP**), conquistas/medalhas e ranking dinâmico de alunos.
*   **Efeitos Visuais**: Chuva de moedas animada (`CoinRain`) ao completar fases e conquistar recompensas.

### 🗺️ Trilhas e Aprendizado
*   **Fluxo de Cursos**: Busca avançada de trilhas por matéria, nível e popularidade.
*   **Conteúdos e Lições**: Lições interativas, marcação de favoritas (lições salvas) e acompanhamento de progresso.
*   **Geração com Inteligência Artificial**: Assistente integrado para geração automática de trilhas personalizadas (`GerarTrilhaIaDialog`) com base em tópicos solicitados pelo aluno.

### 🎮 Integração de Jogos (RPG Quiz)
O projeto conta com suporte a duas abordagens de jogos educacionais integradas:
1.  **Jogo Interno (Phaser 3)**: Motor Phaser rodando localmente (na rota `/game`), com animações completas (idle, ataque, dano) e gerenciamento local de volume para música de fundo e efeitos sonoros (SFX).
2.  **Jogo Externo (GameMaker HTML5)**: Iframe em tela cheia (na rota `/test-game-pi`) integrado com um jogo HTML5 compilado no GameMaker. Os dados da fase são injetados de maneira otimizada na window (`window.gameData`), convertendo respostas em índices numéricos e utilizando chaves minificadas exigidas pelo compilador do GameMaker (ex: `_q5`, `_s5`, `_M5`).

### 🤖 Assistente Virtual (IA)
*   **ConsultAI (`/consultAi`)**: Chatbot com inteligência artificial integrado diretamente na interface do aluno para responder dúvidas de conteúdo e auxiliar no processo de estudos.

### 🛡️ Painel de Administração (`/painel-admin`)
Dashboard de uso restrito a perfis administrativos (ADMINISTRADOR e OWNER):
*   **Gestão de Usuários**: Visualização de lista de cadastrados, alteração de níveis de acesso, banimento, bloqueio temporário (com expiração por data/hora local) e exclusão definitiva de contas.
*   **Gestão de Matérias**: Cadastro, edição e remoção de matérias básicas do sistema para posterior associação a trilhas.

### ♿ Acessibilidade (i18n & A11y)
*   **Internacionalização (i18n)**: Suporte completo a **Português (pt-BR)**, **Inglês (en-US)** e **Espanhol (es-ES)** via `LanguageContext`. O idioma é definido automaticamente por geolocalização do navegador/localStorage, atualiza os textos dinamicamente e é sincronizado com o perfil do usuário no backend.
*   **Design Acessível**: Skip links para navegação rápida, controle de foco visual (`focus-visible`), textos alternativos descritivos e componentes reutilizáveis acessíveis (`PageWrapper`, `AccessibleButton`, `AccessibleInput`, `AccessibleImage`).
*   **Leitores de Tela**: Anúncios de alteração de estados (`aria-live`) e anúncios de loading acessíveis.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia | Detalhes / Versão |
| :--- | :--- | :--- |
| **Framework Web** | [Next.js](https://nextjs.org/) | Versão 15.5+ (App Router, standalone production) |
| **Biblioteca UI** | [React](https://react.dev/) | Versão 19.2+ (Client e Server Components) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | Tipagem estática forte em toda a base de código |
| **Estilização** | [Tailwind CSS](https://tailwindcss.com/) & [Bootstrap](https://getbootstrap.com/) | Tailwind CSS v4, Bootstrap 5 / React Bootstrap |
| **Componentes de UI** | [Radix UI](https://www.radix-ui.com/) | Primitivos acessíveis sem estilização engessada (Dialog, Dropdown) |
| **Ícones** | [Lucide React](https://lucide.dev/) | Ícones vetorizados consistentes |
| **Comunicação HTTP** | [Axios](https://axios-http.com/) | Cliente com interceptores globais para token JWT e erros |
| **Animações** | [Framer Motion](https://www.framer.com/motion/) | Animações de transição de tela e micro-interações |
| **Motor de Jogo** | [Phaser](https://phaser.io/) | Phaser v3.90+ para o RPG Quiz nativo |
| **Ambiente de Testes** | [Jest](https://jestjs.io/) / [Vitest](https://vitest.dev/) | Jest para testes de código e Vitest para integração Storybook |
| **Ferramenta de Design** | [Storybook](https://storybook.js.org/) | Isolamento, documentação e testes de componentes visuais |

---

## 📋 Requisitos do Sistema

*   **Node.js**: Versão `20.x` ou `22.x` (LTS recomendada).
*   **Gerenciador de Pacotes**: `npm` v10 ou superior (incluído com o Node).
*   **Backend Spring Boot**: Instância ativa acessível.

---

## ⚙️ Configuração de Ambientes

O projeto suporta múltiplos ambientes configurados por variáveis de ambiente. Os arquivos `.env.*.example` estão presentes na raiz para servir como modelo.

Copie e preencha os arquivos base conforme a necessidade:

```bash
# Desenvolvimento Local (padrão)
cp .env.hml.example .env.local

# Homologação
cp .env.hml.example .env.hml

# Produção
cp .env.prod.example .env.prod
```

### Variáveis Suportadas

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base do backend Spring Boot | `http://localhost:8080` (Local) / `http://localhost:5003` (HML) |
| `PORT` | Porta alternativa de execução do servidor Next.js | `3000` (Local) / `3003` (HML) / `3004` (PROD) |

---

## 💻 Como Rodar Localmente

1.  **Clonar o Repositório**:
    ```bash
    git clone https://github.com/milysj/Front-End-TS.git
    cd Front-End-TS
    ```

2.  **Instalar Dependências**:
    Recomenda-se o uso do `npm ci` para garantir consistência com o `package-lock.json`:
    ```bash
    npm ci
    ```

3.  **Iniciar Servidor de Desenvolvimento**:
    O projeto utiliza o compilador **Turbopack** para carregamento rápido:
    ```bash
    npm run dev
    ```

4.  **Acessar a Aplicação**:
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## ⌨️ Scripts npm

O `package.json` disponibiliza comandos especializados para gerenciamento e automação:

| Script | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento (Turbopack). |
| `npm run dev:hml` | Inicia o servidor de desenvolvimento apontando para o ambiente de **Homologação** (`.env.hml`). |
| `npm run dev:prod` | Inicia o servidor de desenvolvimento apontando para o ambiente de **Produção** (`.env.prod`). |
| `npm run build` | Cria a build otimizada de produção utilizando Turbopack. |
| `npm run build:hml` | Compila o build de produção configurado para **Homologação**. |
| `npm run build:prod` | Compila o build de produção configurado para **Produção**. |
| `npm start` | Executa o servidor de produção Next.js localmente na porta padrão (3000). |
| `npm run start:hml` | Executa o servidor de produção localmente utilizando as variáveis de **Homologação**. |
| `npm run start:prod` | Executa o servidor de produção localmente utilizando as variáveis de **Produção**. |
| `npm run lint` | Executa a verificação estática do ESLint. |
| `npm run vercel-build` | Executa o build padrão do Next.js sem Turbopack (ideal para pipelines tradicionais). |
| `npm test` | Executa todos os testes unitários via **Jest**. |
| `npm run test:watch` | Executa os testes Jest em modo interativo de monitoramento (watch). |
| `npm run test:coverage` | Executa os testes Jest e gera o relatório completo de cobertura de código. |
| `npm run storybook` | Inicia o painel do Storybook local na porta `6006`. |
| `npm run build-storybook`| Compila o Storybook em uma aplicação estática pronta para deploy. |

---

## 📂 Estrutura de Diretórios

```
Front-End-TS/
├── .github/                 # Workflows de CI/CD do GitHub Actions
├── .storybook/              # Configurações globais e addons do Storybook
├── public/                  # Arquivos estáticos servidos diretamente pelo Next.js
│   ├── audio/               # Estrutura de áudios (músicas, sfx de ataques, interface)
│   ├── game-pi/             # Build compilado do jogo HTML5 em GameMaker
│   └── img/                 # Imagens gerais, assets e backgrounds do sistema
├── src/
│   ├── app/                 # App Router (Páginas, Layouts e Módulos principais)
│   │   ├── api/             # API routes intermediárias do Next.js
│   │   ├── components/      # Componentes React específicos de páginas e recursos
│   │   │   ├── accessibility/# Componentes focados em Acessibilidade (PageWrapper, AccessibleButton)
│   │   │   └── game/        # Componentes e views de interface do jogo RPG
│   │   ├── config/          # Centralização de endpoints (api.config.ts)
│   │   ├── contexts/        # Provedores de estado global (AuthContext, LanguageContext)
│   │   ├── hooks/           # Custom hooks reutilizáveis (useAccessibility, useBackgroundImage)
│   │   ├── locales/         # Traduções JSON dinâmicas (pt-BR, en-US, es-ES)
│   │   ├── services/        # Consumo de API (Axios cliente com interceptadores)
│   │   └── utils/           # Funções auxiliares gerais e lógica de acessibilidade
│   ├── lib/                 # Utilitários compartilhados (como a função cn)
│   └── middleware.ts        # Regras de proteção de rotas e segurança
├── dockerfile               # Dockerfile multi-stage otimizado para produção (standalone)
├── docker-compose.yml       # Orquestração local do container frontend
├── eslint.config.mjs        # Configuração do linter de código
├── jest.config.js           # Configurações de testes unitários com Jest
├── next.config.ts           # Configuração de builds e comportamentos do Next.js
├── tsconfig.json            # Configuração do compilador TypeScript
└── vitest.config.ts         # Configuração de testes de histórias do Storybook usando Vitest
```

---

## 🧭 Rotas da Aplicação

Rotas ativas estruturadas no App Router (páginas sob `src/app/*/page.tsx`):

| Rota | Descrição / Acesso |
| :--- | :--- |
| `/` | Landing page institucional e recursos. |
| `/login`, `/cadastro` | Autenticação básica e criação de conta. |
| `/recuperar-senha` | Fluxo de redefinição de credenciais. |
| `/verificarEmail`, `/confirmar` | Telas de validação de e-mail e ativação de conta. |
| `/home` | Dashboard central do aluno (Visualização de Trilhas). |
| `/busca` | Sistema de pesquisa de cursos e disciplinas. |
| `/trilha`, `/curso`, `/conteudo` | Páginas de navegação e consumo das lições. |
| `/meusCursos`, `/salvas` | Conteúdos em andamento e lições favoritas do aluno. |
| `/perfil`, `/dadosPessoais`, `/conta` | Configuração de dados de usuário, segurança e avatar. |
| `/configuracoes` | Painel de preferências (Troca de Tema e Idioma). |
| `/ranking` | Tabela dinâmica de classificação dos usuários (Gamificação). |
| `/game` | Jogo de RPG Quiz rodando no motor **Phaser 3**. |
| `/test-game-pi` | Jogo de RPG Quiz executado a partir do build do **GameMaker**. |
| `/consultAi` | Chat interativo com inteligência artificial para dúvidas. |
| `/painel-admin` | Controle do administrador (Usuários e Matérias). |

---

## 🔐 Autenticação e Segurança

A segurança é implementada em duas frentes integradas:

1.  **AuthContext & LocalStorage**: Armazena o token JWT obtido durante o login. Os dados básicos do usuário são decodificados para popular o estado global da aplicação.
2.  **Interceptador Axios (`src/app/services/api.ts`)**: Adiciona automaticamente o header `Authorization: Bearer <token>` em todas as requisições enviadas ao backend. Captura respostas `401 Unauthorized` e redireciona automaticamente o usuário para `/login`, limpando a sessão.
3.  **Middleware Next.js (`middleware.ts`)**: Executa validações em nível de borda (Edge). Embora a validação do token ocorra estritamente no client (pela indisponibilidade do `localStorage` no servidor), o middleware atua definindo rotas públicas e restringindo acessos diretos.

---

## 📡 Integração e Comunicação com a API

Toda a infraestrutura de comunicação com o backend Java (Spring Boot) está centralizada para facilitar a manutenção:

*   **Configuração Central (`src/app/config/api.config.ts`)**: Define constantes com caminhos relativos de todos os endpoints agrupados por escopo (Ex: `API_ENDPOINTS.AUTH.LOGIN`, `API_ENDPOINTS.TRILHAS.LISTAR`).
*   **Serviços Customizados (`src/app/services/`)**:
    *   `api.ts`: Centraliza a instância do Axios com configurações de timeout, baseURL e interceptores.
    *   `faseService.js`, `usuarioService.js`: Encapsulam as regras de consulta de dados, garantindo separação de responsabilidades.

---

## 🧪 Arquitetura de Testes (Jest & Vitest)

O ecossistema de testes do projeto é dividido para melhor desempenho e cobertura:

### 1. Testes Unitários e Funcionais (Jest)
Focado no teste de funções utilitárias, comportamento de componentes de acessibilidade e segurança do fluxo de autenticação.
*   **Comandos**: `npm test` ou `npm run test:coverage`
*   **Setup**: Configurado em `jest.config.js` e inicializado globalmente com `jest.setup.js` (mockando APIs globais e o `localStorage`).

### 2. Testes de Histórias (Vitest + Storybook)
Focado em testar a renderização dos componentes visuais documentados no Storybook de forma isolada, simulando interações com o usuário em um navegador virtual.
*   **Configuração**: `vitest.config.ts` utiliza o plugin `@storybook/addon-vitest` e o provider Playwright para iniciar instâncias Chromium em modo headless.

---

## 🐳 Docker e Docker Compose

O deploy local ou em ambiente de produção pode ser simulado de forma rápida com Docker.

### Dockerfile Multi-Stage (`dockerfile`)
A build é dividida em três fases para reduzir o tamanho da imagem final:
1.  **deps**: Instala as dependências de produção limpando dados desnecessários (`npm ci`).
2.  **builder**: Importa dependências, define variáveis de ambiente do build (como a `NEXT_PUBLIC_API_URL`) e gera o build do Next.js no formato **standalone** (`next build`).
3.  **runner**: Instancia um container Alpine leve (Node 22), copia os assets estáticos e a pasta standalone, cria e executa o processo com um usuário restrito (`nextjs`) para maior segurança.

### Executando com docker-compose

Para subir a aplicação localmente via Docker apontando para o seu backend:

```bash
# Definir a variável e rodar
NEXT_PUBLIC_API_URL=http://localhost:8080 docker-compose up --build -d
```

A aplicação estará disponível na porta definida em seu compose (padrão `3000`).

---

## 📦 Build e Deploy

Para ambientes que não suportam Turbopack durante a compilação (ex: Vercel ou algumas ferramentas de CI):

1.  Defina a URL de backend correta na variável `NEXT_PUBLIC_API_URL`.
2.  Execute o script alternativo:
    ```bash
    npm run vercel-build
    ```
3.  Inicie a aplicação:
    ```bash
    npm run start
    ```

---

## 👥 Colaboradores

Agradecemos às seguintes pessoas que contribuíram para o desenvolvimento deste projeto:

| Nome | Função |
| :--- | :--- |
| **João Milone** | FullStack Developer |
| **João Quaresma** | FullStack Developer |
| **Gabriel Lupateli** | Product Owner (PO) |
| **Beatriz Siqueira** | Scrum Master (SM) |

---

## 📄 Licença

Este projeto é **privado** e de uso restrito conforme as definições de `"private": true` no arquivo `package.json`. Todos os direitos reservados.

# Blueprint - Jornada do Usuário
## Estrutura Básica do BluePrint

Este documento descreve a jornada do usuário através do sistema Estude.My utilizando a metodologia de Service Blueprint.

---

## 📋 Estrutura do Blueprint

| Camada | Descrição |
|--------|-----------|
| **Ações do usuário** | O que o usuário faz ao longo do serviço |
| **Ações de contato visíveis (frontstage)** | Interações que o usuário vê (ex: atendimento, interfaces) |
| **Ações de apoio invisíveis (backstage)** | Processos e pessoas que trabalham "nos bastidores", sem contato direto |
| **Processos de suporte** | Sistemas, ferramentas e fluxos que mantêm o serviço funcionando |
| **Evidências físicas ou digitais** | Elementos tangíveis (e-mails, notas, apps, documentos etc.) |

---

## 🎯 Jornada 1: Cadastro e Primeiro Acesso

### Fase: Descoberta e Cadastro

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa a landing page<br>• Visualiza informações sobre a plataforma<br>• Clica em "Cadastrar" ou "Começar"<br>• Preenche formulário de cadastro (nome, email, senha)<br>• Aceita termos de uso<br>• Confirma cadastro |
| **Ações de contato visíveis (frontstage)** | • Interface da landing page com informações e CTAs<br>• Formulário de cadastro com validação em tempo real<br>• Mensagens de feedback (sucesso/erro)<br>• Tela de confirmação de cadastro<br>• Redirecionamento para login ou onboarding |
| **Ações de apoio invisíveis (backstage)** | • Validação de dados no backend<br>• Verificação de email duplicado<br>• Hash de senha (bcrypt)<br>• Criação de registro no banco de dados<br>• Geração de token de autenticação<br>• Envio de email de boas-vindas (se configurado) |
| **Processos de suporte** | • API de autenticação (`/api/auth/register`)<br>• Serviço de validação de dados<br>• Sistema de hash de senhas<br>• Banco de dados (MongoDB/PostgreSQL)<br>• Sistema de logs<br>• Monitoramento de erros |
| **Evidências físicas ou digitais** | • Landing page (`src/app/page.tsx`)<br>• Página de cadastro (`src/app/cadastro/page.tsx`)<br>• Formulário de cadastro<br>• Mensagens de feedback na tela<br>• Email de confirmação (se aplicável)<br>• Token JWT armazenado no localStorage |

---

## 🎮 Jornada 2: Login e Acesso ao Sistema

### Fase: Autenticação

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página de login<br>• Insere email/username e senha<br>• Clica em "Entrar"<br>• Opcionalmente marca "Lembrar-me"<br>• Se esqueceu a senha, clica em "Esqueci minha senha" |
| **Ações de contato visíveis (frontstage)** | • Interface de login com campos de email e senha<br>• Botão de toggle para mostrar/ocultar senha<br>• Link "Esqueci minha senha"<br>• Mensagens de erro de autenticação<br>• Loading durante o processo<br>• Redirecionamento após login bem-sucedido |
| **Ações de apoio invisíveis (backstage)** | • Validação de credenciais no backend<br>• Comparação de hash de senha<br>• Geração de token JWT<br>• Verificação de status da conta (ativa/bloqueada)<br>• Registro de tentativa de login (logs de segurança) |
| **Processos de suporte** | • API de autenticação (`/api/auth/login`)<br>• Serviço de validação de credenciais<br>• Sistema de tokens JWT<br>• Middleware de autenticação<br>• Interceptores Axios para adicionar token<br>• Sistema de logs de segurança |
| **Evidências físicas ou digitais** | • Página de login (`src/app/login/page.tsx`)<br>• Componente Login (`src/app/components/Login.tsx`)<br>• Token JWT no localStorage<br>• Headers HTTP com Authorization Bearer<br>• Logs de autenticação no servidor |

---

## 🎓 Jornada 3: Navegação e Exploração de Trilhas

### Fase: Descoberta de Conteúdo

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página inicial após login<br>• Navega pelo menu de trilhas<br>• Visualiza trilhas disponíveis<br>• Filtra por categoria, popularidade ou novidades<br>• Visualiza detalhes de uma trilha<br>• Salva trilha nos favoritos<br>• Inicia uma trilha |
| **Ações de contato visíveis (frontstage)** | • Dashboard/home com trilhas em destaque<br>• Lista de trilhas com cards informativos<br>• Filtros e busca<br>• Modal/tooltip com descrição da trilha<br>• Botão "Salvar" ou "Favoritar"<br>• Botão "Começar" ou "Iniciar"<br>• Indicador de progresso da trilha |
| **Ações de apoio invisíveis (backstage)** | • Busca de trilhas no banco de dados<br>• Cálculo de popularidade baseado em acessos<br>• Verificação de trilhas salvas do usuário<br>• Verificação de progresso do usuário<br>• Criação de registro de trilha salva<br>• Atualização de estatísticas de visualização |
| **Processos de suporte** | • API de trilhas (`/api/trilhas`)<br>• API de lições salvas (`/api/licoes-salvas`)<br>• API de progresso (`/api/progresso`)<br>• Serviço de busca e filtragem<br>• Sistema de cache (se aplicável)<br>• Algoritmo de recomendação |
| **Evidências físicas ou digitais** | • Página home (`src/app/home/page.tsx`)<br>• Componente de trilhas (`src/app/components/Triha.tsx`)<br>• Cards de trilhas<br>• Filtros na interface<br>• Estado de "salvo" persistido<br>• Progresso visual nas trilhas |

---

## 🎯 Jornada 4: Jogando o RPG Quiz

### Fase: Experiência de Jogo

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Seleciona uma fase na trilha<br>• Clica em "Começar"<br>• Visualiza personagem escolhido<br>• Lê pergunta exibida<br>• Seleciona resposta entre as alternativas<br>• Observa animação de ataque (se acertar)<br>• Observa dano recebido (se errar)<br>• Usa habilidades especiais quando disponíveis<br>• Completa a fase ou é derrotado<br>• Visualiza tela de vitória/derrota<br>• Clica em "Continuar" ou "Sair" |
| **Ações de contato visíveis (frontstage)** | • Tela de loading do jogo<br>• Interface do jogo RPG com personagens<br>• Balão de pergunta com alternativas<br>• Balão de status (HP, Mana, Especial)<br>• Painel de ações (ataques/itens)<br>• Animações de combate<br>• Efeitos visuais de dano<br>• Barra de especial (5 gomos)<br>• Tela de vitória/derrota com estatísticas<br>• Botões de ação (Continuar/Sair) |
| **Ações de apoio invisíveis (backstage)** | • Carregamento de perguntas da fase<br>• Busca do personagem escolhido pelo usuário<br>• Cálculo de HP/Mana baseado no nível do usuário<br>• Lógica de combate (dano, críticos)<br>• Verificação de resposta correta/incorreta<br>• Cálculo de pontuação<br>• Atualização de progresso<br>• Registro de respostas do usuário<br>• Embaralhamento aleatório de perguntas |
| **Processos de suporte** | • API de fases (`/api/fases/${faseId}`)<br>• API de usuário (`/api/users/me` para nível/personagem)<br>• API de progresso (`/api/progresso/usuario`)<br>• API de conclusão (`/api/fases/concluir`)<br>• Motor de jogo (Phaser.js)<br>• Sistema de cálculo de status (HP/Mana por nível)<br>• Sistema de embaralhamento de perguntas<br>• Banco de dados de perguntas e respostas |
| **Evidências físicas ou digitais** | • Página do jogo (`src/app/game/page.tsx`)<br>• Componente RPGQuizGame (`src/app/components/game/RPGQuizGame.tsx`)<br>• GameScene (`src/app/game/GameScene.ts`)<br>• Sprites de personagens<br>• Animações GIF (idle, ataque)<br>• Perguntas e alternativas exibidas<br>• Estatísticas de jogo (acertos, erros)<br>• Pontuação calculada |

---

## 📊 Jornada 5: Visualização de Progresso e Perfil

### Fase: Acompanhamento

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página de perfil<br>• Visualiza estatísticas pessoais<br>• Verifica nível e experiência<br>• Visualiza trilhas concluídas<br>• Acessa ranking<br>• Compara desempenho com outros usuários<br>• Atualiza informações pessoais |
| **Ações de contato visíveis (frontstage)** | • Página de perfil com informações do usuário<br>• Barra de experiência e nível<br>• Estatísticas (acertos, erros, trilhas concluídas)<br>• Tabela de ranking<br>• Formulário de edição de perfil<br>• Foto de perfil<br>• Informações do personagem escolhido |
| **Ações de apoio invisíveis (backstage)** | • Busca de dados do usuário<br>• Cálculo de nível baseado em XP<br>• Agregação de estatísticas<br>• Cálculo de posição no ranking<br>• Validação de dados ao atualizar perfil<br>• Upload e processamento de imagem (se aplicável) |
| **Processos de suporte** | • API de usuário (`/api/users/me`)<br>• API de progresso (`/api/progresso/usuario`)<br>• API de ranking (`/api/ranking`)<br>• API de atualização (`/api/users/dados-pessoais`)<br>• Sistema de cálculo de nível<br>• Sistema de ranking e comparação |
| **Evidências físicas ou digitais** | • Página de perfil (`src/app/perfil/page.tsx`)<br>• Componente de barra de experiência (`src/app/components/ExperienceBar.tsx`)<br>• Componente de ranking (`src/app/components/Ranking.tsx`)<br>• Dados do usuário exibidos<br>• Gráficos ou visualizações de progresso |

---

## ⚙️ Jornada 6: Configurações e Personalização

### Fase: Customização

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página de configurações<br>• Altera tema (claro/escuro)<br>• Altera idioma<br>• Altera personagem<br>• Atualiza username<br>• Configura preferências de acessibilidade<br>• Salva alterações |
| **Ações de contato visíveis (frontstage)** | • Interface de configurações<br>• Toggle de tema<br>• Seletor de idioma<br>• Galeria de personagens<br>• Campo de edição de username<br>• Opções de acessibilidade<br>• Mensagens de confirmação<br>• Validação em tempo real |
| **Ações de apoio invisíveis (backstage)** | • Validação de username único<br>• Atualização de preferências no banco<br>• Aplicação de tema/idioma globalmente<br>• Verificação de disponibilidade de personagem<br>• Salvamento de configurações<br>• Sincronização entre dispositivos (se aplicável) |
| **Processos de suporte** | • API de usuário (`/api/users/me`)<br>• API de atualização (`/api/users/atualizar-personagem`)<br>• API de verificação (`/api/users/verify` para username)<br>• Sistema de temas (ThemeContext)<br>• Sistema de idiomas (LanguageContext)<br>• Validação de dados |
| **Evidências físicas ou digitais** | • Página de configurações (`src/app/configuracoes/page.tsx`)<br>• Componente Configurações (`src/app/components/Configurações.tsx`)<br>• Página de conta (`src/app/conta/page.tsx`)<br>• Componente Conta (`src/app/components/Conta.tsx`)<br>• Preferências salvas no localStorage/banco<br>• Tema aplicado globalmente |

---

## 🔄 Fluxos de Suporte e Erros

### Tratamento de Erros e Recuperação

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Encontra erro na aplicação<br>• Tenta novamente a ação<br>• Reporta problema (se disponível)<br>• Aguarda correção ou solução |
| **Ações de contato visíveis (frontstage)** | • Mensagens de erro amigáveis<br>• Botões de "Tentar novamente"<br>• Formulário de feedback/erro<br>• Indicadores de loading<br>• Fallbacks visuais |
| **Ações de apoio invisíveis (backstage)** | • Captura de erros no frontend<br>• Logging de erros no backend<br>• Notificação para desenvolvedores<br>• Análise de padrões de erro<br>• Correção de bugs |
| **Processos de suporte** | • Sistema de logs (console, Sentry, etc.)<br>• API de feedback (`/api/feedback`)<br>• Monitoramento de erros<br>• Sistema de alertas<br>• Processo de correção de bugs |
| **Evidências físicas ou digitais** | • Logs de erro<br>• Tickets de suporte<br>• Relatórios de erro<br>• Mensagens de erro na interface |

---

## 📈 Métricas e Pontos de Controle

### Momentos Críticos da Jornada

1. **Primeiro Acesso**: Taxa de conversão de cadastro
2. **Login**: Taxa de sucesso de autenticação
3. **Início de Trilha**: Taxa de engajamento
4. **Completar Fase**: Taxa de conclusão
5. **Uso de Recursos**: Frequência de uso de habilidades especiais
6. **Retorno**: Taxa de retorno de usuários

---

## 🎨 Elementos de Design e Acessibilidade

### Considerações de UX/UI

- **Acessibilidade**: ARIA labels, navegação por teclado, leitores de tela
- **Responsividade**: Adaptação a diferentes tamanhos de tela
- **Feedback Visual**: Animações, transições, estados de loading
- **Consistência**: Design system unificado
- **Performance**: Carregamento otimizado, lazy loading

---

## 🔐 Segurança e Privacidade

### Medidas Implementadas

- Autenticação via JWT
- Hash de senhas
- Validação de dados no frontend e backend
- Interceptores para verificação de token
- Logout automático em caso de token inválido
- Proteção contra XSS e CSRF

---

## 📝 Notas Técnicas

### Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Game Engine**: Phaser.js
- **HTTP Client**: Axios
- **Estado**: React Hooks (useState, useEffect)
- **Roteamento**: Next.js App Router
- **Autenticação**: JWT tokens

### Estrutura de Arquivos Relevantes

```
src/app/
├── pages/              # Páginas da aplicação
│   ├── login/
│   ├── cadastro/
│   ├── home/
│   ├── trilha/
│   ├── game/
│   ├── perfil/
│   └── configuracoes/
├── components/         # Componentes reutilizáveis
│   ├── Login.tsx
│   ├── Triha.tsx
│   └── game/
├── game/              # Lógica do jogo RPG
│   ├── GameScene.ts
│   ├── api.ts
│   └── types.ts
├── services/          # Serviços de API
│   └── api.ts
└── config/           # Configurações
    └── api.config.ts
```

---

## 🎓 Jornada 7: Seleção e Customização de Personagem

### Fase: Personalização do Avatar

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página de seleção de personagem<br>• Visualiza personagens disponíveis<br>• Lê descrição de cada personagem<br>• Seleciona um personagem<br>• Confirma escolha<br>• Visualiza personagem selecionado no jogo |
| **Ações de contato visíveis (frontstage)** | • Galeria de personagens com imagens<br>• Cards com informações de cada personagem<br>• Botão "Selecionar" em cada card<br>• Confirmação visual da seleção<br>• Preview do personagem no jogo |
| **Ações de apoio invisíveis (backstage)** | • Busca de personagens disponíveis<br>• Verificação de personagem desbloqueado<br>• Atualização do personagem do usuário no banco<br>• Carregamento de sprites/animações do personagem<br>• Aplicação do personagem nas próximas partidas |
| **Processos de suporte** | • API de usuário (`/api/users/atualizar-personagem`)<br>• Banco de dados de personagens<br>• Sistema de assets (sprites, GIFs)<br>• Carregamento dinâmico de animações |
| **Evidências físicas ou digitais** | • Página de personagem (`src/app/personagem/page.tsx`)<br>• Imagens dos personagens<br>• Sprites e animações GIF<br>• Personagem selecionado persistido |

---

## 📚 Jornada 8: Busca e Filtragem de Conteúdo

### Fase: Encontrar Conteúdo Específico

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página de busca<br>• Digita termo de busca<br>• Aplica filtros (matéria, dificuldade, etc.)<br>• Visualiza resultados<br>• Seleciona resultado relevante |
| **Ações de contato visíveis (frontstage)** | • Campo de busca<br>• Filtros visuais (dropdowns, checkboxes)<br>• Lista de resultados<br>• Cards de trilhas/fases encontradas<br>• Indicador de "nenhum resultado encontrado" |
| **Ações de apoio invisíveis (backstage)** | • Processamento da query de busca<br>• Aplicação de filtros no backend<br>• Ranking de relevância<br>• Cache de resultados de busca<br>• Análise de termos de busca populares |
| **Processos de suporte** | • API de busca (`/api/trilhas/buscar`)<br>• Motor de busca (texto completo, fuzzy search)<br>• Sistema de indexação<br>• Cache de resultados |
| **Evidências físicas ou digitais** | • Página de busca (`src/app/busca/page.tsx`)<br>• Campo de input<br>• Resultados exibidos<br>• Histórico de buscas (se aplicável) |

---

## 💬 Jornada 9: Suporte e Feedback

### Fase: Comunicação com Suporte

| Camada | Detalhamento |
|--------|--------------|
| **Ações do usuário** | • Acessa página "Fale Conosco" ou FAQ<br>• Lê perguntas frequentes<br>• Envia mensagem de contato<br>• Envia feedback sobre funcionalidades<br>• Reporta bugs ou problemas |
| **Ações de contato visíveis (frontstage)** | • Página FAQ com perguntas e respostas<br>• Formulário de contato<br>• Formulário de feedback<br>• Categorias de feedback<br>• Confirmação de envio<br>• Mensagem de agradecimento |
| **Ações de apoio invisíveis (backstage)** | • Armazenamento de mensagens no banco<br>• Notificação para equipe de suporte<br>• Categorização de feedback<br>• Análise de padrões de problemas<br>• Geração de tickets de suporte |
| **Processos de suporte** | • API de feedback (`/api/feedback`)<br>• API de contato (`/api/fale-conosco`)<br>• Sistema de tickets<br>• Email notifications (se configurado)<br>• Dashboard de análise de feedback |
| **Evidências físicas ou digitais** | • Página FAQ (`src/app/faq/page.tsx`)<br>• Página Fale Conosco (`src/app/faleConosco/page.tsx`)<br>• Página Feedback (`src/app/feedback/page.tsx`)<br>• Formulários preenchidos<br>• Emails de confirmação |

---

## 📝 Notas Técnicas Expandidas

### Tecnologias Utilizadas

- **Frontend**: Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **Game Engine**: Phaser.js 3.x
- **HTTP Client**: Axios com interceptors
- **Estado**: React Hooks (useState, useEffect, useLayoutEffect)
- **Roteamento**: Next.js App Router
- **Autenticação**: JWT tokens armazenados no localStorage
- **Acessibilidade**: ARIA attributes, navegação por teclado, leitores de tela
- **Animações**: Framer Motion, Phaser Tweens

### Estrutura de Arquivos Relevantes

```
src/app/
├── pages/                    # Páginas da aplicação
│   ├── login/                # Autenticação
│   ├── cadastro/             # Registro de usuário
│   ├── home/                 # Dashboard principal
│   ├── trilha/               # Visualização de trilhas
│   ├── game/                 # Jogo RPG Quiz
│   ├── perfil/               # Perfil do usuário
│   ├── ranking/              # Ranking de usuários
│   ├── configuracoes/        # Configurações gerais
│   ├── conta/                # Gerenciamento de conta
│   ├── personagem/           # Seleção de personagem
│   ├── busca/                # Busca de conteúdo
│   ├── faq/                  # Perguntas frequentes
│   ├── faleConosco/          # Contato com suporte
│   └── feedback/             # Envio de feedback
├── components/               # Componentes reutilizáveis
│   ├── Login.tsx
│   ├── Triha.tsx
│   ├── Conta.tsx
│   ├── Configurações.tsx
│   ├── Ranking.tsx
│   ├── ExperienceBar.tsx
│   └── game/
│       └── RPGQuizGame.tsx
├── game/                     # Lógica do jogo RPG
│   ├── GameScene.ts          # Cena principal do Phaser
│   ├── api.ts                # APIs do jogo
│   └── types.ts              # Tipos TypeScript
├── services/                 # Serviços de API
│   ├── api.ts                # Cliente Axios configurado
│   ├── faseService.js        # Serviços de fases
│   └── usuarioService.js      # Serviços de usuário
├── config/                   # Configurações
│   └── api.config.ts         # Configuração centralizada da API
├── hooks/                    # Custom hooks
│   └── useAccessibility.ts   # Hooks de acessibilidade
└── components/accessibility/ # Componentes de acessibilidade
    ├── PageWrapper.tsx
    ├── AccessibleButton.tsx
    ├── AccessibleInput.tsx
    └── SkipLink.tsx
```

### APIs Principais Utilizadas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Autenticação do usuário |
| `/api/auth/register` | POST | Registro de novo usuário |
| `/api/users/me` | GET | Dados do usuário logado |
| `/api/progresso/usuario` | GET | Progresso e nível do usuário |
| `/api/trilhas` | GET | Lista de trilhas |
| `/api/fases/${faseId}` | GET | Dados de uma fase específica |
| `/api/fases/concluir` | POST | Registrar conclusão de fase |
| `/api/progresso/trilha/${trilhaId}` | GET | Progresso em uma trilha |
| `/api/ranking` | GET | Ranking geral de usuários |
| `/api/feedback` | POST | Enviar feedback |

---

## 🔄 Fluxos de Integração entre Jornadas

### Conexões entre Jornadas

1. **Cadastro → Login → Home**: Fluxo inicial de onboarding
2. **Home → Trilha → Game**: Fluxo principal de aprendizado
3. **Game → Trilha**: Retorno após completar fase (atualização de progresso)
4. **Perfil → Personagem → Game**: Personalização afeta experiência de jogo
5. **Configurações → Todas as páginas**: Preferências aplicadas globalmente

---

## 📊 Métricas e KPIs por Jornada

### Jornada 1: Cadastro
- Taxa de conversão (visitantes → cadastros)
- Tempo médio de preenchimento do formulário
- Taxa de erro no cadastro

### Jornada 2: Login
- Taxa de sucesso de login
- Tempo médio de autenticação
- Taxa de recuperação de senha

### Jornada 3: Navegação
- Taxa de engajamento (trilhas visualizadas)
- Taxa de salvamento de trilhas
- Taxa de início de trilhas

### Jornada 4: Jogo
- Taxa de conclusão de fases
- Taxa média de acertos
- Tempo médio por fase
- Uso de habilidades especiais

### Jornada 5: Perfil
- Frequência de acesso ao perfil
- Taxa de visualização de ranking
- Taxa de atualização de dados

---

## 🎯 Conclusão

Este Blueprint documenta a jornada completa do usuário através do sistema Estude.My, desde o primeiro contato até o uso avançado das funcionalidades. Cada camada do blueprint foi mapeada para garantir uma compreensão completa dos processos visíveis e invisíveis que compõem a experiência do usuário.

O documento serve como referência para:
- **Desenvolvedores**: Entender o fluxo completo do sistema
- **Designers**: Compreender a experiência do usuário
- **Product Managers**: Identificar pontos de melhoria e oportunidades
- **Stakeholders**: Visualizar o funcionamento completo da plataforma

---

## 📅 Versão

**Versão**: 1.0  
**Data**: 2024  
**Autor**: Documentação do Projeto Estude.My


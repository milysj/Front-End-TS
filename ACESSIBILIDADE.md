# Guia de Acessibilidade - Estude.My

Este documento descreve os recursos de acessibilidade implementados no projeto e como utilizá-los.

## Recursos Implementados

### 1. Navegação por Teclado
- **Skip Links**: Link para pular para o conteúdo principal (visível ao focar com Tab)
- **Foco Visível**: Todos os elementos interativos têm indicador de foco visível
- **Navegação Sequencial**: Suporte completo à navegação por Tab

### 2. Leitores de Tela
- **ARIA Labels**: Todos os elementos interativos têm labels descritivos
- **Landmarks Semânticos**: Uso correto de `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`
- **Anúncios Dinâmicos**: Mudanças de estado são anunciadas para leitores de tela
- **Textos Alternativos**: Todas as imagens têm texto alternativo apropriado

### 3. Contraste e Visual
- **Contraste Adequado**: Cores seguem WCAG AA (mínimo 4.5:1 para texto)
- **Foco Visível**: Outline de 3px em elementos focados
- **Tamanhos Mínimos**: Botões e elementos interativos têm tamanho mínimo de 44x44px

### 4. Movimento Reduzido
- **Respeita Preferências**: Animações são reduzidas quando o usuário prefere movimento reduzido
- **Transições Suaves**: Transições respeitam `prefers-reduced-motion`

## Componentes Acessíveis

### PageWrapper
Wrapper de página que garante estrutura semântica:

```tsx
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";

<PageWrapper title="Título da Página" description="Descrição opcional">
  {/* Conteúdo da página */}
</PageWrapper>
```

### AccessibleButton
Botão com suporte completo a ARIA:

```tsx
import { AccessibleButton } from "@/app/components/accessibility/AccessibleButton";

<AccessibleButton 
  variant="primary"
  loading={isLoading}
  loadingText="Carregando..."
  aria-label="Descrição do botão"
>
  Texto do Botão
</AccessibleButton>
```

### AccessibleInput
Input com label, mensagens de erro e suporte ARIA:

```tsx
import { AccessibleInput } from "@/app/components/accessibility/AccessibleInput";

<AccessibleInput
  label="Email"
  type="email"
  required
  error={erro}
  helperText="Digite seu email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### AccessibleImage
Imagem com texto alternativo apropriado:

```tsx
import { AccessibleImage } from "@/app/components/accessibility/AccessibleImage";

<AccessibleImage
  src="/img/logo.png"
  alt="Logo do Estude.My"
  width={200}
  height={100}
  decorative={false} // true se for apenas decorativa
/>
```

## Hooks de Acessibilidade

### useKeyboardNavigation
Detecta quando o usuário está navegando por teclado:

```tsx
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

function MeuComponente() {
  useKeyboardNavigation();
  // ...
}
```

### useAccessibleLoading
Anuncia estados de carregamento para leitores de tela:

```tsx
import { useAccessibleLoading } from "@/app/hooks/useAccessibility";

useAccessibleLoading(
  isLoading,
  hasError,
  isEmpty,
  "trilhas" // nome do item sendo carregado
);
```

### useScreenReaderAnnouncement
Anuncia mensagens para leitores de tela:

```tsx
import { useScreenReaderAnnouncement } from "@/app/hooks/useAccessibility";

function MeuComponente() {
  const { announce } = useScreenReaderAnnouncement();
  
  const handleSuccess = () => {
    announce("Operação realizada com sucesso", "polite");
  };
}
```

## Boas Práticas

### 1. Sempre use labels em formulários
```tsx
// ✅ Correto
<label htmlFor="email">Email:</label>
<input id="email" type="email" />

// ❌ Incorreto
<input type="email" placeholder="Email" />
```

### 2. Forneça textos alternativos descritivos
```tsx
// ✅ Correto
<img src="logo.png" alt="Logo do Estude.My" />

// ❌ Incorreto
<img src="logo.png" alt="logo" />
```

### 3. Use elementos semânticos
```tsx
// ✅ Correto
<main>
  <section aria-labelledby="titulo-secao">
    <h2 id="titulo-secao">Título</h2>
  </section>
</main>

// ❌ Incorreto
<div>
  <div>
    <div>Título</div>
  </div>
</div>
```

### 4. Anuncie mudanças importantes
```tsx
// ✅ Correto
{sucesso && (
  <p role="status" aria-live="polite">
    {sucesso}
  </p>
)}

// ✅ Correto para erros
{erro && (
  <p role="alert" aria-live="assertive">
    {erro}
  </p>
)}
```

### 5. Torne elementos interativos acessíveis
```tsx
// ✅ Correto
<button
  aria-label="Fechar menu"
  aria-expanded={isOpen}
  onClick={toggleMenu}
>
  <span aria-hidden="true">×</span>
</button>

// ✅ Para ícones sem texto
<button aria-label="Buscar">
  <SearchIcon aria-hidden="true" />
</button>
```

## Checklist de Acessibilidade

Ao criar ou atualizar componentes, verifique:

- [ ] Todos os elementos interativos têm foco visível
- [ ] Formulários têm labels associados
- [ ] Imagens têm texto alternativo apropriado
- [ ] Mudanças de estado são anunciadas (aria-live)
- [ ] Estrutura semântica adequada (main, nav, section, etc)
- [ ] Navegação por teclado funciona corretamente
- [ ] Contraste de cores é adequado
- [ ] Elementos têm tamanho mínimo de 44x44px
- [ ] Erros são exibidos com role="alert"
- [ ] Loading states são anunciados

## Testes de Acessibilidade

### Ferramentas Recomendadas
- **axe DevTools**: Extensão do Chrome para testes de acessibilidade
- **WAVE**: Extensão do navegador para avaliação de acessibilidade
- **NVDA/JAWS**: Leitores de tela para testes manuais
- **Lighthouse**: Ferramenta do Chrome DevTools

### Teste Manual
1. Navegue apenas com o teclado (Tab, Enter, Esc)
2. Teste com leitor de tela (NVDA no Windows, VoiceOver no Mac)
3. Verifique contraste de cores
4. Teste em diferentes tamanhos de tela
5. Verifique se todas as funcionalidades são acessíveis

## Conformidade

O projeto busca conformidade com:
- **WCAG 2.1 Nível AA**: Padrão mínimo recomendado
- **Lei Brasileira de Inclusão (LBI)**: Lei 13.146/2015
- **eMAG**: Modelo de Acessibilidade em Governo Eletrônico

## Suporte

Para dúvidas ou problemas relacionados à acessibilidade, consulte:
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)


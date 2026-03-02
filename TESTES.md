# 📚 Documentação de Testes Unitários com Jest

## 📋 Índice

1. [O que são Testes Unitários?](#o-que-são-testes-unitários)
2. [O que é Jest?](#o-que-é-jest)
3. [Por que usar Testes Unitários?](#por-que-usar-testes-unitários)
4. [Como Funciona o Jest?](#como-funciona-o-jest)
5. [Estrutura de Testes no Projeto](#estrutura-de-testes-no-projeto)
6. [Como Escrever Testes](#como-escrever-testes)
7. [Como Executar os Testes](#como-executar-os-testes)
8. [Exemplos de Testes](#exemplos-de-testes)
9. [Boas Práticas](#boas-práticas)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 O que são Testes Unitários?

**Testes unitários** são testes automatizados que verificam o comportamento de unidades individuais de código (funções, classes, módulos) de forma isolada. Uma "unidade" é a menor parte testável de um aplicativo, geralmente uma função ou método.

### Características dos Testes Unitários:

- ✅ **Rápidos**: Executam em milissegundos
- ✅ **Isolados**: Não dependem de outros testes ou recursos externos
- ✅ **Determinísticos**: Sempre produzem o mesmo resultado
- ✅ **Repetíveis**: Podem ser executados quantas vezes forem necessárias
- ✅ **Fáceis de manter**: Quando bem escritos, são fáceis de entender e modificar

### Exemplo Simples:

```typescript
// Função a ser testada
function somar(a: number, b: number): number {
  return a + b
}

// Teste unitário
test('deve somar dois números corretamente', () => {
  expect(somar(2, 3)).toBe(5)
  expect(somar(-1, 1)).toBe(0)
  expect(somar(0, 0)).toBe(0)
})
```

---

## 🚀 O que é Jest?

**Jest** é um framework de testes JavaScript desenvolvido pelo Facebook. É amplamente usado na comunidade React e Next.js por ser:

- ✅ **Zero-config**: Funciona out-of-the-box com configuração mínima
- ✅ **Rápido**: Executa testes em paralelo
- ✅ **Rico em recursos**: Mocking, snapshots, cobertura de código
- ✅ **Bem documentado**: Grande comunidade e documentação extensa
- ✅ **Integrado**: Funciona perfeitamente com TypeScript e React

### Principais Recursos do Jest:

1. **Matchers**: Funções que verificam valores (`toBe`, `toEqual`, `toContain`, etc.)
2. **Mocking**: Simulação de funções, módulos e APIs
3. **Snapshots**: Captura de saídas para comparação
4. **Cobertura**: Relatórios de quais linhas foram testadas
5. **Watch Mode**: Reexecuta testes automaticamente quando arquivos mudam

---

## 💡 Por que usar Testes Unitários?

### 1. **Detectar Bugs Antecipadamente**
Encontre erros antes que cheguem à produção, economizando tempo e dinheiro.

### 2. **Documentação Viva**
Os testes servem como documentação do comportamento esperado do código.

### 3. **Refatoração Segura**
Permite modificar código com confiança, sabendo que os testes detectarão quebras.

### 4. **Melhor Design de Código**
Escrever testes força você a pensar em código mais modular e testável.

### 5. **Confiança em Deploy**
Saber que os testes passam aumenta a confiança ao fazer deploy.

### 6. **Economia de Tempo**
Automatiza testes que seriam feitos manualmente, economizando horas de trabalho.

---

## ⚙️ Como Funciona o Jest?

### 1. **Estrutura de um Teste**

```typescript
describe('Nome do Grupo de Testes', () => {
  // Configuração antes de cada teste
  beforeEach(() => {
    // código de setup
  })

  // Limpeza após cada teste
  afterEach(() => {
    // código de cleanup
  })

  // Teste individual
  test('deve fazer algo específico', () => {
    // Arrange (Preparar)
    const input = 'valor de entrada'
    
    // Act (Executar)
    const result = minhaFuncao(input)
    
    // Assert (Verificar)
    expect(result).toBe('valor esperado')
  })
})
```

### 2. **Padrão AAA (Arrange-Act-Assert)**

- **Arrange**: Prepara os dados e condições necessárias
- **Act**: Executa a função/método sendo testado
- **Assert**: Verifica se o resultado está correto

### 3. **Matchers Comuns**

```typescript
// Igualdade
expect(valor).toBe(5)              // === (igualdade estrita)
expect(valor).toEqual({a: 1})      // Igualdade profunda
expect(valor).not.toBe(6)          // Negação

// Verdadeiro/Falso
expect(valor).toBeTruthy()
expect(valor).toBeFalsy()
expect(valor).toBeDefined()
expect(valor).toBeNull()
expect(valor).toBeUndefined()

// Números
expect(valor).toBeGreaterThan(3)
expect(valor).toBeLessThan(10)
expect(valor).toBeCloseTo(0.3, 5)  // Para números decimais

// Strings
expect(string).toContain('texto')
expect(string).toMatch(/regex/)
expect(string).toHaveLength(10)

// Arrays
expect(array).toContain(item)
expect(array).toHaveLength(5)
expect(array).toEqual([1, 2, 3])

// Objetos
expect(obj).toHaveProperty('chave')
expect(obj).toMatchObject({a: 1})
```

### 4. **Mocking**

```typescript
// Mock de função
const minhaFuncao = jest.fn()
minhaFuncao.mockReturnValue(42)
minhaFuncao.mockResolvedValue(Promise.resolve(42))

// Mock de módulo
jest.mock('../api', () => ({
  fetchData: jest.fn(),
}))

// Verificar chamadas
expect(minhaFuncao).toHaveBeenCalled()
expect(minhaFuncao).toHaveBeenCalledWith('argumento')
expect(minhaFuncao).toHaveBeenCalledTimes(2)
```

---

## 📁 Estrutura de Testes no Projeto

```
Front-End/
├── src/
│   ├── lib/
│   │   ├── __tests__/
│   │   │   └── utils.test.ts          # Testes de utilitários
│   │   └── utils.ts
│   ├── app/
│   │   ├── utils/
│   │   │   ├── __tests__/
│   │   │   │   └── accessibility.test.ts  # Testes de acessibilidade
│   │   │   └── accessibility.ts
│   │   └── services/
│   │       ├── __tests__/
│   │       │   └── api.test.ts        # Testes de autenticação
│   │       ├── api.ts                 # Instância do axios
│   │       └── authHelpers.ts         # Funções de autenticação
├── jest.config.js                     # Configuração do Jest
├── jest.setup.js                      # Setup global dos testes
└── TESTES.md                          # Esta documentação
```

### Convenções de Nomenclatura:

- Arquivos de teste: `*.test.ts` ou `*.spec.ts`
- Pastas de teste: `__tests__/` (duplo underscore)
- Nomes de testes: Descritivos e em português (seguindo o padrão do projeto)

---

## ✍️ Como Escrever Testes

### Passo 1: Identificar o que Testar

Teste funções puras, utilitários, lógica de negócio e funções auxiliares. Evite testar detalhes de implementação.

### Passo 2: Escrever o Teste

```typescript
// Exemplo: Testando a função cn (className utility)
import { cn } from '../utils'

describe('cn (className utility)', () => {
  test('deve combinar múltiplas classes', () => {
    const result = cn('foo', 'bar', 'baz')
    expect(result).toBe('foo bar baz')
  })

  test('deve resolver conflitos do Tailwind CSS', () => {
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4') // A última classe prevalece
  })
})
```

### Passo 3: Executar o Teste

```bash
npm test
```

### Passo 4: Verificar o Resultado

O Jest mostrará quais testes passaram ou falharam, com mensagens descritivas.

---

## 🏃 Como Executar os Testes

### Comandos Disponíveis:

```bash
# Executar todos os testes uma vez
npm test

# Executar testes em modo watch (reexecuta ao salvar arquivos)
npm test -- --watch

# Executar testes de um arquivo específico
npm test -- utils.test.ts

# Executar testes com cobertura de código
npm test -- --coverage

# Executar testes em modo verbose (mais detalhes)
npm test -- --verbose

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="deve combinar"
```

### Scripts no package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📝 Exemplos de Testes

### Exemplo 1: Função Utilitária Simples

```typescript
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// src/lib/__tests__/utils.test.ts
describe('cn', () => {
  it('deve combinar múltiplas classes', () => {
    expect(cn('foo', 'bar')).toContain('foo')
    expect(cn('foo', 'bar')).toContain('bar')
  })
})
```

### Exemplo 2: Função com Condicionais

```typescript
// src/app/utils/accessibility.ts
export const getStatusText = (
  isLoading: boolean,
  hasError: boolean,
  isEmpty: boolean,
  itemName: string = "itens"
): string => {
  if (isLoading) return `Carregando ${itemName}...`
  if (hasError) return `Erro ao carregar ${itemName}`
  if (isEmpty) return `Nenhum ${itemName} encontrado`
  return ""
}

// src/app/utils/__tests__/accessibility.test.ts
describe('getStatusText', () => {
  it('deve retornar texto de carregamento quando isLoading é true', () => {
    const text = getStatusText(true, false, false, 'usuários')
    expect(text).toBe('Carregando usuários...')
  })
})
```

### Exemplo 3: Função com localStorage

```typescript
// src/app/services/api.ts
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// src/app/services/__tests__/api.test.ts
describe('getToken', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('deve retornar null quando não há token', () => {
    expect(getToken()).toBeNull()
  })

  it('deve retornar o token quando existe', () => {
    localStorage.setItem('token', 'test-token')
    expect(getToken()).toBe('test-token')
  })
})
```

---

## ✅ Boas Práticas

### 1. **Um Teste, Uma Coisa**

```typescript
// ❌ Ruim: Testa múltiplas coisas
test('deve fazer tudo', () => {
  expect(funcao1()).toBe(1)
  expect(funcao2()).toBe(2)
  expect(funcao3()).toBe(3)
})

// ✅ Bom: Testa uma coisa por vez
test('deve retornar 1', () => {
  expect(funcao1()).toBe(1)
})

test('deve retornar 2', () => {
  expect(funcao2()).toBe(2)
})
```

### 2. **Nomes Descritivos**

```typescript
// ❌ Ruim
test('teste 1', () => { ... })

// ✅ Bom
test('deve retornar erro quando email está vazio', () => { ... })
```

### 3. **Teste Comportamento, Não Implementação**

```typescript
// ❌ Ruim: Testa detalhes de implementação
test('deve chamar localStorage.setItem', () => {
  setToken('token')
  expect(localStorage.setItem).toHaveBeenCalled()
})

// ✅ Bom: Testa o comportamento esperado
test('deve armazenar o token', () => {
  setToken('token')
  expect(getToken()).toBe('token')
})
```

### 4. **Use beforeEach e afterEach**

```typescript
describe('meus testes', () => {
  beforeEach(() => {
    // Limpa estado antes de cada teste
    localStorage.clear()
  })

  afterEach(() => {
    // Limpa após cada teste
    jest.clearAllMocks()
  })
})
```

### 5. **Teste Casos Extremos**

```typescript
test('deve lidar com valores null', () => {
  expect(minhaFuncao(null)).toBeNull()
})

test('deve lidar com arrays vazios', () => {
  expect(minhaFuncao([])).toEqual([])
})

test('deve lidar com strings vazias', () => {
  expect(minhaFuncao('')).toBe('')
})
```

### 6. **Organize Testes com describe**

```typescript
describe('minhaFuncao', () => {
  describe('quando recebe entrada válida', () => {
    test('deve retornar resultado correto', () => { ... })
  })

  describe('quando recebe entrada inválida', () => {
    test('deve lançar erro', () => { ... })
  })
})
```

---

## 🔧 Troubleshooting

### Problema: "Cannot find module"

**Solução**: Verifique se o caminho do import está correto e se o módulo existe.

```typescript
// Certifique-se de que o caminho está correto
import { cn } from '../utils'  // ✅ Relativo ao arquivo de teste
```

### Problema: "localStorage is not defined"

**Solução**: O Jest roda em Node.js, não no navegador. Use mocks:

```typescript
// jest.setup.js já configura isso, mas você pode adicionar:
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock
```

### Problema: Testes muito lentos

**Solução**: 
- Execute testes em paralelo (padrão do Jest)
- Use `jest.setTimeout()` apenas quando necessário
- Evite operações síncronas pesadas

### Problema: Cobertura baixa

**Solução**: 
- Adicione testes para funções não cobertas
- Use `--coverage` para identificar áreas não testadas
- Foque em código crítico primeiro

---

## 📊 Relatório de Cobertura

Para gerar um relatório de cobertura:

```bash
npm test -- --coverage
```

Isso gerará:
- Relatório no terminal
- Arquivo HTML em `coverage/index.html` (abrir no navegador)
- Arquivo LCOV em `coverage/lcov.info`

### Interpretando Cobertura:

- **Statements**: Porcentagem de linhas executadas
- **Branches**: Porcentagem de ramificações testadas (if/else)
- **Functions**: Porcentagem de funções chamadas
- **Lines**: Porcentagem de linhas cobertas

**Meta recomendada**: 70-80% de cobertura para código crítico.

---

## 🎓 Recursos Adicionais

- [Documentação Oficial do Jest](https://jestjs.io/docs/getting-started)
- [Jest com TypeScript](https://jestjs.io/docs/getting-started#using-typescript)
- [Testing Library](https://testing-library.com/) (para testes de componentes React)
- [Guia de Testes do Next.js](https://nextjs.org/docs/app/building-your-application/testing/jest)

---

## 📝 Checklist para Novos Testes

Ao criar um novo teste, certifique-se de:

- [ ] Teste tem um nome descritivo
- [ ] Testa apenas uma coisa por vez
- [ ] Usa o padrão AAA (Arrange-Act-Assert)
- [ ] Testa casos de sucesso
- [ ] Testa casos de erro
- [ ] Testa casos extremos (null, undefined, arrays vazios)
- [ ] Usa mocks quando necessário
- [ ] Limpa estado entre testes (beforeEach/afterEach)
- [ ] Está no local correto (`__tests__/` ou `.test.ts`)

---

## 🤝 Contribuindo com Testes

Ao adicionar novas funcionalidades:

1. **Escreva os testes primeiro** (TDD - Test-Driven Development) ou
2. **Escreva os testes junto** com o código
3. **Certifique-se de que todos os testes passam**
4. **Mantenha a cobertura acima de 70%**

---

**Última atualização**: Dezembro 2024

**Mantido por**: Equipe de Desenvolvimento Front-End


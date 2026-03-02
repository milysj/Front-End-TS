/**
 * Testes unitários para utilitários de acessibilidade
 * 
 * Estes testes verificam as funções que melhoram a acessibilidade
 * da aplicação, incluindo anúncios para leitores de tela, foco em elementos,
 * e outras funcionalidades relacionadas à acessibilidade.
 */

import {
  announceToScreenReader,
  focusElement,
  isKeyboardNavigation,
  getImageAlt,
  generateAriaId,
  hasAdequateContrast,
  getStatusText,
} from '../accessibility'

// Mock do DOM para testes
beforeEach(() => {
  // Limpa o body antes de cada teste
  document.body.innerHTML = ''
  
  // Remove a classe keyboard-navigation se existir
  document.body.classList.remove('keyboard-navigation')
})

describe('announceToScreenReader', () => {
  /**
   * Teste: Deve criar um elemento de anúncio para leitores de tela
   * 
   * A função deve criar um elemento div com os atributos ARIA apropriados
   * para anunciar mensagens aos leitores de tela.
   */
  it('deve criar um elemento com atributos ARIA corretos', () => {
    announceToScreenReader('Teste de anúncio')
    
    const announcement = document.querySelector('[role="status"]')
    expect(announcement).toBeTruthy()
    expect(announcement?.getAttribute('aria-live')).toBe('polite')
    expect(announcement?.getAttribute('aria-atomic')).toBe('true')
    expect(announcement?.textContent).toBe('Teste de anúncio')
  })

  it('deve usar prioridade "assertive" quando especificado', () => {
    announceToScreenReader('Anúncio urgente', 'assertive')
    
    const announcement = document.querySelector('[role="status"]')
    expect(announcement?.getAttribute('aria-live')).toBe('assertive')
  })

  it('deve usar prioridade "polite" por padrão', () => {
    announceToScreenReader('Anúncio padrão')
    
    const announcement = document.querySelector('[role="status"]')
    expect(announcement?.getAttribute('aria-live')).toBe('polite')
  })

  it('deve adicionar o elemento ao body', () => {
    announceToScreenReader('Teste')
    
    const announcement = document.body.querySelector('[role="status"]')
    expect(announcement).toBeTruthy()
    expect(document.body.contains(announcement!)).toBe(true)
  })

  it('não deve fazer nada se window não estiver definido (SSR)', () => {
    // Simula ambiente SSR
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    // Não deve lançar erro
    expect(() => announceToScreenReader('Teste')).not.toThrow()
    
    // Restaura window
    global.window = originalWindow
  })
})

describe('focusElement', () => {
  /**
   * Teste: Deve focar em um elemento específico
   * 
   * A função deve encontrar um elemento pelo ID e focar nele,
   * além de rolar até ele suavemente.
   */
  beforeEach(() => {
    // Cria um elemento de teste
    const element = document.createElement('button')
    element.id = 'test-button'
    element.textContent = 'Botão de teste'
    document.body.appendChild(element)
  })

  it('deve focar em um elemento existente', () => {
    const element = document.getElementById('test-button')
    const focusSpy = jest.spyOn(element!, 'focus')
    // Mock do scrollIntoView
    const scrollIntoViewMock = jest.fn()
    element!.scrollIntoView = scrollIntoViewMock
    
    focusElement('test-button')
    
    expect(focusSpy).toHaveBeenCalled()
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    })
  })

  it('não deve lançar erro se o elemento não existir', () => {
    expect(() => focusElement('elemento-inexistente')).not.toThrow()
  })

  it('não deve fazer nada se window não estiver definido (SSR)', () => {
    const originalWindow = global.window
    const originalDocument = global.document
    // @ts-ignore
    delete global.window
    // @ts-ignore
    delete global.document
    
    expect(() => focusElement('test-button')).not.toThrow()
    
    global.window = originalWindow
    global.document = originalDocument
  })
})

describe('isKeyboardNavigation', () => {
  /**
   * Teste: Deve detectar navegação por teclado
   * 
   * A função verifica se o usuário está usando navegação por teclado
   * através da presença de uma classe CSS específica.
   */
  it('deve retornar false quando a classe não está presente', () => {
    expect(isKeyboardNavigation()).toBe(false)
  })

  it('deve retornar true quando a classe keyboard-navigation está presente', () => {
    document.body.classList.add('keyboard-navigation')
    expect(isKeyboardNavigation()).toBe(true)
  })

  it('deve retornar false se window não estiver definido (SSR)', () => {
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    expect(isKeyboardNavigation()).toBe(false)
    
    global.window = originalWindow
  })
})

describe('getImageAlt', () => {
  /**
   * Teste: Deve retornar texto alternativo apropriado para imagens
   * 
   * A função deve retornar textos alternativos pré-definidos para imagens
   * conhecidas, ou gerar um texto padrão para imagens desconhecidas.
   */
  it('deve retornar texto alternativo para logo', () => {
    const alt = getImageAlt('logo')
    expect(alt).toBe('Logo do Estude.My')
  })

  it('deve retornar texto alternativo para moeda', () => {
    const alt = getImageAlt('coin-pixel')
    expect(alt).toBe('Moeda de experiência')
  })

  it('deve retornar texto alternativo para troféu', () => {
    const alt = getImageAlt('trofeu')
    expect(alt).toBe('Troféu de conquista')
  })

  it('deve retornar texto alternativo para personagens', () => {
    expect(getImageAlt('guerreiro')).toBe('Personagem guerreiro')
    expect(getImageAlt('mago')).toBe('Personagem mago')
    expect(getImageAlt('samurai')).toBe('Personagem samurai')
  })

  it('deve retornar texto padrão para imagens desconhecidas', () => {
    const alt = getImageAlt('imagem-desconhecida')
    expect(alt).toBe('Imagem: imagem-desconhecida')
  })

  it('deve incluir contexto quando fornecido', () => {
    const alt = getImageAlt('logo', 'página inicial')
    expect(alt).toBe('Logo do Estude.My - página inicial')
  })

  it('deve incluir contexto para imagens desconhecidas', () => {
    const alt = getImageAlt('imagem-x', 'contexto especial')
    expect(alt).toBe('Imagem: imagem-x - contexto especial')
  })
})

describe('generateAriaId', () => {
  /**
   * Teste: Deve gerar IDs únicos para elementos ARIA
   * 
   * A função deve gerar IDs únicos usando um prefixo e um identificador aleatório.
   */
  it('deve gerar um ID com o prefixo fornecido', () => {
    const id = generateAriaId('label')
    expect(id).toMatch(/^label-/)
  })

  it('deve gerar IDs únicos em cada chamada', () => {
    const id1 = generateAriaId('test')
    const id2 = generateAriaId('test')
    expect(id1).not.toBe(id2)
  })

  it('deve gerar IDs com formato correto', () => {
    const id = generateAriaId('prefix')
    // Deve ter formato: prefix-{random}
    expect(id).toMatch(/^prefix-[a-z0-9]+$/)
  })
})

describe('hasAdequateContrast', () => {
  /**
   * Teste: Deve verificar contraste de cores
   * 
   * Nota: A implementação atual sempre retorna true.
   * Em produção, isso deveria usar uma biblioteca de contraste real.
   */
  it('deve retornar true (implementação simplificada)', () => {
    expect(hasAdequateContrast('#000000', '#FFFFFF')).toBe(true)
    expect(hasAdequateContrast('#FF0000', '#00FF00')).toBe(true)
  })
})

describe('getStatusText', () => {
  /**
   * Teste: Deve retornar texto de status apropriado
   * 
   * A função deve retornar textos descritivos baseados no estado
   * de carregamento, erro ou lista vazia.
   */
  it('deve retornar texto de carregamento quando isLoading é true', () => {
    const text = getStatusText(true, false, false, 'usuários')
    expect(text).toBe('Carregando usuários...')
  })

  it('deve retornar texto de erro quando hasError é true', () => {
    const text = getStatusText(false, true, false, 'dados')
    expect(text).toBe('Erro ao carregar dados')
  })

  it('deve retornar texto de lista vazia quando isEmpty é true', () => {
    const text = getStatusText(false, false, true, 'itens')
    expect(text).toBe('Nenhum itens encontrado')
  })

  it('deve retornar string vazia quando não há estados ativos', () => {
    const text = getStatusText(false, false, false)
    expect(text).toBe('')
  })

  it('deve usar "itens" como padrão quando itemName não é fornecido', () => {
    const text = getStatusText(true, false, false)
    expect(text).toBe('Carregando itens...')
  })

  it('deve priorizar isLoading sobre outros estados', () => {
    const text = getStatusText(true, true, true, 'teste')
    expect(text).toBe('Carregando teste...')
  })

  it('deve priorizar hasError sobre isEmpty', () => {
    const text = getStatusText(false, true, true, 'teste')
    expect(text).toBe('Erro ao carregar teste')
  })
})


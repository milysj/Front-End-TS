/**
 * Testes unitários para funções de autenticação da API
 * 
 * Estes testes verificam as funções auxiliares de autenticação
 * que gerenciam tokens no localStorage.
 */

import { getToken, setToken, removeToken, isAuthenticated } from '../authHelpers'

// Mock do localStorage antes de cada teste
beforeEach(() => {
  // Limpa o localStorage mockado
  localStorage.clear()
  
  // Reseta os mocks
  jest.clearAllMocks()
})

describe('getToken', () => {
  /**
   * Teste: Deve obter o token do localStorage
   * 
   * A função deve recuperar o token de autenticação armazenado
   * no localStorage do navegador.
   */
  it('deve retornar null quando não há token armazenado', () => {
    const token = getToken()
    expect(token).toBeNull()
  })

  it('deve retornar o token quando existe no localStorage', () => {
    const testToken = 'test-token-123'
    localStorage.setItem('token', testToken)
    
    const token = getToken()
    expect(token).toBe(testToken)
  })

  it('deve retornar null se window não estiver definido (SSR)', () => {
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    const token = getToken()
    expect(token).toBeNull()
    
    global.window = originalWindow
  })
})

describe('setToken', () => {
  /**
   * Teste: Deve armazenar o token no localStorage
   * 
   * A função deve salvar o token de autenticação no localStorage
   * para uso posterior nas requisições.
   */
  it('deve armazenar o token no localStorage', () => {
    const testToken = 'new-token-456'
    
    setToken(testToken)
    
    // Verifica o comportamento (token foi armazenado) ao invés da implementação
    expect(localStorage.getItem('token')).toBe(testToken)
  })

  it('deve sobrescrever token existente', () => {
    localStorage.setItem('token', 'old-token')
    
    setToken('new-token')
    
    expect(localStorage.getItem('token')).toBe('new-token')
  })

  it('não deve fazer nada se window não estiver definido (SSR)', () => {
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    // Não deve lançar erro
    expect(() => setToken('test-token')).not.toThrow()
    
    global.window = originalWindow
  })
})

describe('removeToken', () => {
  /**
   * Teste: Deve remover o token do localStorage
   * 
   * A função deve remover o token de autenticação do localStorage,
   * efetivamente fazendo logout do usuário.
   */
  it('deve remover o token do localStorage', () => {
    localStorage.setItem('token', 'test-token')
    
    removeToken()
    
    // Verifica o comportamento (token foi removido) ao invés da implementação
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('não deve lançar erro quando não há token para remover', () => {
    expect(() => removeToken()).not.toThrow()
    // Verifica que o token continua null após tentar remover
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('não deve fazer nada se window não estiver definido (SSR)', () => {
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    expect(() => removeToken()).not.toThrow()
    
    global.window = originalWindow
  })
})

describe('isAuthenticated', () => {
  /**
   * Teste: Deve verificar se o usuário está autenticado
   * 
   * A função deve retornar true se existe um token no localStorage,
   * e false caso contrário.
   */
  it('deve retornar false quando não há token', () => {
    expect(isAuthenticated()).toBe(false)
  })

  it('deve retornar true quando há token armazenado', () => {
    localStorage.setItem('token', 'test-token')
    expect(isAuthenticated()).toBe(true)
  })

  it('deve retornar false após remover o token', () => {
    localStorage.setItem('token', 'test-token')
    expect(isAuthenticated()).toBe(true)
    
    removeToken()
    expect(isAuthenticated()).toBe(false)
  })

  it('deve retornar false se window não estiver definido (SSR)', () => {
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    expect(isAuthenticated()).toBe(false)
    
    global.window = originalWindow
  })
})

describe('Integração entre funções de autenticação', () => {
  /**
   * Teste: Fluxo completo de autenticação
   * 
   * Testa o fluxo completo: definir token, verificar autenticação,
   * obter token e remover token.
   */
  it('deve funcionar corretamente no fluxo completo de autenticação', () => {
    // Inicialmente não autenticado
    expect(isAuthenticated()).toBe(false)
    expect(getToken()).toBeNull()
    
    // Define token
    const testToken = 'integration-test-token'
    setToken(testToken)
    
    // Verifica autenticação
    expect(isAuthenticated()).toBe(true)
    expect(getToken()).toBe(testToken)
    
    // Remove token
    removeToken()
    
    // Verifica que não está mais autenticado
    expect(isAuthenticated()).toBe(false)
    expect(getToken()).toBeNull()
  })
})


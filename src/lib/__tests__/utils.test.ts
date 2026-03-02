/**
 * Testes unitários para a função cn (className utility)
 * 
 * A função cn combina clsx e tailwind-merge para mesclar classes CSS
 * de forma inteligente, resolvendo conflitos do Tailwind CSS.
 */

import { cn } from '../utils'

describe('cn (className utility)', () => {
  /**
   * Teste: Deve mesclar classes simples
   * 
   * Verifica se a função consegue combinar múltiplas classes CSS básicas
   */
  describe('Mesclagem de classes simples', () => {
    it('deve combinar múltiplas classes', () => {
      const result = cn('foo', 'bar', 'baz')
      expect(result).toBe('foo bar baz')
    })

    it('deve retornar string vazia quando nenhum argumento é fornecido', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('deve retornar a classe quando apenas um argumento é fornecido', () => {
      const result = cn('foo')
      expect(result).toBe('foo')
    })
  })

  /**
   * Teste: Deve resolver conflitos do Tailwind CSS
   * 
   * O tailwind-merge resolve conflitos quando classes conflitantes são fornecidas.
   * Por exemplo, 'p-2' e 'p-4' devem resultar apenas em 'p-4' (a última prevalece).
   */
  describe('Resolução de conflitos do Tailwind CSS', () => {
    it('deve resolver conflitos de padding', () => {
      const result = cn('p-2', 'p-4')
      expect(result).toBe('p-4')
    })

    it('deve resolver conflitos de margin', () => {
      const result = cn('m-2', 'm-8')
      expect(result).toBe('m-8')
    })

    it('deve resolver conflitos de cor de texto', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('deve manter classes não conflitantes', () => {
      const result = cn('p-4', 'm-2', 'text-red-500')
      expect(result).toContain('p-4')
      expect(result).toContain('m-2')
      expect(result).toContain('text-red-500')
    })
  })

  /**
   * Teste: Deve lidar com valores condicionais
   * 
   * A função deve aceitar valores condicionais (true/false) e objetos
   * seguindo a sintaxe do clsx.
   */
  describe('Valores condicionais', () => {
    it('deve incluir classes quando condição é verdadeira', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toContain('active')
    })

    it('deve excluir classes quando condição é falsa', () => {
      const isActive = false
      const result = cn('base', isActive && 'active')
      expect(result).not.toContain('active')
      expect(result).toBe('base')
    })

    it('deve lidar com objetos condicionais', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
        'font-bold': true,
      })
      expect(result).toContain('text-red-500')
      expect(result).not.toContain('text-blue-500')
      expect(result).toContain('font-bold')
    })
  })

  /**
   * Teste: Deve lidar com arrays e valores undefined/null
   * 
   * A função deve filtrar valores falsy e processar arrays corretamente.
   */
  describe('Arrays e valores falsy', () => {
    it('deve filtrar valores undefined', () => {
      const result = cn('foo', undefined, 'bar')
      expect(result).toBe('foo bar')
    })

    it('deve filtrar valores null', () => {
      const result = cn('foo', null, 'bar')
      expect(result).toBe('foo bar')
    })

    it('deve processar arrays', () => {
      const result = cn(['foo', 'bar'], 'baz')
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain('baz')
    })

    it('deve lidar com arrays aninhados', () => {
      const result = cn(['foo', ['bar', 'baz']])
      expect(result).toContain('foo')
      expect(result).toContain('bar')
      expect(result).toContain('baz')
    })
  })

  /**
   * Teste: Casos de uso reais
   * 
   * Testa cenários práticos de uso da função cn em componentes React.
   */
  describe('Casos de uso reais', () => {
    it('deve combinar classes base com classes condicionais', () => {
      const isDisabled = false
      const isLarge = true
      const result = cn(
        'btn',
        'btn-primary',
        isDisabled && 'btn-disabled',
        isLarge && 'btn-large'
      )
      expect(result).toContain('btn')
      expect(result).toContain('btn-primary')
      expect(result).not.toContain('btn-disabled')
      expect(result).toContain('btn-large')
    })

    it('deve mesclar classes de estilo com classes utilitárias', () => {
      const result = cn('custom-class', 'p-4', 'm-2', 'text-center')
      expect(result).toContain('custom-class')
      expect(result).toContain('p-4')
      expect(result).toContain('m-2')
      expect(result).toContain('text-center')
    })
  })
})


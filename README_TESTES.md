# 🧪 Guia Rápido de Testes

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (reexecuta ao salvar)
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## Estrutura de Testes

- **59 testes** passando ✅
- **3 suites de testes**:
  - `utils.test.ts` - Testes de utilitários (função `cn`)
  - `accessibility.test.ts` - Testes de acessibilidade
  - `api.test.ts` - Testes de autenticação

## Arquivos Criados

- `jest.config.js` - Configuração do Jest
- `jest.setup.js` - Setup global dos testes
- `TESTES.md` - Documentação completa sobre testes
- `src/lib/__tests__/utils.test.ts` - Testes de utilitários
- `src/app/utils/__tests__/accessibility.test.ts` - Testes de acessibilidade
- `src/app/services/__tests__/api.test.ts` - Testes de autenticação
- `src/app/services/authHelpers.ts` - Funções auxiliares de autenticação

## Próximos Passos

Para adicionar novos testes:

1. Crie um arquivo `*.test.ts` ou `*.spec.ts` próximo ao arquivo que deseja testar
2. Ou coloque na pasta `__tests__/` correspondente
3. Execute `npm test` para verificar

Consulte `TESTES.md` para documentação completa!


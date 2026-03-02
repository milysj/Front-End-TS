# Configuração da API Java

Este documento explica como configurar a conexão do frontend com o backend Java.

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com a seguinte configuração:

```env
# URL base da API Java
# Por padrão, Spring Boot roda na porta 8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Importante:** No Next.js, variáveis de ambiente que devem ser acessíveis no cliente precisam ter o prefixo `NEXT_PUBLIC_`.

### 2. Configurações por Ambiente

#### Desenvolvimento Local
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### Produção
```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

#### Staging
```env
NEXT_PUBLIC_API_URL=https://staging-api.seudominio.com
```

## Estrutura da API

A configuração centralizada está em `src/app/config/api.config.ts`. Este arquivo contém:

- **API_BASE_URL**: URL base da API
- **API_CONFIG**: Configurações do axios
- **API_ENDPOINTS**: Todos os endpoints da API organizados por módulo

## Serviços Atualizados

Os seguintes serviços foram atualizados para usar a configuração centralizada:

- `src/app/services/api.ts` - Cliente axios com interceptors
- `src/app/services/faseService.js` - Serviços de fases
- `src/app/services/usuarioService.js` - Serviços de usuários

## Autenticação

O cliente axios está configurado para:

1. **Adicionar automaticamente o token** em todas as requisições
2. **Gerenciar tokens expirados** (401) redirecionando para login
3. **Tratar erros** comuns de forma centralizada

O token é armazenado no `localStorage` com a chave `"token"`.

## Endpoints Disponíveis

Consulte `src/app/config/api.config.ts` para ver todos os endpoints disponíveis. Os principais módulos são:

- **AUTH**: Autenticação (login, registro, etc.)
- **USERS**: Usuários
- **TRILHAS**: Trilhas de aprendizado
- **FASES**: Fases das trilhas
- **PROGRESSO**: Progresso do usuário
- **RANKING**: Rankings
- **FEEDBACK**: Feedback dos usuários

## Exemplo de Uso

```typescript
import api from "@/app/services/api";
import { API_ENDPOINTS } from "@/app/config/api.config";

// Fazer uma requisição GET
const response = await api.get(API_ENDPOINTS.USERS.ME);

// Fazer uma requisição POST
const newUser = await api.post(API_ENDPOINTS.USERS.LISTAR, userData);

// Fazer uma requisição PUT
const updated = await api.put(API_ENDPOINTS.TRILHAS.POR_ID(id), data);

// Fazer uma requisição DELETE
await api.delete(API_ENDPOINTS.FASES.POR_ID(id));
```

## Configuração do Backend Java

Certifique-se de que seu backend Java (Spring Boot) está configurado para:

1. **CORS** habilitado para o domínio do frontend
2. **Autenticação JWT** se estiver usando tokens
3. **Content-Type: application/json** nas respostas

Exemplo de configuração CORS no Spring Boot:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000") // URL do frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Troubleshooting

### Erro de CORS
- Verifique se o backend está configurado para aceitar requisições do frontend
- Adicione o domínio do frontend nas configurações CORS do Spring Boot

### Token não está sendo enviado
- Verifique se o token está sendo salvo no `localStorage`
- Verifique se o interceptor está funcionando corretamente

### Erro 401 (Não autorizado)
- O token pode estar expirado
- Verifique se o backend está validando o token corretamente
- O sistema automaticamente redireciona para `/login` em caso de 401

### Erro de conexão
- Verifique se o backend Java está rodando
- Verifique a URL configurada em `.env.local`
- Verifique se a porta está correta (padrão: 8080)


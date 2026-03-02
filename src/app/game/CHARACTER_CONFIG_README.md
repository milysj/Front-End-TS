# Configuração de Personagens e Inimigos

Este documento explica como adicionar novos personagens e inimigos ao jogo.

## Estrutura de Configuração

### Personagens Jogáveis (`CHARACTERS`)

Para adicionar um novo personagem, adicione uma entrada no objeto `CHARACTERS` em `characterConfig.ts`:

```typescript
novoPersonagem: {
  id: "novoPersonagem",           // ID único do personagem
  nome: "Nome do Personagem",     // Nome exibido no jogo
  idleGif: "/caminho/para/idle.gif",  // GIF de animação idle
  attackGifs: {
    basic: "gif_ataque_basico.gif",    // Ataque quando acerta pergunta
    special1: "gif_ataque_especial1.gif",  // Ataque especial 1
    special2: "gif_ataque_especial2.gif"   // Ataque especial 2
  },
  hpMax: 100,                     // HP máximo
  manaMax: 100,                   // Mana máxima
  ataques: [                      // Ataques especiais disponíveis
    {
      nome: "Nome do Ataque",
      custo: 20,                  // Custo de mana
      dano: 30,                   // Dano causado
      cor: 0xff4444,              // Cor do botão (hex)
      gif: "gif_do_ataque.gif"    // GIF do ataque
    }
  ],
  escala: 1.6                     // Escala do personagem
}
```

### Inimigos (`ENEMIES`)

Para adicionar um novo inimigo, adicione uma entrada no objeto `ENEMIES`:

```typescript
novoInimigo: {
  id: "novoInimigo",              // ID único do inimigo
  nome: "Nome do Inimigo",        // Nome exibido no jogo
  idleGif: "/caminho/para/idle.gif",  // GIF de animação idle
  attackGifs: {
    attack1: "gif_ataque1.gif",   // Ataque 1 (escolhido aleatoriamente)
    attack2: "gif_ataque2.gif",   // Ataque 2 (escolhido aleatoriamente)
    attack3: "gif_ataque3.gif"    // Ataque 3 (escolhido aleatoriamente)
  },
  hpMax: 100,                     // HP máximo
  manaMax: 100,                   // Mana máxima
  escala: 1.6                     // Escala do inimigo
}
```

## Como Usar

### No GameScene

O `GameScene` agora aceita um parâmetro `enemyId` opcional:

```typescript
createGameScene(Phaser, faseId, personagemUsuario, trilhaId, enemyId)
```

- `personagemUsuario`: ID do personagem (padrão: "samurai")
- `enemyId`: ID do inimigo (padrão: "spectre")

### Exemplo de Uso

```typescript
// Usar samurai vs spectre (padrão)
const scene = createGameScene(Phaser, "fase123", "samurai", "trilha1", "spectre");

// Usar novo personagem vs novo inimigo
const scene = createGameScene(Phaser, "fase123", "novoPersonagem", "trilha1", "novoInimigo");
```

## Estrutura de Pastas para GIFs

Os GIFs devem estar organizados da seguinte forma:

```
public/
  assests/
    {characterId}/          # Para personagens (ex: samurai/)
      {gif_name}.gif
    castelo/
      {enemyId}/            # Para inimigos (ex: spectre/)
        {gif_name}.gif
```

## Notas Importantes

1. **IDs devem ser únicos**: Cada personagem e inimigo precisa de um ID único
2. **Fallback automático**: Se um ID não for encontrado, o sistema usa o padrão (samurai/spectre)
3. **GIFs devem existir**: Certifique-se de que todos os GIFs referenciados existem nos caminhos especificados
4. **Escala**: A escala afeta o tamanho visual do personagem/inimigo no jogo

## Adicionando Novos Personagens/Inimigos

1. Adicione os GIFs na pasta apropriada (`public/assests/`)
2. Adicione a configuração em `characterConfig.ts`
3. Use o novo ID ao criar o `GameScene`


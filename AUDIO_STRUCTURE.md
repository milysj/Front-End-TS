# Estrutura de Áudio do Projeto

## 📁 Localização Recomendada

Crie a seguinte estrutura de diretórios dentro de `public/`:

```
public/
  └── audio/
      ├── music/          # Trilhas sonoras (música de fundo)
      │   ├── menu.mp3
      │   ├── game.mp3
      │   ├── victory.mp3
      │   └── defeat.mp3
      └── sfx/           # Efeitos sonoros
          ├── attacks/   # Sons de ataques
          │   ├── player_attack.mp3
          │   ├── enemy_attack.mp3
          │   └── special_attack.mp3
          ├── damage/    # Sons de dano
          │   ├── player_hit.mp3
          │   └── enemy_hit.mp3
          ├── ui/        # Sons de interface
          │   ├── button_click.mp3
          │   ├── correct_answer.mp3
          │   └── wrong_answer.mp3
          └── ambient/   # Sons ambientes
              └── phase_complete.mp3
```

## 🎵 Formatos Recomendados

- **MP3**: Melhor compatibilidade e tamanho menor
- **OGG**: Alternativa para melhor qualidade
- **M4A**: Suporte iOS

## 📝 Como Usar no Código

### Exemplo de uso no GameScene.ts:

```typescript
// Carregar áudio no preload()
preload() {
  // Trilha sonora
  this.load.audio('music_game', '/audio/music/game.mp3');
  
  // Efeitos sonoros
  this.load.audio('sfx_attack', '/audio/sfx/attacks/player_attack.mp3');
  this.load.audio('sfx_damage', '/audio/sfx/damage/player_hit.mp3');
  this.load.audio('sfx_correct', '/audio/sfx/ui/correct_answer.mp3');
  this.load.audio('sfx_wrong', '/audio/sfx/ui/wrong_answer.mp3');
}

// Tocar música de fundo
create() {
  const music = this.sound.add('music_game', { loop: true, volume: 0.5 });
  music.play();
}

// Tocar efeito sonoro
animaAtaque() {
  this.sound.play('sfx_attack', { volume: 0.7 });
}
```

## 🔧 Configuração de Volume

Recomenda-se criar um sistema de configuração de volume:

```typescript
// Em GameScene.ts
private musicVolume: number = 0.5;  // 50%
private sfxVolume: number = 0.7;   // 70%

// Métodos para ajustar volume
setMusicVolume(volume: number) {
  this.musicVolume = volume;
  // Atualizar todas as músicas
}

setSfxVolume(volume: number) {
  this.sfxVolume = volume;
  // Atualizar todos os efeitos
}
```

## 📌 Notas Importantes

1. **Tamanho dos arquivos**: Mantenha os arquivos pequenos (< 1MB para SFX, < 5MB para música)
2. **Compressão**: Use ferramentas como Audacity para comprimir sem perder qualidade
3. **Autoplay**: Browsers modernos bloqueiam autoplay - use interação do usuário primeiro
4. **Performance**: Pre-carregue apenas os áudios essenciais


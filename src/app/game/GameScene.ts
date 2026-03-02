// Cena principal do jogo RPG Quiz
import { PerguntaFormatada } from "./types";
import { buscarFasePorId, formatarPerguntas, registrarResposta, registrarConclusaoFase } from "./api";
import { CharacterConfig, EnemyConfig, getCharacterConfig, getEnemyConfig, getRandomEnemyAttack } from "./characterConfig";

export function createGameScene(Phaser: any, faseId: string, personagemUsuario?: string, trilhaId?: string, enemyId?: string) {
  return class GameScene extends Phaser.Scene {
    private faseId: string = faseId;
    private trilhaId: string | undefined = trilhaId;
    private personagemUsuario: string = personagemUsuario || "samurai";
    private enemyId: string = enemyId || "spectre";
    private faseOrdem: number | undefined = undefined; // Ordem da fase para determinar background
    private backgroundSprite: Phaser.GameObjects.Image | null = null; // Sprite do background da fase 1
    private perguntas: PerguntaFormatada[] = [];
    private perguntaAtual: PerguntaFormatada | null = null;
    private indicePerguntaAtual: number = 0;
    
    // Configurações de personagem e inimigo
    private characterConfig: CharacterConfig;
    private enemyConfig: EnemyConfig;

    // Estatísticas do jogo
    jogadorHP: number = 100;
    jogadorMana: number = 100;
    jogadorHPMax: number = 100; // HP máximo baseado no nível
    jogadorManaMax: number = 100; // Mana máxima baseada no nível
    nivelUsuario: number = 1; // Nível do usuário (1-100)
    inimigoHP: number = 100; // Será inicializado com enemyConfig.hpMax
    inimigoMana: number = 100; // Será inicializado com enemyConfig.manaMax
    acertos: number = 0;
    erros: number = 0;

    // Objetos do Phaser
    player!: Phaser.GameObjects.Sprite;
    playerIdleElement?: HTMLImageElement; // Elemento HTML para animação idle
    playerGolpeElement?: HTMLImageElement; // Elemento HTML para animação de golpe
    enemy!: Phaser.GameObjects.Sprite;
    enemyIdleElement?: HTMLImageElement; // Elemento HTML para animação idle do inimigo
    enemyGolpeElement?: HTMLImageElement; // Elemento HTML para animação de golpe do inimigo
    jogadorBalao!: Phaser.GameObjects.Container;
    inimigoBalao!: Phaser.GameObjects.Container;
    
    // Áudio
    private musicGame?: Phaser.Sound.BaseSound; // Música de fundo do jogo
    private musicVictory?: Phaser.Sound.BaseSound; // Música de vitória
    private musicDefeat?: Phaser.Sound.BaseSound; // Música de derrota
    private musicasDisponiveis: string[] = [
      "music_game", // Ashes of the Old Kingdom
      "music_preparation", // Preparation For War
      "music_valley" // Walk in the Valley
    ];
    private indiceMusicaAtual: number = 0;
    private btnTrocarMusica?: Phaser.GameObjects.Text;
    private btnTrocarMusicaBg?: Phaser.GameObjects.Graphics;
    private musicaMutada: boolean = false;
    jogadorSpecialGomos: Phaser.GameObjects.Graphics[] = [];
    balaoPergunta!: Phaser.GameObjects.Graphics;
    perguntaText!: Phaser.GameObjects.Text;
    opcoes: Phaser.GameObjects.Text[] = [];
    mensagemTimeout: Phaser.Time.TimerEvent | null = null;
    acaoContainer!: Phaser.GameObjects.Container;
    ataquesContainer!: Phaser.GameObjects.Container;
    itensContainer!: Phaser.GameObjects.Container;
    abaAtiva: "ataques" | "itens" = "ataques";
    specialMeter: Phaser.GameObjects.Graphics[] = [];
    specialValue: number = 0;

    readonly LETRAS = ["A", "B", "C", "D", "E"];

    constructor() {
      super({ key: "GameScene" });
      // Inicializar configurações de personagem e inimigo
      this.characterConfig = getCharacterConfig(this.personagemUsuario);
      this.enemyConfig = getEnemyConfig(this.enemyId);
    }

    // Função para embaralhar array aleatoriamente (Fisher-Yates)
    embaralharPerguntas() {
      const array = [...this.perguntas];
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      this.perguntas = array;
      this.indicePerguntaAtual = 0; // Resetar índice após embaralhar
    }

    // Função para limpar elementos HTML antes de reiniciar a cena
    limparElementosHTML() {
      try {
        // Parar todas as músicas
        if (this.musicGame?.isPlaying) {
          this.musicGame.stop();
        }
        if (this.musicVictory?.isPlaying) {
          this.musicVictory.stop();
        }
        if (this.musicDefeat?.isPlaying) {
          this.musicDefeat.stop();
        }
        
        // Remover elemento de golpe do jogador
        if (this.playerGolpeElement) {
          if (this.playerGolpeElement.parentElement) {
            this.playerGolpeElement.parentElement.removeChild(this.playerGolpeElement);
          }
          this.playerGolpeElement = undefined;
        }
        
        // Remover elemento idle do jogador
        if (this.playerIdleElement) {
          if (this.playerIdleElement.parentElement) {
            this.playerIdleElement.parentElement.removeChild(this.playerIdleElement);
          }
          this.playerIdleElement = undefined;
        }
        
        // Remover elemento de golpe do inimigo
        if (this.enemyGolpeElement) {
          if (this.enemyGolpeElement.parentElement) {
            this.enemyGolpeElement.parentElement.removeChild(this.enemyGolpeElement);
          }
          this.enemyGolpeElement = undefined;
        }
        
        // Remover elemento idle do inimigo
        if (this.enemyIdleElement) {
          if (this.enemyIdleElement.parentElement) {
            this.enemyIdleElement.parentElement.removeChild(this.enemyIdleElement);
          }
          this.enemyIdleElement = undefined;
        }
        
        // Remover todos os event listeners
        try {
          this.events.removeAllListeners("update");
          this.scale.removeAllListeners("resize");
          
          // Remover listener do window se existir
          if (typeof window !== "undefined" && (this as any)._windowResizeHandler) {
            window.removeEventListener("resize", (this as any)._windowResizeHandler);
            delete (this as any)._windowResizeHandler;
          }
        } catch (e) {
          console.warn("Erro ao remover listeners:", e);
        }
        
        // Parar todos os tweens
        try {
          this.tweens.killAll();
        } catch (e) {
          console.warn("Erro ao parar tweens:", e);
        }
      } catch (error) {
        console.error("Erro ao limpar elementos HTML:", error);
      }
    }

    // Função para calcular HP e Mana baseado no nível (1-100)
    // Nível 1 = 100 HP/Mana, Nível 100 = 1000 HP/Mana (crescimento linear)
    calcularStatusPorNivel(nivel: number): { hp: number; mana: number } {
      // Garantir que o nível está entre 1 e 100
      const nivelClamp = Math.max(1, Math.min(100, nivel));
      // Fórmula linear: 100 + (nível - 1) * 9.09...
      // No nível 1: 100 + (1-1) * 9.09 = 100
      // No nível 100: 100 + (100-1) * 9.09 ≈ 100 + 900 = 1000
      const incrementoPorNivel = 9.09; // (1000 - 100) / 99 ≈ 9.09
      const hp = 100 + (nivelClamp - 1) * incrementoPorNivel;
      const mana = 100 + (nivelClamp - 1) * incrementoPorNivel;
      return { hp: Math.round(hp), mana: Math.round(mana) };
    }

    init() {
      console.log("INIT chamado - faseId:", this.faseId);
      // Não fazer chamadas assíncronas aqui - isso pode bloquear o Phaser
      // Vamos carregar as perguntas no create() após o jogo estar rodando
      this.perguntas = [];
    }

    preload() {
      // Carregar imagens
      this.load.image("background", "/img/background-image-login-register.png");
      
      // Carregar imagem de background do castelo (usado em todas as fases)
      this.load.image("background_castelo", "/img/fases/castelo.jpg");
      
      // Carregar músicas
      this.load.audio("music_game", "/audio/music/Ashes of the Old Kingdom.mp3");
      this.load.audio("music_preparation", "/audio/music/Preparation For War.mp3");
      this.load.audio("music_valley", "/audio/music/Walk in the Valley.mp3");
      this.load.audio("music_victory", "/audio/music/Dawn of Triumph.mp3");
      this.load.audio("music_defeat", "/audio/music/Fallen Echoes.mp3");
      
      // Carregar imagem do personagem do usuário baseado na escolha
      const personagemImagem = this.getPersonagemImagem(this.personagemUsuario);
      this.load.image("player", personagemImagem);
      
      // Carregar sprite do inimigo usando configuração
      this.load.image("enemy", window.location.origin + this.enemyConfig.idleGif);
    }

    getPersonagemImagem(personagem: string): string {
      const personagens: { [key: string]: string } = {
        "Guerreiro": "/img/guerreiro.png",
        "Mago": "/img/mago.png",
        "Samurai": "/img/samurai.png",
      };
      return personagens[personagem] || "/img/guerreiro.png";
    }

    getAnimacaoIdle(personagem: string): string | null {
      const animacoes: { [key: string]: string } = {
        "Samurai": "/assests/samurai/samurai_idle.gif",
      };
      const caminho = animacoes[personagem];
      if (caminho) {
        console.log("Caminho da animação idle:", caminho);
      }
      return caminho || null;
    }

    criarAnimacaoIdle(x: number, y: number, escala: number) {
      const animacaoIdle = this.getAnimacaoIdle(this.personagemUsuario);
      if (!animacaoIdle) {
        console.log("Animação idle não disponível para:", this.personagemUsuario, "- usando sprite estático");
        if (this.player) {
          this.player.setVisible(true);
        }
        return;
      }

      console.log("Tentando criar animação idle:", animacaoIdle);

      // Garantir que o sprite está visível primeiro
      if (this.player) {
        this.player.setVisible(true);
      }

      try {
        // Calcular dimensões baseado na escala
        const alturaOriginal = 200;
        const larguraOriginal = 150;
        const alturaEscalada = alturaOriginal * escala;
        const larguraEscalada = larguraOriginal * escala;
        
        // Criar caminho absoluto
        const caminhoAbsoluto = window.location.origin + animacaoIdle;
        console.log("Caminho absoluto do GIF:", caminhoAbsoluto);
        
        // Criar elemento HTML diretamente (não usar Phaser DOM)
        const gameContainer = document.getElementById("game-container");
        if (!gameContainer) {
          console.error("Container do jogo não encontrado");
          return;
        }
        
        const img = document.createElement("img");
        img.src = caminhoAbsoluto;
        img.style.position = "absolute";
        img.style.width = `${larguraEscalada}px`;
        img.style.height = `${alturaEscalada}px`;
        img.style.minWidth = `${larguraEscalada}px`;
        img.style.minHeight = `${alturaEscalada}px`;
        img.style.maxWidth = `${larguraEscalada}px`;
        img.style.maxHeight = `${alturaEscalada}px`;
        img.style.imageRendering = "pixelated";
        img.style.pointerEvents = "none";
        img.style.zIndex = "1"; // Muito baixo - elementos HTML sempre ficam acima do canvas Phaser
        img.style.display = "none"; // Inicialmente escondido
        
        // Função para atualizar posição
        const atualizarPosicao = () => {
          if (this.player && img.parentElement) {
            const canvas = this.game.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            const gameX = this.player.x;
            const gameY = this.player.y;
            
            // Converter coordenadas do jogo para coordenadas da tela
            const screenX = canvasRect.left + (gameX / this.scale.width) * canvasRect.width;
            const screenY = canvasRect.top + (gameY / this.scale.height) * canvasRect.height;
            
            img.style.left = `${screenX - larguraEscalada / 2}px`;
            img.style.top = `${screenY - alturaEscalada}px`; // Base do sprite
          }
        };
        
        // Quando o GIF carregar
        img.onload = () => {
          console.log("✅ GIF carregado com sucesso!");
          console.log("GIF dimensions:", img.naturalWidth, "x", img.naturalHeight);
          
          if (img.naturalWidth > 0) {
            // Adicionar ao DOM
            gameContainer.appendChild(img);
            img.style.display = "block";
            
            // Esconder sprite estático
            if (this.player) {
              this.player.setVisible(false);
              console.log("Sprite estático escondido");
            }
            
            // Atualizar posição inicial
            atualizarPosicao();
            
            // Atualizar posição a cada frame
            this.events.on("update", atualizarPosicao);
            
            // Atualizar posição no resize
            this.scale.on("resize", atualizarPosicao);
            
            console.log("✅ Animação idle ativa!");
          }
        };
        
        img.onerror = () => {
          console.error("❌ Erro ao carregar GIF:", caminhoAbsoluto);
          if (this.player) {
            this.player.setVisible(true);
          }
        };
        
        // Armazenar referência
        this.playerIdleElement = img;
        
        // Tentar carregar o GIF
        console.log("Tentando carregar GIF...");
        
      } catch (error) {
        console.error("Erro ao criar animação idle:", error);
        if (this.player) {
          this.player.setVisible(true);
        }
      }
    }

    criarAnimacaoIdleInimigo(x: number, y: number, escala: number) {
      // Caminho do GIF do inimigo usando configuração
      const animacaoIdleInimigo = this.enemyConfig.idleGif;
      
      console.log("Tentando criar animação idle do inimigo:", animacaoIdleInimigo);

      // Garantir que o sprite está visível primeiro
      if (this.enemy) {
        this.enemy.setVisible(true);
      }

      try {
        // Criar caminho absoluto
        const caminhoAbsoluto = window.location.origin + animacaoIdleInimigo;
        console.log("Caminho absoluto do GIF do inimigo:", caminhoAbsoluto);
        
        // Criar elemento HTML diretamente (não usar Phaser DOM)
        const gameContainer = document.getElementById("game-container");
        if (!gameContainer) {
          console.error("Container do jogo não encontrado");
          return;
        }
        
        const img = document.createElement("img");
        img.src = caminhoAbsoluto;
        img.style.position = "absolute";
        img.style.imageRendering = "pixelated";
        img.style.pointerEvents = "none";
        img.style.zIndex = "1"; // Muito baixo - elementos HTML sempre ficam acima do canvas Phaser
        img.style.display = "none"; // Inicialmente escondido
        // Removido objectFit para manter o tamanho correto
        
        // Variáveis para armazenar dimensões escaladas
        let larguraEscalada = 0;
        let alturaEscalada = 0;
        
        // Função para atualizar posição
        const atualizarPosicao = () => {
          if (this.enemy && img.parentElement && larguraEscalada > 0 && alturaEscalada > 0) {
            const canvas = this.game.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            const gameX = this.enemy.x;
            const gameY = this.enemy.y;
            
            // Converter coordenadas do jogo para coordenadas da tela
            const screenX = canvasRect.left + (gameX / this.scale.width) * canvasRect.width;
            const screenY = canvasRect.top + (gameY / this.scale.height) * canvasRect.height;
            
            img.style.left = `${screenX - larguraEscalada / 2}px`;
            img.style.top = `${screenY - alturaEscalada}px`; // Base do sprite
          }
        };
        
        // Quando o GIF carregar
        img.onload = () => {
          console.log("✅ GIF do inimigo carregado com sucesso!");
          console.log("GIF dimensions:", img.naturalWidth, "x", img.naturalHeight);
          
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            // Calcular dimensões mantendo a proporção original do GIF para evitar distorção
            const proporcaoOriginal = img.naturalWidth / img.naturalHeight;
            
            // Usar altura como base e calcular largura proporcionalmente
            const alturaBase = 200; // Altura base de referência
            const larguraBase = alturaBase * proporcaoOriginal;
            
            // Aplicar escala mantendo proporção
            alturaEscalada = alturaBase * escala;
            larguraEscalada = larguraBase * escala;
            
            // Definir dimensões mantendo proporção para evitar distorção
            img.style.width = `${larguraEscalada}px`;
            img.style.height = `${alturaEscalada}px`;
            img.style.minWidth = `${larguraEscalada}px`;
            img.style.minHeight = `${alturaEscalada}px`;
            img.style.maxWidth = `${larguraEscalada}px`;
            img.style.maxHeight = `${alturaEscalada}px`;
            
            console.log("Dimensões escaladas do inimigo:", larguraEscalada, "x", alturaEscalada);
            console.log("Proporção mantida:", proporcaoOriginal);
            
            // Adicionar ao DOM
            gameContainer.appendChild(img);
            
            // Esconder sprite estático
            if (this.enemy) {
              this.enemy.setVisible(false);
              console.log("Sprite estático do inimigo escondido");
              console.log("Enemy position:", this.enemy.x, this.enemy.y);
            }
            
            // Aguardar um frame para garantir que o sprite está posicionado
            requestAnimationFrame(() => {
              // Atualizar posição inicial imediatamente
              atualizarPosicao();
              img.style.display = "block";
              
              // Atualizar posição a cada frame
              this.events.on("update", atualizarPosicao);
              
              // Atualizar posição no resize
              this.scale.on("resize", atualizarPosicao);
              
              console.log("✅ Animação idle do inimigo ativa!");
              console.log("Enemy sprite position:", this.enemy?.x, this.enemy?.y);
            });
          }
        };
        
        img.onerror = () => {
          console.error("❌ Erro ao carregar GIF do inimigo:", caminhoAbsoluto);
          if (this.enemy) {
            this.enemy.setVisible(true);
          }
        };
        
        // Armazenar referência
        this.enemyIdleElement = img;
        
        // Tentar carregar o GIF
        console.log("Tentando carregar GIF do inimigo...");
        
      } catch (error) {
        console.error("Erro ao criar animação idle do inimigo:", error);
        if (this.enemy) {
          this.enemy.setVisible(true);
        }
      }
    }

    async create() {
      try {
        const { width, height } = this.scale;
        console.log("=== CREATE INICIADO ===");
        console.log("Dimensões:", width, height);
        
        // Verificar estado de mute do localStorage
        if (typeof window !== "undefined") {
          const muteSalvo = localStorage.getItem("game_music_muted");
          this.musicaMutada = muteSalvo === "true";
        }
        
        // Iniciar música de fundo do jogo em loop
        try {
          const musicaAtual = this.musicasDisponiveis[this.indiceMusicaAtual];
          const music = this.sound.add(musicaAtual, { loop: true, volume: this.musicaMutada ? 0 : 0.5 });
          if (music) {
            this.musicGame = music;
            if (!this.musicaMutada) {
              music.play();
            }
            console.log("✅ Música de fundo iniciada:", musicaAtual, this.musicaMutada ? "(mutada)" : "");
          }
        } catch (error) {
          console.warn("⚠️ Erro ao iniciar música de fundo:", error);
        }
        
        // Criar botão de trocar música no canto superior direito
        this.criarBotaoTrocarMusica();

        // ========== LAYOUT: ÁREA SUPERIOR (60%) E INFERIOR (40%) ==========
        const alturaSuperior = height * 0.6; // 60% da altura
        const alturaInferior = height * 0.4; // 40% da altura
        
        // Área superior com fundo - gradiente verde padrão inicialmente
        // O background da fase 1 será aplicado depois que a ordem da fase for obtida
        const areaSuperior = this.add.graphics();
        // Gradiente verde padrão (mais escuro embaixo, mais claro em cima)
        for (let i = 0; i < alturaSuperior; i++) {
          const ratio = i / alturaSuperior;
          const green = Math.floor(0x00 + (0x80 - 0x00) * (1 - ratio));
          areaSuperior.fillStyle(Phaser.Display.Color.GetColor(0, green, 0), 1);
          areaSuperior.fillRect(0, i, width, 1);
        }
        areaSuperior.setDepth(-50);
        
        // Área de personagens (retângulo escuro com borda dourada)
        const larguraAreaPersonagens = width * 0.9;
        const alturaAreaPersonagens = alturaSuperior * 0.8;
        const xAreaPersonagens = width * 0.05;
        const yAreaPersonagens = alturaSuperior * 0.05; // Reduzido para dar mais espaço acima
        
        // Retângulo preto removido - área de personagens agora é transparente
        // Mantendo apenas as variáveis de posicionamento para os personagens
        
        // Área inferior dividida em dois painéis
        const yInferior = alturaSuperior;
        const larguraPainel = width * 0.48;
        const gapPainel = width * 0.02;
        
        // Painel esquerdo (pergunta) - estilo elegante
        const painelEsquerdo = this.add.graphics();
        // Gradiente escuro
        painelEsquerdo.fillStyle(0x1a1a2a, 1);
        painelEsquerdo.fillRoundedRect(gapPainel, yInferior + gapPainel, larguraPainel, alturaInferior - gapPainel * 2, 12);
        // Borda azul brilhante
        painelEsquerdo.lineStyle(3, 0x4a9eff, 0.8);
        painelEsquerdo.strokeRoundedRect(gapPainel, yInferior + gapPainel, larguraPainel, alturaInferior - gapPainel * 2, 12);
        // Sombra externa
        painelEsquerdo.fillStyle(0x000000, 0.3);
        painelEsquerdo.fillRoundedRect(gapPainel + 2, yInferior + gapPainel + 2, larguraPainel, alturaInferior - gapPainel * 2, 12);
        painelEsquerdo.setDepth(-30);
        
        // Painel direito (ataques e itens) - estilo elegante
        const painelDireito = this.add.graphics();
        // Gradiente escuro
        painelDireito.fillStyle(0x1a1a2a, 1);
        painelDireito.fillRoundedRect(larguraPainel + gapPainel * 2, yInferior + gapPainel, larguraPainel, alturaInferior - gapPainel * 2, 12);
        // Borda roxa brilhante
        painelDireito.lineStyle(3, 0x9a4eff, 0.8);
        painelDireito.strokeRoundedRect(larguraPainel + gapPainel * 2, yInferior + gapPainel, larguraPainel, alturaInferior - gapPainel * 2, 12);
        // Sombra externa
        painelDireito.fillStyle(0x000000, 0.3);
        painelDireito.fillRoundedRect(larguraPainel + gapPainel * 2 + 2, yInferior + gapPainel + 2, larguraPainel, alturaInferior - gapPainel * 2, 12);
        painelDireito.setDepth(-30);

        // Criar sprites dos personagens dentro da área de personagens
        // Usar escalas do characterConfig e enemyConfig
        const characterConfig = getCharacterConfig(this.personagemUsuario);
        const escalaPersonagem = characterConfig.escala; // Escala do personagem do config
        const escalaInimigo = this.enemyConfig.escala; // Escala do inimigo do config
        const yPersonagens = yAreaPersonagens + alturaAreaPersonagens * 1.0; // No fundo da área (movido mais para baixo)
        
        // Calcular posições baseadas na largura real da área de personagens
        // Jogador à esquerda (20% da largura da área a partir do início)
        const xJogador = xAreaPersonagens + larguraAreaPersonagens * 0.20;
        // Inimigo mais à esquerda (60% da largura da área a partir do início)
        // Ajuste específico para Cavaleiro Decaído: mais à esquerda e mais para baixo
        let xInimigo = xAreaPersonagens + larguraAreaPersonagens * 0.60;
        let yInimigo = yPersonagens; // Mesma altura do jogador para ficarem alinhados
        if (this.enemyConfig.id === "cavaleiroDecaido") {
          xInimigo = xAreaPersonagens + larguraAreaPersonagens * 0.55; // Mais à esquerda
          yInimigo = yPersonagens + alturaAreaPersonagens * 0.05; // Mais para baixo
        }
        
        try {
          if (this.textures.exists("player")) {
            this.player = this.add.sprite(xJogador, yPersonagens, "player")
              .setOrigin(0.5, 1)
              .setScale(escalaPersonagem)
              .setVisible(true); // Garantir que está visível
            console.log("✅ Player sprite criado - visível por padrão");
            console.log("Player position:", xJogador, yPersonagens);
            console.log("Player scale:", escalaPersonagem);
            
            // Aguardar um frame antes de tentar criar animação idle
            this.time.delayedCall(100, () => {
              // Criar animação idle se disponível (ela vai esconder o sprite se funcionar)
              this.criarAnimacaoIdle(xJogador, yPersonagens, escalaPersonagem);
            });
          } else {
            console.warn("Player não encontrado, criando placeholder");
            const playerRect = this.add.rectangle(xJogador, yPersonagens, 80, 120, 0x00ff00);
            const playerText = this.add.text(xJogador, yPersonagens - 60, "Jogador", {
              fontSize: "20px",
              color: "#fff"
            }).setOrigin(0.5);
            this.player = playerRect as any;
          }
        } catch (error) {
          console.error("Erro ao criar player:", error);
          const playerRect = this.add.rectangle(xJogador, yPersonagens, 80, 120, 0x00ff00);
          this.player = playerRect as any;
        }
        
        try {
          if (this.textures.exists("enemy")) {
            this.enemy = this.add.sprite(xInimigo, yInimigo, "enemy")
              .setOrigin(0.5, 1)
              .setScale(escalaInimigo)
              .setVisible(true); // Garantir que está visível
            console.log("✅ Enemy sprite criado");
            console.log("Enemy position:", xInimigo, yInimigo);
            console.log("Enemy scale:", escalaInimigo);
            
            // Aguardar um frame antes de tentar criar animação idle
            this.time.delayedCall(100, () => {
              // Criar animação idle do inimigo
              this.criarAnimacaoIdleInimigo(xInimigo, yInimigo, escalaInimigo);
            });
          } else {
            console.warn("Enemy não encontrado, criando placeholder");
            const enemyRect = this.add.rectangle(xInimigo, yInimigo, 64, 96, 0xff0000); // Tamanho reduzido
            const enemyText = this.add.text(xInimigo, yInimigo - 48, "Inimigo", {
              fontSize: "18px",
              color: "#fff"
            }).setOrigin(0.5);
            this.enemy = enemyRect as any;
          }
        } catch (error) {
          console.error("Erro ao criar enemy:", error);
          const enemyRect = this.add.rectangle(xInimigo, yInimigo, 64, 96, 0xff0000);
          this.enemy = enemyRect as any;
        }

        console.log("Criando elementos do jogo...");

        // Buscar nível do usuário e calcular HP/Mana ANTES de criar os balões
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const progressoRes = await fetch(`${API_URL}/api/progresso/usuario`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (progressoRes.ok) {
              const progressoData = await progressoRes.json();
              const nivel = progressoData.nivel || 1; // Default nível 1 se não houver
              this.nivelUsuario = Math.max(1, Math.min(100, nivel)); // Garantir entre 1 e 100
              
              // Calcular HP e Mana baseados no nível
              const status = this.calcularStatusPorNivel(this.nivelUsuario);
              this.jogadorHPMax = status.hp;
              this.jogadorManaMax = status.mana;
              this.jogadorHP = status.hp; // Começar com HP cheio
              this.jogadorMana = status.mana; // Começar com Mana cheia
              
              console.log(`Nível do usuário: ${this.nivelUsuario}, HP: ${this.jogadorHP}/${this.jogadorHPMax}, Mana: ${this.jogadorMana}/${this.jogadorManaMax}`);
            } else {
              // Se não conseguir buscar, usar valores padrão (nível 1)
              console.warn("Não foi possível buscar nível do usuário, usando valores padrão");
              this.nivelUsuario = 1;
              const status = this.calcularStatusPorNivel(1);
              this.jogadorHPMax = status.hp;
              this.jogadorManaMax = status.mana;
              this.jogadorHP = status.hp;
              this.jogadorMana = status.mana;
            }
          } else {
            // Sem token, usar valores padrão
            this.nivelUsuario = 1;
            const status = this.calcularStatusPorNivel(1);
            this.jogadorHPMax = status.hp;
            this.jogadorManaMax = status.mana;
            this.jogadorHP = status.hp;
            this.jogadorMana = status.mana;
          }
        } catch (error) {
          console.error("Erro ao buscar nível do usuário:", error);
          // Em caso de erro, usar valores padrão
          this.nivelUsuario = 1;
          const status = this.calcularStatusPorNivel(1);
          this.jogadorHPMax = status.hp;
          this.jogadorManaMax = status.mana;
          this.jogadorHP = status.hp;
          this.jogadorMana = status.mana;
        }

        // Inicializar HP e Mana do inimigo com valores da configuração
        this.inimigoHP = this.enemyConfig.hpMax;
        this.inimigoMana = this.enemyConfig.manaMax;
        console.log(`✅ Inimigo ${this.enemyConfig.nome} inicializado: HP=${this.inimigoHP}, Mana=${this.inimigoMana}`);

        try {
          // Balões de info (agora com HP/Mana corretos baseados no nível e configuração)
          this.criarBaloesInfo();
          console.log("✅ Balões de info criados");
        } catch (error) {
          console.error("Erro ao criar balões de info:", error);
        }

        try {
          // Balão de pergunta
          this.createPerguntaBalao();
          console.log("✅ Balão de pergunta criado");
        } catch (error) {
          console.error("Erro ao criar balão de pergunta:", error);
        }

        // Carregar perguntas da API agora (assíncrono)
        try {
          const faseData = await buscarFasePorId(this.faseId);
          this.perguntas = formatarPerguntas(faseData.perguntas);
          
          // Armazenar a ordem da fase para determinar o background
          if (faseData.ordem !== undefined) {
            this.faseOrdem = faseData.ordem;
            console.log("📋 Ordem da fase:", this.faseOrdem);
            
            // Aplicar imagem de background do castelo em todas as fases
            if (this.textures.exists("background_castelo")) {
              // Remover gradiente verde se existir
              const graphics = this.children.list.filter((child: any) => 
                child instanceof Phaser.GameObjects.Graphics && child.depth === -50
              );
              graphics.forEach((g: Phaser.GameObjects.Graphics) => {
                if (g) {
                  g.clear();
                  g.destroy();
                }
              });
              
              // Criar sprite de background do castelo
              const { width, height } = this.scale;
              const alturaSuperior = height * 0.6;
              this.backgroundSprite = this.add.image(0, 0, "background_castelo");
              if (this.backgroundSprite) {
                this.backgroundSprite.setOrigin(0, 0);
                this.backgroundSprite.setDisplaySize(width, alturaSuperior);
                this.backgroundSprite.setDepth(-50);
                this.backgroundSprite.setAlpha(0.9); // Levemente transparente para não sobrepor demais
                
                console.log("✅ Background do castelo aplicado");
              }
            }
          }
          
          if (this.perguntas.length === 0) {
            this.perguntas = [{
              id: 1,
              texto: "Nenhuma pergunta disponível",
              alternativas: ["Opção 1", "Opção 2", "Opção 3"],
              resposta: 0,
            }];
          }
          
          // Embaralhar perguntas inicialmente
          if (this.perguntas.length > 0) {
            this.embaralharPerguntas();
          }
        } catch (error) {
          console.error("Erro ao carregar perguntas:", error);
          this.perguntas = [{
            id: 1,
            texto: "Erro ao carregar perguntas",
            alternativas: ["OK"],
            resposta: 0,
          }];
        }

        // Carregar primeira pergunta
        this.loadPergunta();

        // Balão de ações
        this.criarBalaoAcoes();
        
        // Botão voltar
        this.criarBotaoVoltar();

        // Resize handler - usar debounce para evitar muitas chamadas
        let resizeTimeout: NodeJS.Timeout | null = null;
        const handleResize = () => {
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            this.onResize();
          }, 100);
        };
        this.scale.on("resize", handleResize);
        
        // Também ouvir resize do window para garantir responsividade
        if (typeof window !== "undefined") {
          window.addEventListener("resize", handleResize);
          (this as any)._windowResizeHandler = handleResize;
        }

        console.log("=== CREATE COMPLETO - JOGO DEVE ESTAR VISÍVEL ===");
      } catch (error) {
        console.error("ERRO CRÍTICO NO CREATE:", error);
        // Criar um texto de erro visível
        const errorText = this.add.text(this.scale.width / 2, this.scale.height / 2, "ERRO AO CARREGAR JOGO", {
          fontSize: "24px",
          color: "#ff0000",
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        errorText.setDepth(1000);
        throw error;
      }
    }

    onResize() {
      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      
      // Atualizar tamanho do background do castelo (usado em todas as fases)
      if (this.backgroundSprite) {
        this.backgroundSprite.setDisplaySize(width, alturaSuperior);
      }
      
      const larguraAreaPersonagens = width * 0.9;
      const alturaAreaPersonagens = alturaSuperior * 0.8;
      const xAreaPersonagens = width * 0.05;
      const yAreaPersonagens = alturaSuperior * 0.05; // Reduzido para dar mais espaço acima
      const yPersonagens = yAreaPersonagens + alturaAreaPersonagens * 1.05; // Mais para baixo, saindo um pouco da área
      
      // Calcular posições baseadas na largura real da área de personagens
      const xJogador = xAreaPersonagens + larguraAreaPersonagens * 0.20;
      // Ajuste específico para Cavaleiro Decaído: mais à esquerda e mais para baixo
      let xInimigo = xAreaPersonagens + larguraAreaPersonagens * 0.60;
      let yInimigo = yPersonagens; // Mesma altura do jogador
      if (this.enemyConfig.id === "cavaleiroDecaido") {
        xInimigo = xAreaPersonagens + larguraAreaPersonagens * 0.55; // Mais à esquerda
        yInimigo = yPersonagens + alturaAreaPersonagens * 0.05; // Mais para baixo
      }
      
      // Reposicionar sprites
      if (this.player) {
        this.player.setPosition(xJogador, yPersonagens);
        // Atualizar posição do elemento idle se existir
        if (this.playerIdleElement && this.playerIdleElement.parentElement) {
          const canvas = this.game.canvas;
          const canvasRect = canvas.getBoundingClientRect();
          const gameX = this.player.x;
          const gameY = this.player.y;
          const characterConfig = getCharacterConfig(this.personagemUsuario);
          const escalaPersonagem = characterConfig.escala;
          const alturaEscalada = 200 * escalaPersonagem;
          const larguraEscalada = 150 * escalaPersonagem;
          
          const screenX = canvasRect.left + (gameX / this.scale.width) * canvasRect.width;
          const screenY = canvasRect.top + (gameY / this.scale.height) * canvasRect.height;
          
          this.playerIdleElement.style.left = `${screenX - larguraEscalada / 2}px`;
          this.playerIdleElement.style.top = `${screenY - alturaEscalada}px`;
        }
      }
      if (this.enemy) {
        this.enemy.setPosition(xInimigo, yInimigo);
        // Atualizar posição do elemento idle do inimigo se existir
        if (this.enemyIdleElement && this.enemyIdleElement.parentElement) {
          const canvas = this.game.canvas;
          const canvasRect = canvas.getBoundingClientRect();
          const gameX = this.enemy.x;
          const gameY = this.enemy.y;
          
          // Usar dimensões reais do elemento para manter proporção
          const larguraEscalada = this.enemyIdleElement.offsetWidth || 0;
          const alturaEscalada = this.enemyIdleElement.offsetHeight || 0;
          
          const screenX = canvasRect.left + (gameX / this.scale.width) * canvasRect.width;
          const screenY = canvasRect.top + (gameY / this.scale.height) * canvasRect.height;
          
          this.enemyIdleElement.style.left = `${screenX - larguraEscalada / 2}px`;
          this.enemyIdleElement.style.top = `${screenY - alturaEscalada}px`;
        }
      }

      // Reposicionar balões em posições fixas (simétricos) - ajustado para ficar visível mas acima dos personagens
      // Posicionar balões bem no topo para não serem cobertos pelos elementos HTML dos personagens
      const yBalaoFixo = Math.max(40, alturaSuperior * 0.05); // Bem no topo, mínimo 40px
      const infoWidth = Math.max(200, width * 0.15); // Responsivo: mínimo 200px ou 15% da largura
      
      if (this.jogadorBalao) {
        // Balão do jogador: ajustado para não ficar em cima do botão voltar
        // Botão voltar está em padding (10-20px), então mover o balão mais para a direita
        const btnVoltarWidth = Math.max(90, Math.min(130, width * 0.12));
        const paddingBtnVoltar = Math.max(10, Math.min(20, width * 0.015));
        const xBalaoJogador = Math.max(paddingBtnVoltar + btnVoltarWidth + 30, xAreaPersonagens + infoWidth / 2 + 20);
        this.jogadorBalao.setPosition(xBalaoJogador, yBalaoFixo);
      }
      if (this.inimigoBalao) {
        // Balão do inimigo: trazido um pouco para a esquerda
        const xBalaoInimigo = xAreaPersonagens + larguraAreaPersonagens - infoWidth / 2 - 50; // Reduzido de 20 para 50
        this.inimigoBalao.setPosition(xBalaoInimigo, yBalaoFixo);
      }
      
      // Reposicionar balão de pergunta
      if (this.balaoPergunta && this.perguntaText) {
        const alturaSuperiorPergunta = height * 0.6;
        const alturaInferiorPergunta = height * 0.4;
        const larguraPainelPergunta = width * 0.48;
        const gapPainelPergunta = width * 0.02;
        const yInferiorPergunta = alturaSuperiorPergunta;
        
        const balaoX = gapPainelPergunta + 20;
        const balaoY = yInferiorPergunta + gapPainelPergunta + 10;
        const balaoWidth = larguraPainelPergunta - 40;
        const balaoHeight = alturaInferiorPergunta - gapPainelPergunta * 2 - 30;
        
        // Redesenhar balão de pergunta
        this.balaoPergunta.clear();
        this.balaoPergunta.fillStyle(0x000000, 0.4);
        this.balaoPergunta.fillRoundedRect(balaoX + 3, balaoY + 3, balaoWidth, balaoHeight, 12);
        this.balaoPergunta.fillGradientStyle(0x1a1a2a, 0x1a1a2a, 0x0f0f1a, 0x0f0f1a, 1);
        this.balaoPergunta.fillRoundedRect(balaoX, balaoY, balaoWidth, balaoHeight, 12);
        this.balaoPergunta.lineStyle(3, 0x4a9eff, 1);
        this.balaoPergunta.strokeRoundedRect(balaoX, balaoY, balaoWidth, balaoHeight, 12);
        this.balaoPergunta.lineStyle(1, 0x6ab8ff, 0.5);
        this.balaoPergunta.strokeRoundedRect(balaoX + 2, balaoY + 2, balaoWidth - 4, balaoHeight - 4, 10);
        
        // Reposicionar texto da pergunta
        const paddingTexto = 15;
        const fontSize = Math.max(20, Math.min(32, width * 0.04)); // Responsivo: entre 20px e 32px
        this.perguntaText.setPosition(balaoX + paddingTexto, balaoY + paddingTexto);
        this.perguntaText.setStyle({ 
          fontSize: `${fontSize}px`,
          wordWrap: { width: balaoWidth - (paddingTexto * 2) }
        });
        
        // Reposicionar opções se existirem
        if (this.opcoes && this.opcoes.length > 0) {
          // Recriar opções com novos tamanhos responsivos
          const perguntaAtualTemp = this.perguntaAtual;
          this.criarOpcoes();
          // Restaurar pergunta atual após recriar opções
          if (perguntaAtualTemp && this.perguntaText) {
            this.perguntaText.setText(perguntaAtualTemp.texto);
            this.ajustarTextoAoBalao();
          }
        }
      }
      
      // O fundo verde já é desenhado no create e não precisa ser redesenhado no resize
      // pois usa porcentagens que se ajustam automaticamente
    }

    criarBaloesInfo() {
      // Criar balão do jogador
      this.criarBalaoJogador();
      
      // Criar balão do inimigo
      this.criarBalaoInimigo();
    }

    async criarBalaoJogador() {
      // Posição fixa mais à direita na área de personagens
      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      const larguraAreaPersonagens = width * 0.9;
      const xAreaPersonagens = width * 0.05;
      const yAreaPersonagens = alturaSuperior * 0.05; // Reduzido para dar mais espaço acima
      // Calcular largura do balão para posicionar corretamente
      const fontSize = Math.max(14, Math.round(this.scale.width * 0.015));
      const padding = 8;
      
      // Buscar username do usuário para calcular largura
      let usernameUsuario = "Jogador";
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            if (userData.username) {
              usernameUsuario = userData.username;
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar username:", error);
      }
      
      // Criar texto temporário para medir a largura do username (fora da tela e invisível)
      const tempText = this.add.text(-9999, -9999, usernameUsuario, {
        fontSize: `${fontSize + 2}px`,
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 2
      }).setVisible(false);
      const usernameWidth = tempText.width;
      tempText.destroy();
      
      // Calcular largura do balão
      const larguraMinima = 200;
      const larguraBaseadaUsername = usernameWidth + (padding * 2) + 80;
      const infoWidth = Math.max(larguraMinima, larguraBaseadaUsername);
      
      // Posição ajustada para não ficar em cima do botão voltar
      // Botão voltar está em padding (10-20px), então mover o balão mais para a direita
      const btnVoltarWidth = Math.max(90, Math.min(130, width * 0.12));
      const paddingBtnVoltar = Math.max(10, Math.min(20, width * 0.015));
      const xBalaoJogador = Math.max(paddingBtnVoltar + btnVoltarWidth + 30, xAreaPersonagens + infoWidth / 2 + 20);
      // Posicionar balão bem no topo para não ser coberto pelos elementos HTML dos personagens
      const yBalaoJogador = Math.max(40, alturaSuperior * 0.05); // Bem no topo, mínimo 40px
      const container = this.add.container(xBalaoJogador, yBalaoJogador);
      const infoHeight = 100; // Aumentado para acomodar todos os elementos
      
      // Fundo do balão (com gradiente e sombra)
      const balao = this.add.graphics();
      // Sombra externa
      balao.fillStyle(0x000000, 0.3);
      balao.fillRoundedRect(-infoWidth / 2 + 2, 2, infoWidth, infoHeight, 8);
      // Fundo principal com gradiente sutil
      balao.fillGradientStyle(0x2a2a3a, 0x2a2a3a, 0x1a1a2a, 0x1a1a2a, 1);
      balao.fillRoundedRect(-infoWidth / 2, 0, infoWidth, infoHeight, 8);
      // Borda dupla (externa e interna)
      balao.lineStyle(2, 0x4a4a5a, 0.8);
      balao.strokeRoundedRect(-infoWidth / 2, 0, infoWidth, infoHeight, 8);
      balao.lineStyle(1, 0x5a5a6a, 0.6);
      balao.strokeRoundedRect(-infoWidth / 2 + 1, 1, infoWidth - 2, infoHeight - 2, 7);
      
      // Nome do jogador (maior e mais destacado)
      const nomeText = this.add.text(-infoWidth / 2 + padding, padding, usernameUsuario, {
        fontSize: `${fontSize + 2}px`,
        color: "#ffd700", // Dourado
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0, 0);
      
      // Linha separadora abaixo do nome (ajustada ao tamanho do username)
      const linhaSeparadora = this.add.graphics();
      linhaSeparadora.lineStyle(1, 0x4a4a5a, 0.5);
      // Usar a largura do texto do nome + padding para a linha
      const linhaLargura = Math.min(usernameWidth + padding * 2, infoWidth - padding * 2);
      linhaSeparadora.lineBetween(-infoWidth / 2 + padding, padding + fontSize + 4, -infoWidth / 2 + padding + linhaLargura, padding + fontSize + 4);
      
      // Barra de HP
      const barHeight = 10;
      const barGap = 4;
      const hpY = padding + fontSize + 4 + 6;
      const hpLabel = this.add.text(-infoWidth / 2 + padding, hpY, "HP", {
        fontSize: `${fontSize * 0.7}px`,
        color: "#ff4444",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      
      const hpBarBg = this.add.graphics();
      hpBarBg.fillStyle(0x1a1a1a, 1);
      hpBarBg.fillRoundedRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, infoWidth - padding * 2 - 25 - 35, barHeight, 4);
      hpBarBg.lineStyle(1, 0x333333, 0.8);
      hpBarBg.strokeRoundedRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, infoWidth - padding * 2 - 25 - 35, barHeight, 4);
      
      const hpBar = this.add.graphics();
      hpBar.fillStyle(0x00ff00, 1);
      hpBar.fillRoundedRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorHP / this.jogadorHPMax), barHeight, 4);
      // Brilho no topo da barra
      hpBar.fillStyle(0x88ff88, 0.8);
      hpBar.fillRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorHP / this.jogadorHPMax), barHeight / 2);
      
      const hpText = this.add.text(infoWidth / 2 - padding - 35, hpY, `${this.jogadorHP}/${this.jogadorHPMax}`, {
        fontSize: `${fontSize * 0.65}px`,
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(1, 0.5);
      
      // Barra de Mana
      const manaY = hpY + barHeight + barGap;
      const manaLabel = this.add.text(-infoWidth / 2 + padding, manaY, "MP", {
        fontSize: `${fontSize * 0.7}px`,
        color: "#4488ff",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      
      const manaBarBg = this.add.graphics();
      manaBarBg.fillStyle(0x1a1a1a, 1);
      manaBarBg.fillRoundedRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, infoWidth - padding * 2 - 25 - 35, barHeight, 4);
      manaBarBg.lineStyle(1, 0x333333, 0.8);
      manaBarBg.strokeRoundedRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, infoWidth - padding * 2 - 25 - 35, barHeight, 4);
      
      const manaBar = this.add.graphics();
      manaBar.fillStyle(0x4488ff, 1);
      manaBar.fillRoundedRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorMana / this.jogadorManaMax), barHeight, 4);
      // Brilho no topo da barra
      manaBar.fillStyle(0x88aaff, 0.8);
      manaBar.fillRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorMana / this.jogadorManaMax), barHeight / 2);
      
      const manaText = this.add.text(infoWidth / 2 - padding - 35, manaY, `${this.jogadorMana}/${this.jogadorManaMax}`, {
        fontSize: `${fontSize * 0.65}px`,
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(1, 0.5);

      // ========== BARRA ESPECIAL (5 GOMOS) ==========
      const specialY = manaY + barHeight + barGap + 4; // Abaixo da barra de mana
      const specialLabel = this.add.text(-infoWidth / 2 + padding, specialY, "ESP", {
        fontSize: `${fontSize * 0.7}px`,
        color: "#ffaa00", // Orange color for ESP label
        fontStyle: "bold"
      }).setOrigin(0, 0.5);

      const gomoWidth = 26; // Reduzido para caber melhor
      const gomoHeight = 12;
      const gomoGap = 3; // Reduzido para caber melhor
      
      // Calcular largura total dos gomos
      const larguraTotalGomos = (5 * gomoWidth) + (4 * gomoGap);
      
      // Calcular espaço disponível após o label ESP
      const labelWidth = specialLabel.width; // Usar a largura real do texto
      const espacoEntreLabelEGomos = 6; // Espaço entre label e gomos
      const limiteEsquerdo = -infoWidth / 2 + padding;
      const limiteDireito = infoWidth / 2 - padding;
      const espacoDisponivel = limiteDireito - (limiteEsquerdo + labelWidth + espacoEntreLabelEGomos);
      
      // Centralizar os gomos no espaço disponível, garantindo que não ultrapasse os limites
      let specialStartX = limiteEsquerdo + labelWidth + espacoEntreLabelEGomos + (espacoDisponivel - larguraTotalGomos) / 2;
      
      // Garantir que não ultrapasse o limite direito
      const finalDireitoGomos = specialStartX + larguraTotalGomos;
      if (finalDireitoGomos > limiteDireito) {
        specialStartX = limiteDireito - larguraTotalGomos;
      }
      
      // Garantir que não ultrapasse o limite esquerdo (após o label)
      const inicioMinimo = limiteEsquerdo + labelWidth + espacoEntreLabelEGomos;
      if (specialStartX < inicioMinimo) {
        specialStartX = inicioMinimo;
      }

      // Adicionar elementos básicos primeiro (fundo do balão e textos)
      container.add([balao, nomeText, linhaSeparadora, hpBarBg, hpBar, manaBarBg, manaBar, hpLabel, manaLabel, hpText, manaText, specialLabel]);
      
      // Criar fundos dos gomos (sempre visíveis) - adicionar depois do balão
      const gomoBgs: Phaser.GameObjects.Graphics[] = [];
      this.jogadorSpecialGomos = [];
      
      for (let i = 0; i < 5; i++) {
        // Fundo escuro do gomo
        const gomoBg = this.add.graphics();
        const xPos = specialStartX + i * (gomoWidth + gomoGap);
        const yPos = specialY - gomoHeight / 2;
        
        gomoBg.fillStyle(0x2a2a1a, 1);
        gomoBg.fillRoundedRect(xPos, yPos, gomoWidth, gomoHeight, 2);
        gomoBg.lineStyle(1, 0x444422, 0.8);
        gomoBg.strokeRoundedRect(xPos, yPos, gomoWidth, gomoHeight, 2);
        // Adicionar ao container DEPOIS do balão para aparecer acima
        container.add(gomoBg);
        gomoBgs.push(gomoBg);
        
        // Gomo preenchido (será desenhado quando carregado)
        const gomo = this.add.graphics();
        gomo.setVisible(true);
        gomo.setAlpha(1);
        // Adicionar ao container DEPOIS de tudo para aparecer no topo
        container.add(gomo);
        this.jogadorSpecialGomos.push(gomo);
      }
      
      // Inicializar todos os gomos como vazios
      this.atualizarGomosEspecialVisual();

      this.jogadorBalao = container;
      this.jogadorBalao.setDepth(1000); // Depth muito alto para ficar acima de tudo

      // Função para atualizar o balão
      const atualizar = () => {
        if (!this.jogadorBalao) return;
        
        // Manter posição fixa (não atualizar posição baseada no sprite)
        // A posição já está fixa no container
        
        // Atualizar barras
        hpBar.clear();
        hpBar.fillStyle(0x00ff00, 1);
        hpBar.fillRoundedRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorHP / this.jogadorHPMax), barHeight, 4);
        hpBar.fillStyle(0x88ff88, 0.8);
        hpBar.fillRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorHP / this.jogadorHPMax), barHeight / 2);
        
        manaBar.clear();
        manaBar.fillStyle(0x4488ff, 1);
        manaBar.fillRoundedRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorMana / this.jogadorManaMax), barHeight, 4);
        manaBar.fillStyle(0x88aaff, 0.8);
        manaBar.fillRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, (infoWidth - padding * 2 - 25 - 35) * (this.jogadorMana / this.jogadorManaMax), barHeight / 2);
        
        hpText.setText(`${this.jogadorHP}/${this.jogadorHPMax}`);
        manaText.setText(`${this.jogadorMana}/${this.jogadorManaMax}`);
        
        // Atualizar gomos especiais
        this.atualizarGomosEspecialVisual();
      };

      this.events.on("update", atualizar);
    }

    criarBalaoInimigo() {
      // Usar o nome do inimigo da configuração
      const nomeInimigo = this.enemyConfig.nome;
      this.criarBalaoInfo(this.enemy, nomeInimigo, this.inimigoHP, this.inimigoMana, false);
    }

    criarBalaoInfo(sprite: Phaser.GameObjects.Sprite, nome: string, hp: number, mana: number, isPlayer: boolean) {
      // Posição fixa baseada no tipo (jogador ou inimigo)
      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      const larguraAreaPersonagens = width * 0.9;
      const xAreaPersonagens = width * 0.05;
      const yAreaPersonagens = alturaSuperior * 0.05; // Reduzido para dar mais espaço acima
      
      const fontSize = Math.max(14, Math.round(this.scale.width * 0.015));
      const padding = 8;
      
      // Obter valores máximos corretos
      const hpMax = isPlayer ? this.jogadorHPMax : this.enemyConfig.hpMax;
      const manaMax = isPlayer ? this.jogadorManaMax : this.enemyConfig.manaMax;
      
      // Criar texto temporário para medir a largura do nome (fora da tela e invisível)
      const tempText = this.add.text(-9999, -9999, nome, {
        fontSize: `${fontSize + 2}px`,
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 2
      }).setVisible(false);
      const nomeWidth = tempText.width;
      tempText.destroy();
      
      // Criar texto temporário para medir largura dos valores máximos
      const tempHpText = this.add.text(-9999, -9999, `${hpMax}/${hpMax}`, {
        fontSize: `${fontSize * 0.65}px`,
        fontStyle: "bold"
      }).setVisible(false);
      const tempManaText = this.add.text(-9999, -9999, `${manaMax}/${manaMax}`, {
        fontSize: `${fontSize * 0.65}px`,
        fontStyle: "bold"
      }).setVisible(false);
      const valoresWidth = Math.max(tempHpText.width, tempManaText.width);
      tempHpText.destroy();
      tempManaText.destroy();
      
      // Calcular largura do balão baseada no nome + padding + espaço para barras e valores
      const larguraMinima = 200;
      const larguraBaseadaNome = nomeWidth + (padding * 2) + valoresWidth + 30; // 30px para label HP/MP e espaços
      const infoWidth = Math.max(larguraMinima, larguraBaseadaNome);
      
      // Calcular posição do balão baseada no tipo (jogador ou inimigo)
      // Ambos na mesma altura, simétricos dos lados opostos
      let xBalao, yBalao;
      // Posicionar balão bem no topo para não ser coberto pelos elementos HTML dos personagens
      const yBalaoFixo = Math.max(40, alturaSuperior * 0.05); // Bem no topo, mínimo 40px
      
      if (isPlayer) {
        // Balão do jogador: ajustado para não ficar em cima do botão voltar
        // Botão voltar está em padding (10-20px), então mover o balão mais para a direita
        const btnVoltarWidth = Math.max(90, Math.min(130, width * 0.12));
        const paddingBtnVoltar = Math.max(10, Math.min(20, width * 0.015));
        xBalao = Math.max(paddingBtnVoltar + btnVoltarWidth + 30, xAreaPersonagens + infoWidth / 2 + 20);
        yBalao = yBalaoFixo;
      } else {
        // Balão do inimigo: trazido um pouco para a esquerda
        xBalao = xAreaPersonagens + larguraAreaPersonagens - infoWidth / 2 - 50; // Reduzido de 20 para 50
        yBalao = yBalaoFixo;
      }
      
      const container = this.add.container(xBalao, yBalao);
      
      // Altura do balão: nome + 2 barras + padding
      const barHeight = 8; // Reduzido para caber melhor
      const barGap = 3; // Reduzido
      const infoHeight = padding + fontSize + 4 + barHeight + barGap + barHeight + padding; // Altura mínima para nome + 2 barras
      const infoHeightFinal = isPlayer ? Math.max(infoHeight, 100) : infoHeight; // Player pode ter mais altura para barra especial
      
      // Fundo do balão
      const balao = this.add.graphics();
      balao.fillStyle(0x2a2a3a, 0.95);
      balao.fillRoundedRect(-infoWidth / 2, 0, infoWidth, infoHeightFinal, 8);
      balao.lineStyle(2, 0x4a4a5a, 0.8);
      balao.strokeRoundedRect(-infoWidth / 2, 0, infoWidth, infoHeightFinal, 8);
      
      // Nome
      const nomeText = this.add.text(-infoWidth / 2 + padding, padding, nome, {
        fontSize: `${fontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 1
      }).setOrigin(0, 0);
      
      // Barras de HP e Mana (dentro do balão)
      const hpY = padding + fontSize + 4;
      const hpLabel = this.add.text(-infoWidth / 2 + padding, hpY, "HP", {
        fontSize: `${fontSize * 0.7}px`,
        color: "#ff4444",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      
      // Calcular largura disponível para a barra (dentro do balão)
      const larguraBarra = infoWidth - padding * 2 - 25 - valoresWidth - 5; // 25px para label, valoresWidth para texto, 5px de margem
      
      const hpBarBg = this.add.graphics();
      hpBarBg.fillStyle(0x1a1a1a, 1);
      hpBarBg.fillRoundedRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, larguraBarra, barHeight, 4);
      
      const hpBar = this.add.graphics();
      hpBar.fillStyle(0x00ff00, 1);
      const hpPercent = Math.min(1, hp / hpMax);
      hpBar.fillRoundedRect(-infoWidth / 2 + padding + 25, hpY - barHeight / 2, larguraBarra * hpPercent, barHeight, 4);
      
      const hpText = this.add.text(-infoWidth / 2 + padding + 25 + larguraBarra + 5, hpY, `${hp}/${hpMax}`, {
        fontSize: `${fontSize * 0.65}px`,
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      
      const manaY = hpY + barHeight + barGap;
      const manaLabel = this.add.text(-infoWidth / 2 + padding, manaY, "MP", {
        fontSize: `${fontSize * 0.7}px`,
        color: "#4488ff",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      
      const manaBarBg = this.add.graphics();
      manaBarBg.fillStyle(0x1a1a1a, 1);
      manaBarBg.fillRoundedRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, larguraBarra, barHeight, 4);
      
      const manaBar = this.add.graphics();
      manaBar.fillStyle(0x4488ff, 1);
      const manaPercent = Math.min(1, mana / manaMax);
      manaBar.fillRoundedRect(-infoWidth / 2 + padding + 25, manaY - barHeight / 2, larguraBarra * manaPercent, barHeight, 4);
      
      const manaText = this.add.text(-infoWidth / 2 + padding + 25 + larguraBarra + 5, manaY, `${mana}/${manaMax}`, {
        fontSize: `${fontSize * 0.65}px`,
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      
      container.add([balao, nomeText, hpBarBg, hpBar, manaBarBg, manaBar, hpLabel, manaLabel, hpText, manaText]);
      
      if (isPlayer) {
        this.jogadorBalao = container;
      } else {
        this.inimigoBalao = container;
      }
      container.setDepth(1000); // Depth muito alto para ficar acima de tudo
    }

    atualizarBalaoInimigo() {
      // Remover balão antigo se existir
      if (this.inimigoBalao) {
        this.inimigoBalao.destroy();
        (this as any).inimigoBalao = undefined;
      }
      // Recriar balão com valores atualizados
      this.criarBalaoInimigo();
    }

    atualizarGomosEspecialVisual() {
      // Verificar se os gomos existem
      if (!this.jogadorSpecialGomos || this.jogadorSpecialGomos.length === 0) {
        return;
      }

      const infoWidth = 200;
      const padding = 8;
      const fontSize = Math.max(14, Math.round(this.scale.width * 0.015));
      const barHeight = 10;
      const barGap = 4;
      const hpY = padding + fontSize + 4;
      const manaY = hpY + barHeight + barGap;
      const specialY = manaY + barHeight + barGap + 4;
      
      const gomoWidth = 26; // Reduzido para caber melhor
      const gomoHeight = 12;
      const gomoGap = 3; // Reduzido para caber melhor
      
      // Calcular largura total dos gomos
      const larguraTotalGomos = (5 * gomoWidth) + (4 * gomoGap);
      
      // Calcular espaço disponível após o label ESP
      // Recalcular a largura do label aqui para garantir consistência (fora da tela e invisível)
      const tempLabel = this.add.text(-9999, -9999, "ESP", { fontSize: `${fontSize * 0.7}px`, fontStyle: "bold" }).setVisible(false);
      const labelWidth = tempLabel.width;
      tempLabel.destroy(); // Destruir o texto temporário
      
      const espacoEntreLabelEGomos = 6; // Espaço entre label e gomos
      const limiteEsquerdo = -infoWidth / 2 + padding;
      const limiteDireito = infoWidth / 2 - padding;
      const espacoDisponivel = limiteDireito - (limiteEsquerdo + labelWidth + espacoEntreLabelEGomos);
      
      // Centralizar os gomos no espaço disponível, garantindo que não ultrapasse os limites
      let specialStartX = limiteEsquerdo + labelWidth + espacoEntreLabelEGomos + (espacoDisponivel - larguraTotalGomos) / 2;
      
      // Garantir que não ultrapasse o limite direito
      const finalDireitoGomos = specialStartX + larguraTotalGomos;
      if (finalDireitoGomos > limiteDireito) {
        specialStartX = limiteDireito - larguraTotalGomos;
      }
      
      // Garantir que não ultrapasse o limite esquerdo (após o label)
      const inicioMinimo = limiteEsquerdo + labelWidth + espacoEntreLabelEGomos;
      if (specialStartX < inicioMinimo) {
        specialStartX = inicioMinimo;
      }

      // Renderizar cada gomo baseado no specialValue
      for (let i = 0; i < this.jogadorSpecialGomos.length; i++) {
        const gomo = this.jogadorSpecialGomos[i];
        
        if (!gomo) {
          continue;
        }
        
        // Sempre limpar antes de redesenhar
        gomo.clear();
        
        // Garantir que o gomo está visível e no topo
        gomo.setVisible(true);
        gomo.setAlpha(1);
        
        // Se este gomo deve estar preenchido (i < specialValue)
        if (i < this.specialValue) {
          const x = specialStartX + i * (gomoWidth + gomoGap);
          const yPos = specialY - gomoHeight / 2;
          
          // Preencher gomo com AMARELO BRILHANTE (#FFFF00) - cor sólida e brilhante
          gomo.fillStyle(0xffff00, 1); // Amarelo puro #FFFF00
          gomo.fillRoundedRect(x, yPos, gomoWidth, gomoHeight, 2);
          
          // Brilho no topo (amarelo mais claro para efeito de profundidade)
          gomo.fillStyle(0xffff88, 0.9);
          gomo.fillRect(x, yPos, gomoWidth, gomoHeight / 2);
          
          // Borda amarela bem visível e brilhante (2px de espessura)
          gomo.lineStyle(2, 0xffff00, 1);
          gomo.strokeRoundedRect(x, yPos, gomoWidth, gomoHeight, 2);
        }
        // Se o gomo está vazio, não desenhar nada (o fundo já está lá)
      }
    }

    incrementarSpecial() {
      // Incrementa a barra especial (máximo 5)
      if (this.specialValue < 5) {
        this.specialValue++;
        
        // Atualizar visualmente os gomos imediatamente
        this.atualizarGomosEspecialVisual();
        
        // Efeito visual ao incrementar no gomo que foi carregado
        if (this.jogadorSpecialGomos && this.jogadorSpecialGomos[this.specialValue - 1]) {
          const gomo = this.jogadorSpecialGomos[this.specialValue - 1];
          this.tweens.add({
            targets: gomo,
            alpha: 0.4,
            duration: 200,
            yoyo: true,
            ease: "Power2"
          });
        }
      }
    }

    resetSpecial() {
      this.specialValue = 0;
      this.atualizarGomosEspecialVisual(); // Call the visual update function
    }

    createPerguntaBalao() {
      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      const alturaInferior = height * 0.4;
      const larguraPainel = width * 0.48;
      const gapPainel = width * 0.02;
      const yInferior = alturaSuperior;
      
      const balaoX = gapPainel + 20;
      const balaoY = yInferior + gapPainel + 10; // Reduzido de 20 para 10 para subir o balão
      const balaoWidth = larguraPainel - 40;
      const balaoHeight = alturaInferior - gapPainel * 2 - 30; // Reduzido de 40 para 30 para compensar
      
      // Criar fundo do balão com gradiente e sombras
      this.balaoPergunta = this.add.graphics();
      
      // Sombra externa
      this.balaoPergunta.fillStyle(0x000000, 0.4);
      this.balaoPergunta.fillRoundedRect(balaoX + 3, balaoY + 3, balaoWidth, balaoHeight, 12);
      
      // Fundo principal com gradiente
      this.balaoPergunta.fillGradientStyle(0x1a1a2a, 0x1a1a2a, 0x0f0f1a, 0x0f0f1a, 1);
      this.balaoPergunta.fillRoundedRect(balaoX, balaoY, balaoWidth, balaoHeight, 12);
      
      // Borda externa azul brilhante
      this.balaoPergunta.lineStyle(3, 0x4a9eff, 1);
      this.balaoPergunta.strokeRoundedRect(balaoX, balaoY, balaoWidth, balaoHeight, 12);
      
      // Borda interna mais sutil
      this.balaoPergunta.lineStyle(1, 0x6ab8ff, 0.5);
      this.balaoPergunta.strokeRoundedRect(balaoX + 2, balaoY + 2, balaoWidth - 4, balaoHeight - 4, 10);
      
      this.balaoPergunta.setDepth(5);
      
      // Texto da pergunta com melhor estilo
      const paddingTexto = 15; // Reduzido de 20 para 15 para subir o texto
      const fontSize = Math.max(28, Math.round(width * 0.045)); // Fonte bem maior (28px mínimo, 4.5% da largura)
      this.perguntaText = this.add.text(balaoX + paddingTexto, balaoY + paddingTexto, "Carregando pergunta...", {
        fontSize: `${fontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        wordWrap: { width: balaoWidth - (paddingTexto * 2) }, // Garantir espaço nas laterais
        stroke: "#000000",
        strokeThickness: 3,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 4,
          stroke: true,
          fill: true
        }
      }).setOrigin(0, 0);
      this.perguntaText.setDepth(6);
    }

    loadPergunta() {
      // Se chegou ao fim das perguntas, embaralhar novamente e continuar
      if (this.indicePerguntaAtual >= this.perguntas.length) {
        this.embaralharPerguntas();
      }

      // Garantir que há perguntas disponíveis
      if (this.perguntas.length === 0) {
        this.perguntaText.setText("Carregando perguntas...");
        return;
      }

      this.perguntaAtual = this.perguntas[this.indicePerguntaAtual];
      this.perguntaText.setText(this.perguntaAtual.texto);
      
      // Ajustar texto para caber no balão antes de criar opções
      this.ajustarTextoAoBalao();
      
      // Aguardar um frame para o texto ser renderizado e calcular altura correta
      this.time.delayedCall(10, () => {
        this.criarOpcoes();
      });
    }

    ajustarTextoAoBalao() {
      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      const alturaInferior = height * 0.4;
      const larguraPainel = width * 0.48;
      const gapPainel = width * 0.02;
      const yInferior = alturaSuperior;
      
      const balaoX = gapPainel + 20;
      const balaoY = yInferior + gapPainel + 10; // Reduzido de 20 para 10 para subir o balão
      const balaoWidth = larguraPainel - 40;
      const balaoHeight = alturaInferior - gapPainel * 2 - 30; // Reduzido de 40 para 30 para compensar
      
      const paddingTexto = 15; // Reduzido de 20 para 15 para subir o texto
      const paddingBottom = 20; // Padding reduzido para dar mais espaço
      const gapPerguntaOpcoes = 15; // Gap reduzido
      const espacoMinimoOpcoes = 160; // Espaço mínimo reduzido para opções
      
      // Calcular espaço máximo disponível para o texto (mais espaço)
      const alturaMaximaTexto = balaoHeight - paddingTexto - paddingBottom - gapPerguntaOpcoes - espacoMinimoOpcoes;
      
      // Obter altura atual do texto
      let textoHeight = this.perguntaText.height;
      let fontSize = parseInt(this.perguntaText.style.fontSize as string) || Math.max(28, Math.round(width * 0.045));
      
      // Se o texto ultrapassar o espaço disponível, reduzir fonte gradualmente (menos agressivo)
      if (textoHeight > alturaMaximaTexto) {
        // Calcular fator de redução necessário (mais conservador)
        let fatorReducao = (alturaMaximaTexto / textoHeight) * 0.98; // 98% para margem menor
        let novaFontSize = Math.max(24, Math.floor(fontSize * fatorReducao)); // Mínimo 24px (bem maior)
        
        // Aplicar nova fonte
        this.perguntaText.setFontSize(`${novaFontSize}px`);
        this.perguntaText.setWordWrapWidth(balaoWidth - (paddingTexto * 2));
        
        // Verificar novamente após ajuste
        textoHeight = this.perguntaText.height;
        if (textoHeight > alturaMaximaTexto) {
          // Se ainda não couber, reduzir mais (mas menos agressivo)
          fatorReducao = (alturaMaximaTexto / textoHeight) * 0.98;
          novaFontSize = Math.max(22, Math.floor(novaFontSize * fatorReducao)); // Mínimo 22px
          this.perguntaText.setFontSize(`${novaFontSize}px`);
        }
      }
    }

    criarOpcoes() {
      if (!this.perguntaAtual) return;
      
      // Limpar opções anteriores
      this.opcoes.forEach(btn => btn.destroy());
      this.opcoes = [];

      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      const alturaInferior = height * 0.4;
      const larguraPainel = width * 0.48;
      const gapPainel = width * 0.02;
      const yInferior = alturaSuperior;
      
      const balaoX = gapPainel + 20;
      const balaoY = yInferior + gapPainel + 10; // Reduzido de 20 para 10 para subir o balão
      const balaoWidth = larguraPainel - 40;
      const balaoHeight = alturaInferior - gapPainel * 2 - 30; // Reduzido de 40 para 30 para compensar
      
      const padding = 20; // Padding interno do balão
      const paddingTop = 20; // Reduzido de 25 para 20 para subir o conteúdo
      const paddingBottom = 25; // Padding inferior reduzido
      const gapPerguntaOpcoes = 15; // Espaço entre a pergunta e as opções (reduzido)
      
      // Obter altura real do texto da pergunta após atualização
      // Garantir que o texto não ultrapasse os limites do balão
      let perguntaTextHeight = Math.ceil(this.perguntaText.height);
      
      // Adicionar margem de segurança menor
      perguntaTextHeight = Math.max(perguntaTextHeight + 5, 35); // +5px de margem (reduzido), mínimo 35px
      
      // Calcular espaço disponível para as opções com margem de segurança
      // altura total do balão - padding superior - altura da pergunta - gap - padding inferior
      const espacoDisponivel = balaoHeight - paddingTop - perguntaTextHeight - gapPerguntaOpcoes - paddingBottom;
      
      const fontSize = Math.max(15, Math.round(width * 0.019)); // Fonte ligeiramente menor
      const numOpcoes = this.perguntaAtual.alternativas.length;
      
      // Altura inicial dos botões reduzida e gap menor
      let btnHeight = 45; // Reduzido de 50 para 45
      let gap = 10; // Reduzido de 12 para 10
      
      // Calcular altura total necessária para as opções
      const alturaTotalOpcoes = (numOpcoes * btnHeight) + ((numOpcoes - 1) * gap);
      
      // Ajustar altura dos botões e gap se necessário para caber tudo
      let btnHeightFinal = btnHeight;
      let gapFinal = gap;
      
      // Sempre calcular para garantir que caiba, mesmo que precise reduzir
      if (alturaTotalOpcoes >= espacoDisponivel) {
        // Calcular fator de redução necessário
        const fatorReducao = (espacoDisponivel * 0.95) / alturaTotalOpcoes; // 95% do espaço para margem de segurança
        btnHeightFinal = Math.max(32, Math.floor(btnHeight * fatorReducao)); // Altura mínima de 32px
        gapFinal = Math.max(5, Math.floor(gap * fatorReducao)); // Gap mínimo de 5px
        
        // Recalcular para garantir que caiba
        let novaAlturaTotal = (numOpcoes * btnHeightFinal) + ((numOpcoes - 1) * gapFinal);
        if (novaAlturaTotal > espacoDisponivel * 0.95) {
          // Ajustar gap primeiro
          gapFinal = Math.max(4, Math.floor((espacoDisponivel * 0.95 - (numOpcoes * btnHeightFinal)) / Math.max(1, numOpcoes - 1)));
          novaAlturaTotal = (numOpcoes * btnHeightFinal) + ((numOpcoes - 1) * gapFinal);
          
          // Se ainda não couber, reduzir altura dos botões
          if (novaAlturaTotal > espacoDisponivel * 0.95) {
            btnHeightFinal = Math.max(30, Math.floor((espacoDisponivel * 0.95 - ((numOpcoes - 1) * gapFinal)) / numOpcoes));
          }
        }
      }
      
      // Calcular posição inicial das opções
      const startY = balaoY + paddingTop + perguntaTextHeight + gapPerguntaOpcoes;
      const btnWidth = balaoWidth - (padding * 2);
      
      // Verificação final: garantir que a última opção não ultrapasse o limite
      const ultimaOpcaoY = startY + (numOpcoes - 1) * (btnHeightFinal + gapFinal) + btnHeightFinal;
      const limiteInferior = balaoY + balaoHeight - paddingBottom;
      
      if (ultimaOpcaoY > limiteInferior) {
        // Calcular excesso e ajustar
        const excesso = ultimaOpcaoY - limiteInferior + 5; // +5px de margem extra
        const ajusteTotal = excesso;
        
        // Reduzir gap primeiro
        const gapReducao = Math.min(gapFinal - 4, Math.floor(ajusteTotal / Math.max(1, numOpcoes - 1)));
        gapFinal = Math.max(4, gapFinal - gapReducao);
        
        // Se ainda não couber, reduzir altura dos botões
        const novaUltimaOpcaoY = startY + (numOpcoes - 1) * (btnHeightFinal + gapFinal) + btnHeightFinal;
        if (novaUltimaOpcaoY > limiteInferior) {
          const excessoRestante = novaUltimaOpcaoY - limiteInferior + 5;
          const alturaReducao = Math.floor(excessoRestante / numOpcoes);
          btnHeightFinal = Math.max(28, btnHeightFinal - alturaReducao);
        }
      }

      this.perguntaAtual.alternativas.forEach((alt, i) => {
        const y = startY + i * (btnHeightFinal + gapFinal);
        
        // Fundo do botão com sombra e gradiente
        const btnBg = this.add.graphics();
        
        // Sombra do botão
        btnBg.fillStyle(0x000000, 0.3);
        btnBg.fillRoundedRect(balaoX + padding + 2, y + 2, btnWidth, btnHeightFinal, 10);
        
        // Fundo do botão com gradiente sutil
        btnBg.fillGradientStyle(0x2a2a3a, 0x2a2a3a, 0x1f1f2a, 0x1f1f2a, 1);
        btnBg.fillRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
        
        // Borda azul brilhante
        btnBg.lineStyle(2, 0x4a9eff, 0.8);
        btnBg.strokeRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
        
        // Borda interna sutil
        btnBg.lineStyle(1, 0x6ab8ff, 0.3);
        btnBg.strokeRoundedRect(balaoX + padding + 1, y + 1, btnWidth - 2, btnHeightFinal - 2, 9);
        
        btnBg.setDepth(6);
        
        // Texto da opção com melhor estilo
        const btn = this.add.text(balaoX + padding + btnWidth / 2, y + btnHeightFinal / 2, `${this.LETRAS[i]}) ${alt}`, {
          fontSize: `${fontSize}px`,
          color: "#ffffff",
          fontStyle: "bold",
          align: "center",
          stroke: "#000000",
          strokeThickness: 2,
          shadow: {
            offsetX: 1,
            offsetY: 1,
            color: "#000000",
            blur: 2,
            stroke: true,
            fill: true
          }
        })
        .setOrigin(0.5, 0.5)
        .setDepth(7)
        .setInteractive({ 
          useHandCursor: true, 
          hitArea: new Phaser.Geom.Rectangle(
            -btnWidth / 2, // Offset X relativo ao centro (origem 0.5, 0.5)
            -btnHeightFinal / 2, // Offset Y relativo ao centro (origem 0.5, 0.5)
            btnWidth, 
            btnHeightFinal
          )
        })
        .on("pointerover", () => {
          btnBg.clear();
          // Sombra mais pronunciada no hover
          btnBg.fillStyle(0x000000, 0.4);
          btnBg.fillRoundedRect(balaoX + padding + 3, y + 3, btnWidth, btnHeightFinal, 10);
          // Fundo mais claro no hover
          btnBg.fillGradientStyle(0x3a3a4a, 0x3a3a4a, 0x2f2f3a, 0x2f2f3a, 1);
          btnBg.fillRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
          // Borda mais brilhante
          btnBg.lineStyle(3, 0x88ddff, 1);
          btnBg.strokeRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
          btnBg.lineStyle(1, 0xaaffff, 0.6);
          btnBg.strokeRoundedRect(balaoX + padding + 1, y + 1, btnWidth - 2, btnHeightFinal - 2, 9);
          btn.setStyle({ color: "#88ddff" });
          this.tweens.add({
            targets: btn,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 150,
            ease: "Power2"
          });
        })
        .on("pointerout", () => {
          btnBg.clear();
          // Restaurar sombra original
          btnBg.fillStyle(0x000000, 0.3);
          btnBg.fillRoundedRect(balaoX + padding + 2, y + 2, btnWidth, btnHeightFinal, 10);
          // Restaurar fundo original
          btnBg.fillGradientStyle(0x2a2a3a, 0x2a2a3a, 0x1f1f2a, 0x1f1f2a, 1);
          btnBg.fillRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
          // Restaurar borda original
          btnBg.lineStyle(2, 0x4a9eff, 0.8);
          btnBg.strokeRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
          btnBg.lineStyle(1, 0x6ab8ff, 0.3);
          btnBg.strokeRoundedRect(balaoX + padding + 1, y + 1, btnWidth - 2, btnHeightFinal - 2, 9);
          btn.setStyle({ color: "#ffffff" });
          this.tweens.add({
            targets: btn,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: "Power2"
          });
        })
        .on("pointerdown", () => {
          btnBg.clear();
          // Efeito de pressionado
          btnBg.fillStyle(0x4a4a5a, 1);
          btnBg.fillRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
          btnBg.lineStyle(3, 0x88ddff, 1);
          btnBg.strokeRoundedRect(balaoX + padding, y, btnWidth, btnHeightFinal, 10);
          this.verificarResposta(i);
        });

        this.opcoes.push(btn);
      });
    }

    async verificarResposta(respostaIndex: number) {
      if (!this.perguntaAtual) return;

      // Desabilitar todas as opções para evitar múltiplos cliques
      this.opcoes.forEach(btn => {
        btn.disableInteractive();
        btn.setStyle({ color: "#888" }); // Visual de desabilitado
        btn.setAlpha(0.6);
      });

      const acertou = respostaIndex === this.perguntaAtual.resposta;

      // Registrar resposta na API
      try {
        await registrarResposta(this.faseId, this.perguntaAtual.id, acertou);
      } catch (error) {
        console.error("Erro ao registrar resposta:", error);
      }

      // Sistema de turnos: Se acertou → jogador ataca, se errou → inimigo ataca
      if (acertou) {
        this.acertos++;
        this.mostrarMensagemTemporaria("Resposta correta! Você ataca!", 2000);
        
        // Jogador ataca automaticamente ao acertar
        const dano = Phaser.Math.Between(20, 30);
        this.inimigoHP = Math.max(0, this.inimigoHP - dano);
        
        // Atualizar barra de vida do inimigo
        this.atualizarBalaoInimigo();
        
        // Usar GIF de ataque básico do personagem quando acerta pergunta
        const basicAttackGif = this.characterConfig.attackGifs.basic;
        this.animaAtaque(this.player, this.enemy, basicAttackGif);
        
        // Incrementar barra especial (1 gomo por acerto)
        this.incrementarSpecial();
        
        // Efeito visual no inimigo ao receber dano
        this.animaDano(this.enemy);
      } else {
        this.erros++;
        this.mostrarMensagemTemporaria("Resposta incorreta! O inimigo ataca!", 2000);
        
        // Inimigo ataca - selecionar GIF aleatório
        const dano = Phaser.Math.Between(15, 25);
        this.jogadorHP = Math.max(0, this.jogadorHP - dano);
        // Usar configuração do inimigo para obter golpe aleatório
        const golpeAleatorio = getRandomEnemyAttack(this.enemyId);
        this.animaAtaque(this.enemy, this.player, golpeAleatorio);
        
        // Efeito visual no jogador ao receber dano
        this.animaDano(this.player);
      }

      // Verificar se o jogo terminou
      if (this.jogadorHP <= 0 || this.inimigoHP <= 0) {
        this.time.delayedCall(1500, () => {
          const vitoria = this.inimigoHP <= 0;
          this.mostrarTelaFinal(vitoria ? "vitoria" : "derrota");
        });
        return;
      }

      // Carregar próxima pergunta após um delay
      this.time.delayedCall(2000, () => {
        this.indicePerguntaAtual++;
        this.loadPergunta();
        
        // Reabilitar opções
        this.opcoes.forEach(btn => {
          btn.setInteractive();
          btn.setStyle({ color: "#ffffff" });
          btn.setAlpha(1);
        });
      });
    }

    mostrarGolpeJogador(x: number, y: number, escala: number, gifNome?: string) {
      // Caminho do GIF de golpe do jogador usando configuração
      const gifPadrao = gifNome || this.characterConfig.attackGifs.basic;
      const golpeGif = `/assests/${this.characterConfig.id}/${gifPadrao}`;
      
      // Se já existe um elemento de golpe, remover
      if (this.playerGolpeElement && this.playerGolpeElement.parentElement) {
        this.playerGolpeElement.parentElement.removeChild(this.playerGolpeElement);
      }
      
      const gameContainer = document.getElementById("game-container");
      if (!gameContainer) {
        console.error("Container do jogo não encontrado");
        return;
      }
      
      const img = document.createElement("img");
      img.src = window.location.origin + golpeGif;
      img.style.position = "absolute";
      img.style.imageRendering = "pixelated";
      img.style.pointerEvents = "none";
      img.style.zIndex = "11"; // Acima do idle mas abaixo dos balões
      
      // Armazenar nome do GIF para referência posterior
      (img as any)._gifNome = gifNome || "samurai_Golpe.gif";
      
      // Variáveis para armazenar dimensões escaladas
      let larguraEscalada = 0;
      let alturaEscalada = 0;
      
      // Dimensões padrão temporárias (baseadas na proporção típica dos GIFs de golpe do jogador)
      const proporcaoTemporaria = 0.75; // Proporção aproximada baseada nos GIFs existentes
      const alturaBase = 200;
      const larguraBase = alturaBase * proporcaoTemporaria;
      alturaEscalada = alturaBase * escala;
      larguraEscalada = larguraBase * escala;
      
      // Função para atualizar posição
      const atualizarPosicao = () => {
        if (this.player && img.parentElement) {
          const canvas = this.game.canvas;
          const canvasRect = canvas.getBoundingClientRect();
          const gameX = this.player.x;
          const gameY = this.player.y;
          
          const screenX = canvasRect.left + (gameX / this.scale.width) * canvasRect.width;
          const screenY = canvasRect.top + (gameY / this.scale.height) * canvasRect.height;
          
          img.style.left = `${screenX - larguraEscalada / 2}px`;
          img.style.top = `${screenY - alturaEscalada}px`;
        }
      };
      
      // Configurar tamanho inicial com dimensões temporárias
      img.style.width = `${larguraEscalada}px`;
      img.style.height = `${alturaEscalada}px`;
      img.style.minWidth = `${larguraEscalada}px`;
      img.style.minHeight = `${alturaEscalada}px`;
      img.style.maxWidth = `${larguraEscalada}px`;
      img.style.maxHeight = `${alturaEscalada}px`;
      
      // Adicionar ao DOM e mostrar IMEDIATAMENTE
      gameContainer.appendChild(img);
      img.style.display = "block";
      
      // Esconder idle IMEDIATAMENTE
      if (this.playerIdleElement) {
        this.playerIdleElement.style.display = "none";
      }
      if (this.player) {
        this.player.setVisible(false);
      }
      
      atualizarPosicao();
      
      // Configurar listeners imediatamente
      this.events.on("update", atualizarPosicao);
      this.scale.on("resize", atualizarPosicao);
      
      // Armazenar referências
      this.playerGolpeElement = img;
      (img as any)._atualizarPosicao = atualizarPosicao;
      
      // Função para ajustar tamanho quando o GIF carregar completamente
      const ajustarTamanhoFinal = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          // Calcular dimensões mantendo a proporção original do GIF para evitar distorção
          const proporcaoOriginal = img.naturalWidth / img.naturalHeight;
          
          // Usar altura como base e calcular largura proporcionalmente
          const larguraBaseCorrigida = alturaBase * proporcaoOriginal;
          
          // Aplicar escala mantendo proporção
          alturaEscalada = alturaBase * escala;
          larguraEscalada = larguraBaseCorrigida * escala;
          
          // Atualizar tamanho com valores corretos
          img.style.width = `${larguraEscalada}px`;
          img.style.height = `${alturaEscalada}px`;
          img.style.minWidth = `${larguraEscalada}px`;
          img.style.minHeight = `${alturaEscalada}px`;
          img.style.maxWidth = `${larguraEscalada}px`;
          img.style.maxHeight = `${alturaEscalada}px`;
          
          // Reposicionar com tamanho correto
          atualizarPosicao();
        }
      };
      
      // Se já está carregado, ajustar imediatamente
      if (img.complete && img.naturalWidth > 0) {
        ajustarTamanhoFinal();
      } else {
        // Caso contrário, ajustar quando carregar
        img.onload = () => {
          ajustarTamanhoFinal();
        };
      }
      
      img.onerror = () => {
        console.error("❌ Erro ao carregar GIF de golpe:", golpeGif);
      };
    }

    mostrarGolpeInimigo(x: number, y: number, escala: number, gifNome?: string) {
      // Caminho do GIF de golpe do inimigo
      // Caminho do GIF de golpe do inimigo usando configuração
      const gifPadrao = gifNome || this.enemyConfig.attackGifs.attack1;
      // Usar path customizado se existir, senão usar padrão castelo/{id}
      const enemyPath = this.enemyConfig.path || `castelo/${this.enemyConfig.id}`;
      const golpeGif = `/assests/${enemyPath}/${gifPadrao}`;
      
      // Esconder idle IMEDIATAMENTE quando o ataque começar
      if (this.enemyIdleElement) {
        this.enemyIdleElement.style.display = "none";
      }
      if (this.enemy) {
        this.enemy.setVisible(false);
      }
      
      // Se já existe um elemento de golpe, remover
      if (this.enemyGolpeElement && this.enemyGolpeElement.parentElement) {
        this.enemyGolpeElement.parentElement.removeChild(this.enemyGolpeElement);
      }
      
      const gameContainer = document.getElementById("game-container");
      if (!gameContainer) {
        console.error("Container do jogo não encontrado");
        return;
      }
      
      const img = document.createElement("img");
      img.src = window.location.origin + golpeGif;
      img.style.position = "absolute";
      img.style.imageRendering = "pixelated";
      img.style.pointerEvents = "none";
      img.style.zIndex = "11"; // Acima do idle mas abaixo dos balões
      
      // Armazenar nome do GIF para referência posterior
      (img as any)._gifNome = gifNome || "Spectre_Golpe_1.gif";
      
      // Variáveis para armazenar dimensões escaladas
      let larguraEscalada = 0;
      let alturaEscalada = 0;
      
      // Dimensões padrão temporárias (baseadas na proporção típica dos GIFs de golpe)
      const proporcaoTemporaria = 0.75; // Proporção aproximada baseada nos GIFs existentes
      const alturaBase = 200;
      const larguraBase = alturaBase * proporcaoTemporaria;
      alturaEscalada = alturaBase * escala;
      larguraEscalada = larguraBase * escala;
      
      // Função para atualizar posição
      const atualizarPosicao = () => {
        if (this.enemy && img.parentElement) {
          const canvas = this.game.canvas;
          const canvasRect = canvas.getBoundingClientRect();
          const gameX = this.enemy.x;
          const gameY = this.enemy.y;
          
          const screenX = canvasRect.left + (gameX / this.scale.width) * canvasRect.width;
          const screenY = canvasRect.top + (gameY / this.scale.height) * canvasRect.height;
          
          img.style.left = `${screenX - larguraEscalada / 2}px`;
          img.style.top = `${screenY - alturaEscalada}px`;
        }
      };
      
      // Configurar tamanho inicial com dimensões temporárias
      img.style.width = `${larguraEscalada}px`;
      img.style.height = `${alturaEscalada}px`;
      img.style.minWidth = `${larguraEscalada}px`;
      img.style.minHeight = `${alturaEscalada}px`;
      img.style.maxWidth = `${larguraEscalada}px`;
      img.style.maxHeight = `${alturaEscalada}px`;
      
      // Adicionar ao DOM e mostrar IMEDIATAMENTE
      gameContainer.appendChild(img);
      img.style.display = "block";
      atualizarPosicao();
      
      // Configurar listeners imediatamente
      this.events.on("update", atualizarPosicao);
      this.scale.on("resize", atualizarPosicao);
      
      // Armazenar referências
      this.enemyGolpeElement = img;
      (img as any)._atualizarPosicao = atualizarPosicao;
      
      // Função para ajustar tamanho quando o GIF carregar completamente
      const ajustarTamanhoFinal = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          // Calcular dimensões mantendo a proporção original do GIF
          const proporcaoOriginal = img.naturalWidth / img.naturalHeight;
          const larguraBaseCorrigida = alturaBase * proporcaoOriginal;
          
          alturaEscalada = alturaBase * escala;
          larguraEscalada = larguraBaseCorrigida * escala;
          
          // Atualizar tamanho com valores corretos
          img.style.width = `${larguraEscalada}px`;
          img.style.height = `${alturaEscalada}px`;
          img.style.minWidth = `${larguraEscalada}px`;
          img.style.minHeight = `${alturaEscalada}px`;
          img.style.maxWidth = `${larguraEscalada}px`;
          img.style.maxHeight = `${alturaEscalada}px`;
          
          // Reposicionar com tamanho correto
          atualizarPosicao();
        }
      };
      
      // Se já está carregado, ajustar imediatamente
      if (img.complete && img.naturalWidth > 0) {
        ajustarTamanhoFinal();
      } else {
        // Caso contrário, ajustar quando carregar
        img.onload = () => {
          ajustarTamanhoFinal();
        };
      }
      
      img.onerror = () => {
        console.error("❌ Erro ao carregar GIF de golpe do inimigo:", golpeGif);
      };
    }

    animaAtaque(atacante: Phaser.GameObjects.Sprite, alvo: Phaser.GameObjects.Sprite, gifNome?: string) {
      // Verificar se o inimigo é a Arqueira ou Mago Corrompido (ataques à distância - ficam parados)
      const isArqueira = (this.enemyId === "arqueira");
      const isMagoCorrompido = (this.enemyId === "magoCorrompido");
      const isAtaqueADistancia = isArqueira || isMagoCorrompido;
      
      // Verificar ANTES de qualquer movimento se é Spectre_Golpe_2.gif
      const isAtaqueInimigoGolpe2 = (gifNome === "Spectre_Golpe_2.gif");
      
      // Para Arqueira e Mago Corrompido, todos os ataques são à distância - ficam parados e apenas rodam o GIF
      if (isAtaqueADistancia && atacante === this.enemy) {
        // PRIMEIRO: Cancelar qualquer verificação de posição anterior que possa estar ativa
        if ((this.enemy as any)?._verificarPosicaoEvent) {
          (this.enemy as any)._verificarPosicaoEvent.remove();
          delete (this.enemy as any)._verificarPosicaoEvent;
        }
        
        // Cancelar TODOS os tweens e fixar posição ANTES de qualquer coisa
        this.tweens.killTweensOf(this.enemy);
        this.tweens.killAll(); // Cancelar todos os tweens para garantir
        
        // Fixar a posição do inimigo IMEDIATAMENTE para garantir que não se mova
        const posicaoFixaX = this.enemy.x;
        const posicaoFixaY = this.enemy.y;
        
        // Forçar posição fixa múltiplas vezes para garantir (sem movimento)
        this.enemy.setPosition(posicaoFixaX, posicaoFixaY);
        
        // PRIMEIRO: Esconder idle e sprite IMEDIATAMENTE antes de mostrar o GIF
        if (this.enemyIdleElement) {
          this.enemyIdleElement.style.display = "none";
        }
        if (this.enemy) {
          this.enemy.setVisible(false);
        }
        
        // Mostrar animação de golpe do inimigo IMEDIATAMENTE (sem delay)
        const escalaInimigo = this.enemyConfig.escala;
        this.mostrarGolpeInimigo(posicaoFixaX, posicaoFixaY, escalaInimigo, gifNome);
        
        // Garantir que o inimigo permaneça na posição fixa durante todo o ataque
        // Verificar periodicamente para garantir que não se move
        const verificarPosicao = this.time.addEvent({
          delay: 16, // A cada frame (~60fps)
          callback: () => {
            if (this.enemy && (this.enemy.x !== posicaoFixaX || this.enemy.y !== posicaoFixaY)) {
              this.enemy.setPosition(posicaoFixaX, posicaoFixaY);
              // Cancelar qualquer tween que possa ter sido criado
              this.tweens.killTweensOf(this.enemy);
            }
          },
          repeat: -1
        });
        
        // Armazenar referência para poder cancelar depois
        (this.enemy as any)._verificarPosicaoEvent = verificarPosicao;
        
        // Tempo baseado no tipo de ataque
        let delayEsconder = 1500; // Tempo padrão para completar a animação
        
        // Tempos específicos para Arqueira
        if (isArqueira) {
          if (gifNome === "Arqueira Full.gif") {
            delayEsconder = 2000; // Ataque Full precisa de mais tempo
          } else if (gifNome === "Arqueira Golpe 1.gif") {
            delayEsconder = 1500;
          } else if (gifNome === "Arqueira Golpe 2.gif") {
            delayEsconder = 1200;
          }
        }
        
        // Tempos específicos para Mago Corrompido (aumentados para evitar repetição)
        if (isMagoCorrompido) {
          if (gifNome === "Mago Corrompido Full.gif") {
            delayEsconder = 2000; // Tempo para completar a animação
          } else if (gifNome === "Mago Corrompido Golpe 1.gif") {
            delayEsconder = 2000; // Aumentado significativamente para evitar repetição
          } else if (gifNome === "Mago Corrompido Golpe 2.gif") {
            delayEsconder = 2000; // Aumentado significativamente para evitar repetição
          }
        }
        
        // Para Mago Corrompido, esconder o GIF bem antes de completar para evitar repetição
        // Para Golpe 1 e Golpe 2, esconder muito mais cedo para garantir que não repitam
        let delayEsconderGif = delayEsconder;
        if (isMagoCorrompido) {
          if (gifNome === "Mago Corrompido Golpe 1.gif" || gifNome === "Mago Corrompido Golpe 2.gif") {
            delayEsconderGif = delayEsconder - 300; // Esconder 300ms antes para evitar repetição
          } else {
            delayEsconderGif = delayEsconder - 100;
          }
        }
        
        // Esconder o GIF e restaurar idle simultaneamente para evitar desaparecimento
        this.time.delayedCall(delayEsconderGif, () => {
          // PRIMEIRO: Restaurar o idle IMEDIATAMENTE antes de esconder o GIF
          if (this.enemyIdleElement) {
            const escalaInimigoLocal = this.enemyConfig.escala;
            const alturaBase = 200;
            const proporcaoOriginal = this.enemyIdleElement.naturalWidth / this.enemyIdleElement.naturalHeight || 0.75;
            const larguraBase = alturaBase * proporcaoOriginal;
            const alturaEscalada = alturaBase * escalaInimigoLocal;
            const larguraEscalada = larguraBase * escalaInimigoLocal;
            
            this.enemyIdleElement.style.width = `${larguraEscalada}px`;
            this.enemyIdleElement.style.height = `${alturaEscalada}px`;
            this.enemyIdleElement.style.minWidth = `${larguraEscalada}px`;
            this.enemyIdleElement.style.minHeight = `${alturaEscalada}px`;
            this.enemyIdleElement.style.maxWidth = `${larguraEscalada}px`;
            this.enemyIdleElement.style.maxHeight = `${alturaEscalada}px`;
            this.enemyIdleElement.style.display = "block";
          }
          if (this.enemy) {
            this.enemy.setPosition(posicaoFixaX, posicaoFixaY);
            this.enemy.setVisible(true);
          }
          
          // DEPOIS: Esconder o GIF imediatamente após restaurar o idle
          if (this.enemyGolpeElement) {
            this.enemyGolpeElement.style.display = "none";
          }
          
          // Cancelar verificação de posição quando o ataque terminar
          if ((this.enemy as any)?._verificarPosicaoEvent) {
            (this.enemy as any)._verificarPosicaoEvent.remove();
            delete (this.enemy as any)._verificarPosicaoEvent;
          }
          
          // Remover completamente o elemento após um pequeno delay
          this.time.delayedCall(200, () => {
            // Remover event listeners antes de remover o elemento
            if (this.enemyGolpeElement) {
              try {
                const atualizarPosicao = (this.enemyGolpeElement as any)?._atualizarPosicao;
                if (atualizarPosicao) {
                  this.events.off("update", atualizarPosicao);
                  this.scale.off("resize", atualizarPosicao);
                }
              } catch (e) {
                console.warn("Erro ao remover listeners:", e);
              }
            }
            
            // Limpar elemento de golpe
            if (this.enemyGolpeElement && this.enemyGolpeElement.parentElement) {
              this.enemyGolpeElement.parentElement.removeChild(this.enemyGolpeElement);
              this.enemyGolpeElement = undefined;
            }
          });
        });
        return; // Não fazer animação de movimento
      }
      
      // Para Spectre_Golpe_2.gif, não fazer animação de movimento, apenas rodar o GIF
      if (isAtaqueInimigoGolpe2 && atacante === this.enemy) {
        // Garantir que o inimigo não se mova - cancelar TODOS os tweens ativos primeiro
        this.tweens.killTweensOf(this.enemy);
        
        // Fixar a posição do inimigo para garantir que não se mova
        const posicaoFixaX = this.enemy.x;
        const posicaoFixaY = this.enemy.y;
        
        // Esconder idle e mostrar GIF
        if (this.enemyIdleElement) {
          this.enemyIdleElement.style.display = "none";
        }
        this.enemy.setVisible(false);
        
        // Mostrar animação de golpe do inimigo
        const escalaInimigo = this.enemyConfig.escala;
        this.mostrarGolpeInimigo(posicaoFixaX, posicaoFixaY, escalaInimigo, gifNome);
        
        // Garantir que o inimigo permaneça na posição fixa durante todo o ataque
        this.enemy.setPosition(posicaoFixaX, posicaoFixaY);
        
        // Aumentar o tempo para garantir que o GIF complete a animação completamente
        // Spectre_Golpe_2.gif precisa de mais tempo para completar toda a animação
        // Usar 1200ms para garantir que complete completamente antes de esconder
        this.time.delayedCall(1200, () => {
          // PRIMEIRO: Restaurar o idle ANTES de esconder o GIF para evitar que o inimigo desapareça
          if (this.enemyIdleElement) {
            const escalaInimigo = this.enemyConfig.escala;
            const alturaBase = 200;
            const proporcaoOriginal = this.enemyIdleElement.naturalWidth / this.enemyIdleElement.naturalHeight || 0.75;
            const larguraBase = alturaBase * proporcaoOriginal;
            const alturaEscalada = alturaBase * escalaInimigo;
            const larguraEscalada = larguraBase * escalaInimigo;
            
            this.enemyIdleElement.style.width = `${larguraEscalada}px`;
            this.enemyIdleElement.style.height = `${alturaEscalada}px`;
            this.enemyIdleElement.style.minWidth = `${larguraEscalada}px`;
            this.enemyIdleElement.style.minHeight = `${alturaEscalada}px`;
            this.enemyIdleElement.style.maxWidth = `${larguraEscalada}px`;
            this.enemyIdleElement.style.maxHeight = `${alturaEscalada}px`;
            this.enemyIdleElement.style.display = "block";
          }
          if (this.enemy) {
            // Garantir que o inimigo volte para a posição fixa e esteja visível
            this.enemy.setPosition(posicaoFixaX, posicaoFixaY);
            this.enemy.setVisible(true);
          }
          
          // DEPOIS: Esconder o GIF após restaurar o idle para evitar que reinicie
          if (this.enemyGolpeElement) {
            this.enemyGolpeElement.style.display = "none";
          }
          
          // Aguardar um pouco mais antes de remover completamente
          this.time.delayedCall(300, () => {
            // Remover event listeners antes de remover o elemento
            if (this.enemyGolpeElement) {
              try {
                const atualizarPosicao = (this.enemyGolpeElement as any)?._atualizarPosicao;
                if (atualizarPosicao) {
                  this.events.off("update", atualizarPosicao);
                  this.scale.off("resize", atualizarPosicao);
                }
              } catch (e) {
                console.warn("Erro ao remover listeners:", e);
              }
            }
            
            // Limpar elemento de golpe
            if (this.enemyGolpeElement && this.enemyGolpeElement.parentElement) {
              this.enemyGolpeElement.parentElement.removeChild(this.enemyGolpeElement);
              this.enemyGolpeElement = undefined;
            }
          });
        });
        return; // Não fazer animação de movimento
      }
      
      // Esconder animação idle temporariamente durante o ataque
      if (atacante === this.player && this.playerIdleElement) {
        this.playerIdleElement.style.display = "none";
        // Manter sprite escondido durante o ataque para evitar mudança de tamanho
        this.player.setVisible(false);
        
        // Mostrar animação de golpe do jogador
        // Apenas o ataque fúria (samurai_Full .gif) usa escala maior (2.0) para destacar
        // Os outros ataques (samurai_Golpe_1.gif e samurai_Golpe_2.gif) mantêm escala normal (1.6)
        const escalaPersonagem = (gifNome === "samurai_Full .gif") ? 2.0 : 1.6;
        this.mostrarGolpeJogador(atacante.x, atacante.y, escalaPersonagem, gifNome);
      }
      
      if (atacante === this.enemy && this.enemyIdleElement) {
        this.enemyIdleElement.style.display = "none";
        // Manter sprite escondido durante o ataque para evitar mudança de tamanho
        this.enemy.setVisible(false);
        
        // Mostrar animação de golpe do inimigo usando escala correta do config
        const escalaInimigo = this.enemyConfig.escala;
        this.mostrarGolpeInimigo(atacante.x, atacante.y, escalaInimigo, gifNome);
      }
      
      // Animação de movimento do atacante em direção ao alvo
      const posicaoOriginalX = atacante.x;
      const posicaoOriginalY = atacante.y;
      
      // Ataque fúria tem duração maior para permitir que o GIF complete toda a animação
      // A animação não deve voltar (yoyo) até que o GIF termine
      const isAtaqueFuria = (gifNome === "samurai_Full .gif");
      const isAtaqueInimigoFull = (gifNome === "SpectreFull.gif");
      const isAtaqueInimigoGolpe1 = (gifNome === "Spectre_Golpe_1.gif");
      
      // Duração aumentada para ataques básico e corte para serem mais lentos e visíveis
      // Para ataques do inimigo com SpectreFull.gif e Spectre_Golpe_1.gif, usar duração maior
      // SpectreFull.gif é um GIF longo que precisa de mais tempo para completar toda a animação
      // Spectre_Golpe_1.gif precisa de mais tempo para completar o golpe completo
      // NUNCA criar tween de movimento se for Spectre_Golpe_2.gif (já tratado no início)
      if (isAtaqueInimigoGolpe2 && atacante === this.enemy) {
        return; // Já foi tratado no início da função
      }
      
      const duracaoAnimacao = isAtaqueFuria ? 1500 : (isAtaqueInimigoFull ? 1500 : (isAtaqueInimigoGolpe1 ? 1500 : 300));
      const usarYoyo = !isAtaqueFuria && !isAtaqueInimigoFull && !isAtaqueInimigoGolpe1;
      
      this.tweens.add({
        targets: atacante,
        x: alvo.x - (atacante.x < alvo.x ? 50 : -50),
        y: atacante.y - 20,
        duration: duracaoAnimacao,
        ease: "Power2",
        yoyo: usarYoyo,
        onComplete: () => {
          // Para o ataque fúria, não voltar imediatamente - aguardar o GIF completar
          const gifNomeAtual = gifNome || (atacante === this.player ? (this.playerGolpeElement as any)?._gifNome : (this.enemyGolpeElement as any)?._gifNome);
          const isAtaqueFuria = (gifNomeAtual === "samurai_Full .gif");
          const isAtaqueInimigoLongo = (gifNomeAtual === "SpectreFull.gif" || gifNomeAtual === "Spectre_Golpe_1.gif");
          
          // Para ataques do jogador (exceto fúria) e ataques curtos do inimigo, voltar imediatamente
          if (!isAtaqueFuria && !(atacante === this.enemy && isAtaqueInimigoLongo)) {
            atacante.setPosition(posicaoOriginalX, posicaoOriginalY);
          }
          
          // Remover elemento de golpe e restaurar animação idle após o ataque
          if (atacante === this.player) {
            // Para o ataque fúria, aguardar um tempo adequado para o GIF completar uma vez
            // antes de esconder e remover (reduzido para evitar que reinicie)
            const delayEsconder = isAtaqueFuria ? 1400 : 0;
            const delayRemocao = isAtaqueFuria ? 1600 : 0;
            
            // Para o ataque fúria, aguardar um tempo adequado antes de esconder e remover
            if (isAtaqueFuria) {
              // Esconder o GIF após um tempo para evitar que reinicie, mas restaurar idle imediatamente
              this.time.delayedCall(delayEsconder, () => {
                if (this.playerGolpeElement) {
                  this.playerGolpeElement.style.display = "none";
                }
                
                // Restaurar idle imediatamente após esconder o GIF para evitar que o personagem desapareça
                if (this.playerIdleElement) {
                  const escalaPersonagem = 1.6;
                  const alturaOriginal = 200;
                  const larguraOriginal = 150;
                  const alturaEscalada = alturaOriginal * escalaPersonagem;
                  const larguraEscalada = larguraOriginal * escalaPersonagem;
                  
                  this.playerIdleElement.style.width = `${larguraEscalada}px`;
                  this.playerIdleElement.style.height = `${alturaEscalada}px`;
                  this.playerIdleElement.style.display = "block";
                  
                  if (this.player) {
                    this.player.setVisible(false);
                  }
                }
                
                // Voltar à posição original de forma suave com animação
                this.tweens.add({
                  targets: atacante,
                  x: posicaoOriginalX,
                  y: posicaoOriginalY,
                  duration: 300,
                  ease: "Power2",
                  onComplete: () => {
                    atacante.setPosition(posicaoOriginalX, posicaoOriginalY);
                  }
                });
              });
              
              // Remover o GIF completamente após um tempo maior
              this.time.delayedCall(delayRemocao, () => {
                // Remover event listeners do GIF de golpe antes de removê-lo
                if (this.playerGolpeElement) {
                  try {
                    const atualizarPosicao = (this.playerGolpeElement as any)?._atualizarPosicao;
                    if (atualizarPosicao) {
                      this.events.off("update", atualizarPosicao);
                      this.scale.off("resize", atualizarPosicao);
                    }
                  } catch (e) {
                    console.warn("Erro ao remover listeners:", e);
                  }
                }
                
                if (this.playerGolpeElement && this.playerGolpeElement.parentElement) {
                  this.playerGolpeElement.parentElement.removeChild(this.playerGolpeElement);
                  this.playerGolpeElement = undefined;
                }
              });
            } else {
              // Para outros ataques, remover imediatamente
              // Remover event listeners do GIF de golpe antes de removê-lo
              if (this.playerGolpeElement) {
                try {
                  const atualizarPosicao = (this.playerGolpeElement as any)?._atualizarPosicao;
                  if (atualizarPosicao) {
                    this.events.off("update", atualizarPosicao);
                    this.scale.off("resize", atualizarPosicao);
                  }
                } catch (e) {
                  console.warn("Erro ao remover listeners:", e);
                }
              }
              
              if (this.playerGolpeElement && this.playerGolpeElement.parentElement) {
                this.playerGolpeElement.parentElement.removeChild(this.playerGolpeElement);
                this.playerGolpeElement = undefined;
              }
              
              // Restaurar idle após remover o GIF de golpe
              if (this.playerIdleElement) {
                const escalaPersonagem = 1.6;
                const alturaOriginal = 200;
                const larguraOriginal = 150;
                const alturaEscalada = alturaOriginal * escalaPersonagem;
                const larguraEscalada = larguraOriginal * escalaPersonagem;
                
                this.playerIdleElement.style.width = `${larguraEscalada}px`;
                this.playerIdleElement.style.height = `${alturaEscalada}px`;
                this.playerIdleElement.style.display = "block";
                
                if (this.player) {
                  this.player.setVisible(false);
                }
              }
            }
          }
          
          if (atacante === this.enemy) {
            // Verificar qual GIF foi usado para determinar o delay necessário
            const gifNomeAtual = gifNome || (this.enemyGolpeElement as any)?._gifNome;
            const isAtaqueFull = (gifNomeAtual === "SpectreFull.gif");
            const isAtaqueGolpe1 = (gifNomeAtual === "Spectre_Golpe_1.gif");
            
            // Para SpectreFull.gif e Spectre_Golpe_1.gif, aguardar mais tempo para completar a animação
            // SpectreFull.gif é um GIF muito longo (3119 linhas) que precisa de muito mais tempo para completar toda a animação antes de esconder
            // Aumentar significativamente o tempo para garantir que complete completamente
            // Spectre_Golpe_1.gif precisa esconder ANTES que o GIF reinicie para evitar que repita no final
            // Reduzir o delay para esconder antes que complete um ciclo completo
            const isCavaleiroDecaido = (this.enemyConfig.id === "cavaleiroDecaido");
            let delayEsconder = isAtaqueFull ? 3000 : (isAtaqueGolpe1 ? 1000 : 400);
            let delayRemocao = isAtaqueFull ? 3300 : (isAtaqueGolpe1 ? 1200 : 500);
            
            // Tempos específicos para Cavaleiro Decaído
            if (isCavaleiroDecaido) {
              if (gifNomeAtual?.includes("Full")) {
                delayEsconder = 2000;
                delayRemocao = 2300;
              } else {
                delayEsconder = 1500;
                delayRemocao = 1800;
              }
            }
            
            // Esconder o GIF após um tempo para evitar que reinicie
            this.time.delayedCall(delayEsconder, () => {
              // PRIMEIRO: Restaurar idle ANTES de esconder o GIF para evitar que o inimigo desapareça
              if (this.enemyIdleElement) {
                // Usar as dimensões originais do elemento para manter proporção
                const escalaInimigo = this.enemyConfig.escala; // Usar escala correta do config
                const alturaBase = 200;
                // Calcular largura baseada na proporção original do GIF
                const proporcaoOriginal = this.enemyIdleElement.naturalWidth / this.enemyIdleElement.naturalHeight || 0.75;
                const larguraBase = alturaBase * proporcaoOriginal;
                const alturaEscalada = alturaBase * escalaInimigo;
                const larguraEscalada = larguraBase * escalaInimigo;
                
                // Garantir que o idle está com o tamanho correto mantendo proporção
                this.enemyIdleElement.style.width = `${larguraEscalada}px`;
                this.enemyIdleElement.style.height = `${alturaEscalada}px`;
                this.enemyIdleElement.style.minWidth = `${larguraEscalada}px`;
                this.enemyIdleElement.style.minHeight = `${alturaEscalada}px`;
                this.enemyIdleElement.style.maxWidth = `${larguraEscalada}px`;
                this.enemyIdleElement.style.maxHeight = `${alturaEscalada}px`;
                this.enemyIdleElement.style.display = "block";
              }
              
              if (this.enemy) {
                this.enemy.setVisible(true);
              }
              
              // DEPOIS: Esconder o GIF após restaurar o idle
              if (this.enemyGolpeElement) {
                this.enemyGolpeElement.style.display = "none";
              }
              
              // Voltar à posição original de forma suave apenas se ainda não voltou
              if (atacante.x !== posicaoOriginalX || atacante.y !== posicaoOriginalY) {
                this.tweens.add({
                  targets: atacante,
                  x: posicaoOriginalX,
                  y: posicaoOriginalY,
                  duration: 300,
                  ease: "Power2",
                  onComplete: () => {
                    atacante.setPosition(posicaoOriginalX, posicaoOriginalY);
                  }
                });
              } else {
                // Se já está na posição, apenas garantir que está correto
                atacante.setPosition(posicaoOriginalX, posicaoOriginalY);
              }
            });
            
            // Remover o GIF completamente após um tempo maior
            this.time.delayedCall(delayRemocao, () => {
              // Remover event listeners do GIF de golpe antes de removê-lo
              if (this.enemyGolpeElement) {
                try {
                  const atualizarPosicao = (this.enemyGolpeElement as any)?._atualizarPosicao;
                  if (atualizarPosicao) {
                    this.events.off("update", atualizarPosicao);
                    this.scale.off("resize", atualizarPosicao);
                  }
                } catch (e) {
                  console.warn("Erro ao remover listeners do inimigo:", e);
                }
              }
              
              if (this.enemyGolpeElement && this.enemyGolpeElement.parentElement) {
                this.enemyGolpeElement.parentElement.removeChild(this.enemyGolpeElement);
                this.enemyGolpeElement = undefined;
              }
            });
          }
        }
      });
    }

    animaDano(alvo: Phaser.GameObjects.Sprite) {
      // Determinar se é o jogador ou o inimigo
      const isJogador = alvo === this.player;
      const isInimigo = alvo === this.enemy;
      
      // Animação de dano para sprite do Phaser (se visível)
      if (alvo.visible) {
        this.tweens.add({
          targets: alvo,
          tint: 0xff0000,
          duration: 100,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            alvo.clearTint();
          }
        });
      }
      
      // Animação de dano para elementos HTML (GIFs)
      let elementoHTML: HTMLImageElement | null = null;
      
      if (isJogador && this.playerIdleElement) {
        elementoHTML = this.playerIdleElement;
      } else if (isInimigo && this.enemyIdleElement) {
        elementoHTML = this.enemyIdleElement;
      }
      
      if (elementoHTML && elementoHTML.style.display !== "none") {
        // Salvar estilos originais
        const estiloOriginal = {
          filter: elementoHTML.style.filter,
          transform: elementoHTML.style.transform,
          transition: elementoHTML.style.transition
        };
        
        // Criar keyframes CSS dinamicamente se não existirem
        if (!document.getElementById('dano-keyframes')) {
          const style = document.createElement('style');
          style.id = 'dano-keyframes';
          style.textContent = `
            @keyframes dano-flash {
              0% { 
                filter: brightness(1) saturate(1) contrast(1);
                transform: scale(1);
              }
              15% { 
                filter: brightness(1.5) saturate(2) contrast(1.2);
                transform: scale(1.05);
              }
              30% { 
                filter: brightness(0.8) saturate(1.5) contrast(1.1);
                transform: scale(0.98);
              }
              45% { 
                filter: brightness(1.3) saturate(2) contrast(1.2);
                transform: scale(1.03);
              }
              60% { 
                filter: brightness(0.9) saturate(1.3) contrast(1.05);
                transform: scale(0.99);
              }
              75% { 
                filter: brightness(1.2) saturate(1.8) contrast(1.15);
                transform: scale(1.02);
              }
              100% { 
                filter: brightness(1) saturate(1) contrast(1);
                transform: scale(1);
              }
            }
            
            @keyframes dano-shake {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              10% { transform: translate(-3px, -2px) rotate(-1deg); }
              20% { transform: translate(3px, 2px) rotate(1deg); }
              30% { transform: translate(-2px, 3px) rotate(-0.5deg); }
              40% { transform: translate(2px, -3px) rotate(0.5deg); }
              50% { transform: translate(-3px, 2px) rotate(-1deg); }
              60% { transform: translate(3px, -2px) rotate(1deg); }
              70% { transform: translate(-2px, -3px) rotate(-0.5deg); }
              80% { transform: translate(2px, 3px) rotate(0.5deg); }
              90% { transform: translate(-1px, -1px) rotate(-0.3deg); }
            }
            
            @keyframes dano-red-tint {
              0%, 100% { 
                filter: brightness(1) saturate(1) contrast(1) hue-rotate(0deg);
              }
              25% { 
                filter: brightness(1.4) saturate(2.5) contrast(1.3) hue-rotate(-10deg);
              }
              50% { 
                filter: brightness(0.7) saturate(1.8) contrast(1.1) hue-rotate(5deg);
              }
              75% { 
                filter: brightness(1.2) saturate(2.2) contrast(1.25) hue-rotate(-5deg);
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Aplicar animações combinadas
        elementoHTML.style.animation = 'dano-flash 0.4s ease-in-out, dano-shake 0.4s ease-in-out, dano-red-tint 0.4s ease-in-out';
        elementoHTML.style.willChange = 'filter, transform';
        
        // Criar partículas de impacto (pequenos pontos vermelhos)
        const rect = elementoHTML.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Criar partículas usando divs pequenas
        for (let i = 0; i < 8; i++) {
          const particula = document.createElement('div');
          const angle = (Math.PI * 2 * i) / 8;
          const distance = 30 + Math.random() * 20;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          particula.style.position = 'fixed';
          particula.style.left = `${x}px`;
          particula.style.top = `${y}px`;
          particula.style.width = '4px';
          particula.style.height = '4px';
          particula.style.backgroundColor = '#ff4444';
          particula.style.borderRadius = '50%';
          particula.style.pointerEvents = 'none';
          particula.style.zIndex = '10001';
          particula.style.boxShadow = '0 0 6px rgba(255, 68, 68, 0.8)';
          particula.style.opacity = '0';
          
          document.body.appendChild(particula);
          
          // Animação da partícula
          const animacao = particula.animate([
            { 
              opacity: 0, 
              transform: 'translate(0, 0) scale(0)',
              offset: 0
            },
            { 
              opacity: 1, 
              transform: `translate(${Math.cos(angle) * distance * 0.5}px, ${Math.sin(angle) * distance * 0.5}px) scale(1)`,
              offset: 0.2
            },
            { 
              opacity: 0.7, 
              transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.8)`,
              offset: 0.6
            },
            { 
              opacity: 0, 
              transform: `translate(${Math.cos(angle) * distance * 1.2}px, ${Math.sin(angle) * distance * 1.2}px) scale(0)`,
              offset: 1
            }
          ], {
            duration: 500,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
          });
          
          animacao.onfinish = () => {
            if (particula.parentNode) {
              particula.parentNode.removeChild(particula);
            }
          };
        }
        
        // Remover animações após completar
        const removerAnimacoes = () => {
          elementoHTML!.style.animation = '';
          elementoHTML!.style.willChange = '';
          elementoHTML!.style.filter = estiloOriginal.filter;
          elementoHTML!.style.transform = estiloOriginal.transform;
          elementoHTML!.style.transition = estiloOriginal.transition;
        };
        
        // Usar evento de animação para limpar
        elementoHTML.addEventListener('animationend', removerAnimacoes, { once: true });
        
        // Fallback: remover após 500ms
        setTimeout(() => {
          removerAnimacoes();
        }, 500);
      }
    }

    criarBotaoTrocarMusica() {
      const { width, height } = this.scale;
      // Tamanho responsivo baseado na largura da tela
      const btnSize = Math.max(40, Math.min(60, width * 0.05)); // Entre 40px e 60px ou 5% da largura
      const btnX = width - btnSize - (width * 0.02); // 2% da largura como padding
      const btnY = btnSize / 2 + (height * 0.02); // 2% da altura como padding
      
      // Fundo do botão (cor da borda muda conforme estado de mute)
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x2a2a3a, 0.9);
      btnBg.fillRoundedRect(btnX - btnSize / 2, btnY - btnSize / 2, btnSize, btnSize, 8);
      const corBorda = this.musicaMutada ? 0xff6666 : 0x88ddff;
      btnBg.lineStyle(2, corBorda, 0.7);
      btnBg.strokeRoundedRect(btnX - btnSize / 2, btnY - btnSize / 2, btnSize, btnSize, 8);
      btnBg.setDepth(2000);
      this.btnTrocarMusicaBg = btnBg;
      
      // Ícone/texto do botão (🎵 ou 🔇 dependendo do estado)
      const iconeMusica = this.musicaMutada ? "🔇" : "🎵";
      const fontSize = Math.max(18, Math.min(28, width * 0.03)); // Responsivo: entre 18px e 28px ou 3% da largura
      this.btnTrocarMusica = this.add.text(btnX, btnY, iconeMusica, {
        fontSize: `${fontSize}px`,
        color: this.musicaMutada ? "#ff6666" : "#ffffff",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setDepth(2001)
      .setInteractive({
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-btnSize / 2, -btnSize / 2, btnSize, btnSize)
      })
      .on("pointerover", () => {
        const bg = this.btnTrocarMusicaBg;
        const btn = this.btnTrocarMusica;
        if (bg && btn) {
          const currentBtnSize = Math.max(40, Math.min(60, this.scale.width * 0.05));
          const currentBtnX = this.scale.width - currentBtnSize - (this.scale.width * 0.02);
          const currentBtnY = currentBtnSize / 2 + (this.scale.height * 0.02);
          
          bg.clear();
          bg.fillStyle(0x3a3a4a, 0.95);
          bg.fillRoundedRect(currentBtnX - currentBtnSize / 2, currentBtnY - currentBtnSize / 2, currentBtnSize, currentBtnSize, 8);
          const corBordaHover = this.musicaMutada ? 0xff6666 : 0x88ddff;
          bg.lineStyle(3, corBordaHover, 1);
          bg.strokeRoundedRect(currentBtnX - currentBtnSize / 2, currentBtnY - currentBtnSize / 2, currentBtnSize, currentBtnSize, 8);
          
          this.tweens.add({
            targets: btn,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150
          });
        }
      })
      .on("pointerout", () => {
        const bg = this.btnTrocarMusicaBg;
        const btn = this.btnTrocarMusica;
        if (bg && btn) {
          const currentBtnSize = Math.max(40, Math.min(60, this.scale.width * 0.05));
          const currentBtnX = this.scale.width - currentBtnSize - (this.scale.width * 0.02);
          const currentBtnY = currentBtnSize / 2 + (this.scale.height * 0.02);
          
          bg.clear();
          bg.fillStyle(0x2a2a3a, 0.9);
          bg.fillRoundedRect(currentBtnX - currentBtnSize / 2, currentBtnY - currentBtnSize / 2, currentBtnSize, currentBtnSize, 8);
          const corBorda = this.musicaMutada ? 0xff6666 : 0x88ddff;
          bg.lineStyle(2, corBorda, 0.7);
          bg.strokeRoundedRect(currentBtnX - currentBtnSize / 2, currentBtnY - currentBtnSize / 2, currentBtnSize, currentBtnSize, 8);
          
          this.tweens.add({
            targets: btn,
            scaleX: 1,
            scaleY: 1,
            duration: 150
          });
        }
      })
      .on("pointerdown", () => {
        // Sempre mutar/desmutar ao clicar
        this.toggleMute();
      });
    }
    
    trocarMusica() {
      // Parar música atual
      if (this.musicGame?.isPlaying) {
        this.musicGame.stop();
        this.musicGame.destroy();
      }
      
      // Avançar para próxima música
      this.indiceMusicaAtual = (this.indiceMusicaAtual + 1) % this.musicasDisponiveis.length;
      const proximaMusica = this.musicasDisponiveis[this.indiceMusicaAtual];
      
      // Tocar próxima música (respeitando o estado de mute)
      try {
        const volume = this.musicaMutada ? 0 : 0.5;
        const music = this.sound.add(proximaMusica, { loop: true, volume });
        if (music) {
          this.musicGame = music;
          if (!this.musicaMutada) {
            music.play();
          }
          console.log("🎵 Música alterada para:", proximaMusica);
          
          // Feedback visual no botão
          if (this.btnTrocarMusica) {
            this.tweens.add({
              targets: this.btnTrocarMusica,
              scaleX: 1.3,
              scaleY: 1.3,
              duration: 200,
              yoyo: true,
              ease: "Power2"
            });
          }
        }
      } catch (error) {
        console.warn("⚠️ Erro ao trocar música:", error);
      }
    }
    
    toggleMute() {
      this.musicaMutada = !this.musicaMutada;
      
      // Salvar estado no localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("game_music_muted", this.musicaMutada.toString());
      }
      
      // Aplicar mute/unmute em todas as músicas
      if (this.musicGame) {
        if (this.musicaMutada) {
          this.musicGame.pause();
          (this.musicGame as any).volume = 0;
        } else {
          (this.musicGame as any).volume = 0.5;
          if (!this.musicGame.isPlaying) {
            this.musicGame.play();
          }
        }
      }
      
      if (this.musicVictory) {
        (this.musicVictory as any).volume = this.musicaMutada ? 0 : 0.5;
      }
      
      if (this.musicDefeat) {
        (this.musicDefeat as any).volume = this.musicaMutada ? 0 : 0.5;
      }
      
      // Atualizar ícone do botão
      if (this.btnTrocarMusica) {
        const novoIcone = this.musicaMutada ? "🔇" : "🎵";
        this.btnTrocarMusica.setText(novoIcone);
        this.btnTrocarMusica.setStyle({
          color: this.musicaMutada ? "#ff6666" : "#ffffff"
        });
        
        // Feedback visual
        this.tweens.add({
          targets: this.btnTrocarMusica,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 150,
          yoyo: true,
          ease: "Power2"
        });
      }
      
      // Atualizar cor da borda do botão
      if (this.btnTrocarMusicaBg) {
        const { width } = this.scale;
        const btnSize = 50;
        const btnX = width - btnSize - 20;
        const btnY = btnSize / 2 + 20;
        
        this.btnTrocarMusicaBg.clear();
        this.btnTrocarMusicaBg.fillStyle(0x2a2a3a, 0.9);
        this.btnTrocarMusicaBg.fillRoundedRect(btnX - btnSize / 2, btnY - btnSize / 2, btnSize, btnSize, 8);
        const corBorda = this.musicaMutada ? 0xff6666 : 0x88ddff;
        this.btnTrocarMusicaBg.lineStyle(2, corBorda, 0.7);
        this.btnTrocarMusicaBg.strokeRoundedRect(btnX - btnSize / 2, btnY - btnSize / 2, btnSize, btnSize, 8);
      }
      
      console.log(this.musicaMutada ? "🔇 Música mutada" : "🔊 Música desmutada");
    }

    criarBotaoVoltar() {
      const { width, height } = this.scale;
      // Tamanhos responsivos baseados no tamanho da tela
      const fontSize = Math.max(14, Math.min(20, width * 0.02)); // Responsivo: entre 14px e 20px ou 2% da largura
      const btnWidth = Math.max(90, Math.min(130, width * 0.12)); // Responsivo: entre 90px e 130px ou 12% da largura
      const btnHeight = Math.max(35, Math.min(45, height * 0.05)); // Responsivo: entre 35px e 45px ou 5% da altura
      const padding = Math.max(10, Math.min(20, width * 0.015)); // Responsivo: entre 10px e 20px ou 1.5% da largura
      
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x2a2a3a, 0.95);
      btnBg.fillRoundedRect(padding, padding, btnWidth, btnHeight, 8);
      btnBg.lineStyle(2, 0xff6666, 0.9);
      btnBg.strokeRoundedRect(padding, padding, btnWidth, btnHeight, 8);
      btnBg.setDepth(2000); // Depth muito alto para ficar acima de todos os elementos
      
      const btn = this.add.text(padding + btnWidth / 2, padding + btnHeight / 2, "Voltar", {
        fontSize: `${fontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 2
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2001) // Depth muito alto para ficar acima de todos os elementos
      .setInteractive({ 
        useHandCursor: true, 
        hitArea: new Phaser.Geom.Rectangle(padding, padding, btnWidth, btnHeight),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      })
      .on("pointerover", () => {
        const currentWidth = this.scale.width;
        const currentHeight = this.scale.height;
        const currentBtnWidth = Math.max(90, Math.min(130, currentWidth * 0.12));
        const currentBtnHeight = Math.max(35, Math.min(45, currentHeight * 0.05));
        const currentPadding = Math.max(10, Math.min(20, currentWidth * 0.015));
        
        btnBg.clear();
        btnBg.fillStyle(0x3a3a4a, 1);
        btnBg.fillRoundedRect(currentPadding, currentPadding, currentBtnWidth, currentBtnHeight, 8);
        btnBg.lineStyle(3, 0xff8888, 1);
        btnBg.strokeRoundedRect(currentPadding, currentPadding, currentBtnWidth, currentBtnHeight, 8);
        btnBg.setDepth(2000); // Manter depth alto
        btn.setStyle({ color: "#ffaaaa" });
        btn.setDepth(2001); // Manter depth alto
        this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 150 });
      })
      .on("pointerout", () => {
        const currentWidth = this.scale.width;
        const currentHeight = this.scale.height;
        const currentBtnWidth = Math.max(90, Math.min(130, currentWidth * 0.12));
        const currentBtnHeight = Math.max(35, Math.min(45, currentHeight * 0.05));
        const currentPadding = Math.max(10, Math.min(20, currentWidth * 0.015));
        
        btnBg.clear();
        btnBg.fillStyle(0x2a2a3a, 0.95);
        btnBg.fillRoundedRect(currentPadding, currentPadding, currentBtnWidth, currentBtnHeight, 8);
        btnBg.lineStyle(2, 0xff6666, 0.9);
        btnBg.strokeRoundedRect(currentPadding, currentPadding, currentBtnWidth, currentBtnHeight, 8);
        btnBg.setDepth(2000); // Manter depth alto
        btn.setStyle({ color: "#ffffff" });
        btn.setDepth(2001); // Manter depth alto
        this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 150 });
      })
      .on("pointerdown", () => {
        if (typeof window !== "undefined") {
          window.history.back();
        }
      });
      
      // Armazenar referências para atualização no resize
      (this as any).btnVoltarBg = btnBg;
      (this as any).btnVoltar = btn;
    }

    criarBalaoAcoes() {
      const { width, height } = this.scale;
      const alturaSuperior = height * 0.6;
      const larguraPainel = width * 0.48;
      const gapPainel = width * 0.02;
      const yInferior = alturaSuperior;
      
      // Container no painel direito
      const painelX = larguraPainel + gapPainel * 2;
      const painelY = yInferior + gapPainel;
      const painelWidth = larguraPainel;
      const painelHeight = height * 0.4 - gapPainel * 2;
      
      this.acaoContainer = this.add.container(painelX + painelWidth / 2, painelY + painelHeight / 2);
      this.acaoContainer.setDepth(10);

      const fontSize = Math.max(14, Math.round(width * 0.018));
      const padding = 15;
      const alturaAbas = 35;
      const gapAbas = 4;
      
      // ========== BOTÕES DE ABA ==========
      const abaWidth = (painelWidth - padding * 2 - gapAbas) / 2;
      const abaY = -painelHeight / 2 + padding;
      
      // Aba ATAQUES
      const abaAtaquesBg = this.add.graphics();
      abaAtaquesBg.fillStyle(0x2a2a3a, 0.9);
      abaAtaquesBg.fillRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
      abaAtaquesBg.lineStyle(2, 0xffaa44, 0.8);
      abaAtaquesBg.strokeRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
      this.acaoContainer.add(abaAtaquesBg);
      
      const abaAtaquesText = this.add.text(-painelWidth / 2 + padding + abaWidth / 2, abaY + alturaAbas / 2, "ATAQUES", {
        fontSize: `${fontSize + 1}px`,
        color: "#ffaa44",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 1
      }).setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas) })
      .on("pointerover", () => {
        if (this.abaAtiva !== "ataques") {
          abaAtaquesBg.clear();
          abaAtaquesBg.fillStyle(0x3a3a4a, 0.95);
          abaAtaquesBg.fillRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
          abaAtaquesBg.lineStyle(2, 0xffaa44, 0.9);
          abaAtaquesBg.strokeRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
        }
      })
      .on("pointerout", () => {
        if (this.abaAtiva !== "ataques") {
          abaAtaquesBg.clear();
          abaAtaquesBg.fillStyle(0x2a2a3a, 0.9);
          abaAtaquesBg.fillRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
          abaAtaquesBg.lineStyle(2, 0xffaa44, 0.5);
          abaAtaquesBg.strokeRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
        }
      })
      .on("pointerdown", () => this.mudarAba("ataques"));
      this.acaoContainer.add(abaAtaquesText);
      
      // Aba ITENS
      const abaItensBg = this.add.graphics();
      abaItensBg.fillStyle(0x2a2a3a, 0.9);
      abaItensBg.fillRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
      abaItensBg.lineStyle(2, 0x44ffaa, 0.8);
      abaItensBg.strokeRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
      this.acaoContainer.add(abaItensBg);
      
      const abaItensText = this.add.text(-painelWidth / 2 + padding + abaWidth + gapAbas + abaWidth / 2, abaY + alturaAbas / 2, "ITENS", {
        fontSize: `${fontSize + 1}px`,
        color: "#44ffaa",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 1
      }).setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas) })
      .on("pointerover", () => {
        if (this.abaAtiva !== "itens") {
          abaItensBg.clear();
          abaItensBg.fillStyle(0x3a3a4a, 0.95);
          abaItensBg.fillRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
          abaItensBg.lineStyle(2, 0x44ffaa, 0.9);
          abaItensBg.strokeRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
        }
      })
      .on("pointerout", () => {
        if (this.abaAtiva !== "itens") {
          abaItensBg.clear();
          abaItensBg.fillStyle(0x2a2a3a, 0.9);
          abaItensBg.fillRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
          abaItensBg.lineStyle(2, 0x44ffaa, 0.5);
          abaItensBg.strokeRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
        }
      })
      .on("pointerdown", () => this.mudarAba("itens"));
      this.acaoContainer.add(abaItensText);
      
      // Armazenar referências para atualizar visualmente
      (this as any).abaAtaquesBg = abaAtaquesBg;
      (this as any).abaAtaquesText = abaAtaquesText;
      (this as any).abaItensBg = abaItensBg;
      (this as any).abaItensText = abaItensText;
      (this as any).abaWidth = abaWidth;
      (this as any).abaY = abaY;
      (this as any).painelWidth = painelWidth;
      (this as any).painelHeight = painelHeight;
      
      // ========== CONTAINER DE CONTEÚDO ==========
      const conteudoY = abaY + alturaAbas + padding;
      const conteudoHeight = painelHeight - alturaAbas - padding * 2;
      const conteudoWidth = painelWidth - padding * 2;
      
      // Container de ATAQUES
      this.ataquesContainer = this.add.container(0, conteudoY + conteudoHeight / 2);
      this.acaoContainer.add(this.ataquesContainer);
      
      // Usar ataques da configuração do personagem
      const ataques = this.characterConfig.ataques;
      
      const gapAtaques = 8;
      const btnHeight = (conteudoHeight - gapAtaques * (ataques.length - 1)) / ataques.length;
      const btnWidthAtaques = conteudoWidth - padding * 2;
      
      ataques.forEach((ataque, i) => {
        const y = -conteudoHeight / 2 + i * (btnHeight + gapAtaques);
        
        // Fundo do botão
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x2a2a3a, 0.9);
        btnBg.fillRoundedRect(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight, 8);
        btnBg.lineStyle(2, ataque.cor, 0.7);
        btnBg.strokeRoundedRect(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight, 8);
        this.ataquesContainer.add(btnBg);
        
        // Mostrar barras de especial ao invés de MP
        const textoCusto = `${ataque.custo} ${ataque.custo === 1 ? 'barra' : 'barras'}`;
        const btn = this.add.text(0, y + btnHeight / 2, `${ataque.nome}\n${textoCusto}`, {
          fontSize: `${fontSize}px`,
          color: "#ffffff",
          fontStyle: "bold",
          align: "center",
          stroke: "#000",
          strokeThickness: 1
        })
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight) })
        .on("pointerover", () => {
          btnBg.clear();
          btnBg.fillStyle(0x3a3a4a, 0.95);
          btnBg.fillRoundedRect(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight, 8);
          btnBg.lineStyle(3, ataque.cor, 1);
          btnBg.strokeRoundedRect(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight, 8);
          btn.setStyle({ color: Phaser.Display.Color.ValueToColor(ataque.cor).rgba });
          this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 150 });
        })
        .on("pointerout", () => {
          btnBg.clear();
          btnBg.fillStyle(0x2a2a3a, 0.9);
          btnBg.fillRoundedRect(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight, 8);
          btnBg.lineStyle(2, ataque.cor, 0.7);
          btnBg.strokeRoundedRect(-btnWidthAtaques / 2, y, btnWidthAtaques, btnHeight, 8);
          btn.setStyle({ color: "#ffffff" });
          this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 150 });
        })
        .on("pointerdown", () => {
          this.usarAtaque(ataque);
        });
        this.ataquesContainer.add(btn);
      });
      
      // Container de ITENS
      this.itensContainer = this.add.container(0, conteudoY + conteudoHeight / 2);
      this.acaoContainer.add(this.itensContainer);
      
      const itens = [
        { nome: "❤️ Cura HP", tipo: "hp", cor: 0xff4444 },
        { nome: "💧 Cura Mana", tipo: "mana", cor: 0x4488ff },
        { nome: "✨ Restaurar", tipo: "restaurar", cor: 0xffaa44 }
      ];
      
      const gapItens = 8;
      const btnHeightItens = (conteudoHeight - gapItens * (itens.length - 1)) / itens.length;
      const btnWidthItens = conteudoWidth - padding * 2;
      
      itens.forEach((item, i) => {
        const y = -conteudoHeight / 2 + i * (btnHeightItens + gapItens);
        
        // Fundo do botão
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x2a2a3a, 0.9);
        btnBg.fillRoundedRect(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens, 8);
        btnBg.lineStyle(2, item.cor, 0.7);
        btnBg.strokeRoundedRect(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens, 8);
        this.itensContainer.add(btnBg);
        
        const btn = this.add.text(0, y + btnHeightItens / 2, item.nome, {
          fontSize: `${fontSize}px`,
          color: "#ffffff",
          fontStyle: "bold",
          stroke: "#000",
          strokeThickness: 1
        })
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens) })
        .on("pointerover", () => {
          btnBg.clear();
          btnBg.fillStyle(0x3a3a4a, 0.95);
          btnBg.fillRoundedRect(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens, 8);
          btnBg.lineStyle(3, item.cor, 1);
          btnBg.strokeRoundedRect(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens, 8);
          btn.setStyle({ color: Phaser.Display.Color.ValueToColor(item.cor).rgba });
          this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 150 });
        })
        .on("pointerout", () => {
          btnBg.clear();
          btnBg.fillStyle(0x2a2a3a, 0.9);
          btnBg.fillRoundedRect(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens, 8);
          btnBg.lineStyle(2, item.cor, 0.7);
          btnBg.strokeRoundedRect(-btnWidthItens / 2, y, btnWidthItens, btnHeightItens, 8);
          btn.setStyle({ color: "#ffffff" });
          this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 150 });
        })
        .on("pointerdown", () => {
          this.usarAcao(item.nome);
        });
        this.itensContainer.add(btn);
      });
      
      // Inicializar com aba de ataques visível
      this.mudarAba("ataques");
    }
    
    mudarAba(aba: "ataques" | "itens") {
      this.abaAtiva = aba;
      
      const abaAtaquesBg = (this as any).abaAtaquesBg;
      const abaAtaquesText = (this as any).abaAtaquesText;
      const abaItensBg = (this as any).abaItensBg;
      const abaItensText = (this as any).abaItensText;
      const abaWidth = (this as any).abaWidth;
      const abaY = (this as any).abaY;
      const painelWidth = (this as any).painelWidth;
      const padding = 15;
      const gapAbas = 4;
      const alturaAbas = 35;
      
      if (aba === "ataques") {
        // Ativar aba ATAQUES
        abaAtaquesBg.clear();
        abaAtaquesBg.fillStyle(0x3a3a4a, 0.95);
        abaAtaquesBg.fillRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
        abaAtaquesBg.lineStyle(3, 0xffaa44, 1);
        abaAtaquesBg.strokeRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
        abaAtaquesText.setStyle({ color: "#ffaa44", alpha: 1 });
        
        // Desativar aba ITENS
        abaItensBg.clear();
        abaItensBg.fillStyle(0x2a2a3a, 0.9);
        abaItensBg.fillRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
        abaItensBg.lineStyle(2, 0x44ffaa, 0.5);
        abaItensBg.strokeRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
        abaItensText.setStyle({ color: "#44ffaa", alpha: 0.6 });
        
        // Mostrar ataques, esconder itens
        this.ataquesContainer.setVisible(true);
        this.itensContainer.setVisible(false);
      } else {
        // Ativar aba ITENS
        abaItensBg.clear();
        abaItensBg.fillStyle(0x3a3a4a, 0.95);
        abaItensBg.fillRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
        abaItensBg.lineStyle(3, 0x44ffaa, 1);
        abaItensBg.strokeRoundedRect(-painelWidth / 2 + padding + abaWidth + gapAbas, abaY, abaWidth, alturaAbas, 6);
        abaItensText.setStyle({ color: "#44ffaa", alpha: 1 });
        
        // Desativar aba ATAQUES
        abaAtaquesBg.clear();
        abaAtaquesBg.fillStyle(0x2a2a3a, 0.9);
        abaAtaquesBg.fillRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
        abaAtaquesBg.lineStyle(2, 0xffaa44, 0.5);
        abaAtaquesBg.strokeRoundedRect(-painelWidth / 2 + padding, abaY, abaWidth, alturaAbas, 6);
        abaAtaquesText.setStyle({ color: "#ffaa44", alpha: 0.6 });
        
        // Mostrar itens, esconder ataques
        this.ataquesContainer.setVisible(false);
        this.itensContainer.setVisible(true);
      }
    }
    
    mostrarMensagemTemporaria(mensagem: string, duracao: number = 2000) {
      // Cancelar timeout anterior se existir
      if (this.mensagemTimeout) {
        this.time.removeEvent(this.mensagemTimeout);
        this.mensagemTimeout = null;
      }
      
      // Salvar pergunta atual
      const perguntaAtualTemp = this.perguntaAtual;
      
      // Mostrar mensagem
      if (this.perguntaText && perguntaAtualTemp) {
        this.perguntaText.setText(mensagem);
        this.ajustarTextoAoBalao();
        
        // Restaurar pergunta após duração
        this.mensagemTimeout = this.time.delayedCall(duracao, () => {
          if (this.perguntaText && perguntaAtualTemp) {
            this.perguntaText.setText(perguntaAtualTemp.texto);
            this.ajustarTextoAoBalao();
          }
          this.mensagemTimeout = null;
        });
      }
    }

    usarAtaque(ataque: { nome: string; custo: number; dano: number; gif?: string }) {
      // Verificar se tem barras de especial suficientes
      if (this.specialValue < ataque.custo) {
        this.mostrarMensagemTemporaria("Barras de especial insuficientes!", 2000);
        return;
      }

      // Gastar barras de especial
      this.specialValue -= ataque.custo;
      this.atualizarGomosEspecialVisual();
      const dano = Phaser.Math.Between(ataque.dano - 5, ataque.dano + 5);
      this.inimigoHP = Math.max(0, this.inimigoHP - dano);
      
      // Atualizar barra de vida do inimigo
      this.atualizarBalaoInimigo();
      
      // Passar o GIF do ataque para a animação
      this.animaAtaque(this.player, this.enemy, ataque.gif);
      this.animaDano(this.enemy);
      
      if (this.inimigoHP <= 0) {
        this.time.delayedCall(1500, () => {
          this.mostrarTelaFinal("vitoria");
        });
      }
    }

    usarAcao(nome: string) {
      if (nome.includes("Cura HP")) {
        this.jogadorHP = Math.min(this.jogadorHPMax, this.jogadorHP + 30);
        this.mostrarMensagemTemporaria("HP restaurado!", 2000);
      } else if (nome.includes("Cura Mana")) {
        this.jogadorMana = Math.min(this.jogadorManaMax, this.jogadorMana + 30);
        this.mostrarMensagemTemporaria("Mana restaurada!", 2000);
      } else if (nome.includes("Restaurar")) {
        this.jogadorHP = this.jogadorHPMax;
        this.jogadorMana = this.jogadorManaMax;
        this.mostrarMensagemTemporaria("Status totalmente restaurado!", 2000);
      }
    }

    mostrarTelaFinal(resultado: "vitoria" | "derrota") {
      // Parar música de fundo do jogo
      if (this.musicGame && this.musicGame.isPlaying) {
        this.musicGame.stop();
        console.log("🛑 Música de fundo parada");
      }
      
      // Tocar música de vitória ou derrota
      try {
        if (resultado === "vitoria") {
          // Parar música de derrota se estiver tocando
          if (this.musicDefeat && this.musicDefeat.isPlaying) {
            this.musicDefeat.stop();
          }
          // Tocar música de vitória em loop
          if (!this.musicVictory) {
            const music = this.sound.add("music_victory", { loop: true, volume: 0.5 });
            if (music) {
              this.musicVictory = music;
            }
          }
          if (this.musicVictory && !this.musicVictory.isPlaying) {
            this.musicVictory.play();
            console.log("🎵 Música de vitória iniciada");
          }
        } else {
          // Parar música de vitória se estiver tocando
          if (this.musicVictory && this.musicVictory.isPlaying) {
            this.musicVictory.stop();
          }
          // Tocar música de derrota em loop
          if (!this.musicDefeat) {
            const music = this.sound.add("music_defeat", { loop: true, volume: 0.5 });
            if (music) {
              this.musicDefeat = music;
            }
          }
          if (this.musicDefeat && !this.musicDefeat.isPlaying) {
            this.musicDefeat.play();
            console.log("🎵 Música de derrota iniciada");
          }
        }
      } catch (error) {
        console.warn("⚠️ Erro ao tocar música de vitória/derrota:", error);
      }
      
      // Esconder todos os personagens quando a tela final aparecer
      if (this.playerIdleElement) {
        this.playerIdleElement.style.display = "none";
      }
      if (this.player) {
        this.player.setVisible(false);
      }
      if (this.enemyIdleElement) {
        this.enemyIdleElement.style.display = "none";
      }
      if (this.enemy) {
        this.enemy.setVisible(false);
      }
      // Esconder também elementos de golpe se existirem
      if (this.playerGolpeElement) {
        this.playerGolpeElement.style.display = "none";
      }
      if (this.enemyGolpeElement) {
        this.enemyGolpeElement.style.display = "none";
      }
      
      // Overlay escuro com gradiente
      const overlay = this.add.graphics();
      overlay.fillGradientStyle(0x000000, 0x000000, 0x1a1a2a, 0x1a1a2a, 1);
      overlay.fillRect(0, 0, this.scale.width, this.scale.height);
      overlay.setDepth(1000);

      // Painel central com fundo e bordas (responsivo)
      const { width, height } = this.scale;
      const painelWidth = Math.max(400, Math.min(600, width * 0.5)); // Responsivo: entre 400px e 600px ou 50% da largura
      // Altura do painel: menor se for derrota (sem botão Continuar)
      const painelHeight = resultado === "vitoria" 
        ? Math.max(400, Math.min(500, height * 0.5)) 
        : Math.max(320, Math.min(400, height * 0.4));
      const painelX = width / 2;
      const painelY = height / 2;

      const painelBg = this.add.graphics();
      // Sombra do painel
      painelBg.fillStyle(0x000000, 0.5);
      painelBg.fillRoundedRect(painelX - painelWidth / 2 + 5, painelY - painelHeight / 2 + 5, painelWidth, painelHeight, 20);
      // Fundo do painel com gradiente
      painelBg.fillGradientStyle(0x2a2a3a, 0x2a2a3a, 0x1a1a2a, 0x1a1a2a, 1);
      painelBg.fillRoundedRect(painelX - painelWidth / 2, painelY - painelHeight / 2, painelWidth, painelHeight, 20);
      // Borda externa brilhante
      painelBg.lineStyle(4, resultado === "vitoria" ? 0x00ff88 : 0xff4444, 1);
      painelBg.strokeRoundedRect(painelX - painelWidth / 2, painelY - painelHeight / 2, painelWidth, painelHeight, 20);
      // Borda interna sutil
      painelBg.lineStyle(2, resultado === "vitoria" ? 0x88ffaa : 0xff8888, 0.6);
      painelBg.strokeRoundedRect(painelX - painelWidth / 2 + 2, painelY - painelHeight / 2 + 2, painelWidth - 4, painelHeight - 4, 18);
      painelBg.setDepth(1001);

      // Título com efeito de brilho (responsivo)
      const tituloFontSize = Math.max(40, Math.min(64, width * 0.08)); // Responsivo: entre 40px e 64px ou 8% da largura
      const tituloY = painelY - (painelHeight * 0.25); // 25% da altura do painel
      const endText = this.add.text(painelX, tituloY, resultado === "vitoria" ? "VITÓRIA!" : "DERROTA!", {
        fontSize: `${tituloFontSize}px`,
        color: resultado === "vitoria" ? "#00ff88" : "#ff4444",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: Math.max(4, Math.min(6, width * 0.008)),
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: resultado === "vitoria" ? "#00ff88" : "#ff4444",
          blur: 10,
          stroke: true,
          fill: true
        }
      }).setOrigin(0.5);
      endText.setDepth(1002);

      // Animação de pulso no título
      this.tweens.add({
        targets: endText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      // Linha decorativa abaixo do título (responsiva)
      const linhaY = tituloY + (tituloFontSize / 2) + 10;
      const linhaDecorativa = this.add.graphics();
      const linhaPadding = Math.max(30, Math.min(50, painelWidth * 0.1)); // Responsivo: 10% da largura do painel
      linhaDecorativa.lineStyle(3, resultado === "vitoria" ? 0x00ff88 : 0xff4444, 0.8);
      linhaDecorativa.lineBetween(painelX - painelWidth / 2 + linhaPadding, linhaY, painelX + painelWidth / 2 - linhaPadding, linhaY);
      // Gradiente na linha (simulado com múltiplas linhas)
      linhaDecorativa.lineStyle(1, resultado === "vitoria" ? 0x88ffaa : 0xff8888, 0.5);
      linhaDecorativa.lineBetween(painelX - painelWidth / 2 + linhaPadding, linhaY + 1, painelX + painelWidth / 2 - linhaPadding, linhaY + 1);
      linhaDecorativa.setDepth(1002);

      // Texto de pontuação com estilo melhorado (responsivo)
      const pontuacaoFontSize = Math.max(20, Math.min(28, width * 0.035)); // Responsivo: entre 20px e 28px ou 3.5% da largura
      const pontuacaoY = linhaY + 30;
      const pontuacaoText = this.add.text(painelX, pontuacaoY, `Acertos: ${this.acertos} | Erros: ${this.erros}`, {
        fontSize: `${pontuacaoFontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: Math.max(1, Math.min(2, width * 0.002)),
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 4,
          stroke: true,
          fill: true
        }
      }).setOrigin(0.5);
      pontuacaoText.setDepth(1002);

      // Botão Continuar com estilo melhorado (apenas para vitória) - responsivo
      let btnContinuar: Phaser.GameObjects.Text | null = null;
      let btnContinuarBg: Phaser.GameObjects.Graphics | null = null;
      const btnContinuarWidth = Math.max(200, Math.min(300, painelWidth * 0.6)); // Responsivo: 60% da largura do painel
      const btnContinuarHeight = Math.max(50, Math.min(70, painelHeight * 0.12)); // Responsivo: 12% da altura do painel
      const btnContinuarX = painelX;
      const btnContinuarY = pontuacaoY + (painelHeight * 0.15); // Posição relativa ao painel

      // Só criar o botão Continuar se for vitória
      if (resultado === "vitoria") {
        btnContinuarBg = this.add.graphics();
        const btnContinuarFontSize = Math.max(24, Math.min(32, width * 0.04)); // Responsivo: entre 24px e 32px ou 4% da largura
        btnContinuar = this.add.text(btnContinuarX, btnContinuarY, "CONTINUAR", {
        fontSize: `${btnContinuarFontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: Math.max(2, Math.min(3, width * 0.003)),
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 4,
          stroke: true,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setDepth(1003)
      .setInteractive({ 
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-btnContinuarWidth / 2, -btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight)
      })
        .on("pointerover", () => {
          if (!btnContinuarBg || !btnContinuar) return;
          btnContinuarBg.clear();
          // Sombra no hover
          btnContinuarBg.fillStyle(0x000000, 0.4);
          btnContinuarBg.fillRoundedRect(btnContinuarX - btnContinuarWidth / 2 + 3, btnContinuarY - btnContinuarHeight / 2 + 3, btnContinuarWidth, btnContinuarHeight, 12);
          // Fundo no hover
          btnContinuarBg.fillGradientStyle(0x5ab8ff, 0x5ab8ff, 0x4a9eff, 0x4a9eff, 1);
          btnContinuarBg.fillRoundedRect(btnContinuarX - btnContinuarWidth / 2, btnContinuarY - btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight, 12);
          // Borda no hover
          btnContinuarBg.lineStyle(3, 0x88ddff, 1);
          btnContinuarBg.strokeRoundedRect(btnContinuarX - btnContinuarWidth / 2, btnContinuarY - btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight, 12);
          btnContinuar.setStyle({ color: "#88ddff" });
          this.tweens.add({
            targets: btnContinuar,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 150,
            ease: "Power2"
          });
        })
        .on("pointerout", () => {
          if (!btnContinuarBg || !btnContinuar) return;
          btnContinuarBg.clear();
          // Sombra normal
          btnContinuarBg.fillStyle(0x000000, 0.3);
          btnContinuarBg.fillRoundedRect(btnContinuarX - btnContinuarWidth / 2 + 2, btnContinuarY - btnContinuarHeight / 2 + 2, btnContinuarWidth, btnContinuarHeight, 12);
          // Fundo normal
          btnContinuarBg.fillGradientStyle(0x4a9eff, 0x4a9eff, 0x3a8eef, 0x3a8eef, 1);
          btnContinuarBg.fillRoundedRect(btnContinuarX - btnContinuarWidth / 2, btnContinuarY - btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight, 12);
          // Borda normal
          btnContinuarBg.lineStyle(2, 0x6ab8ff, 0.9);
          btnContinuarBg.strokeRoundedRect(btnContinuarX - btnContinuarWidth / 2, btnContinuarY - btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight, 12);
          btnContinuar.setStyle({ color: "#ffffff" });
          this.tweens.add({
            targets: btnContinuar,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: "Power2"
          });
        })
        .on("pointerdown", async () => {
          if (!btnContinuar) return;
          // Desabilitar botão durante o salvamento
          btnContinuar.setInteractive(false);
          btnContinuar.setStyle({ color: "#888888" });
          btnContinuar.setText("SALVANDO...");
          
          try {
            // Garantir que os valores são válidos
            const acertos = typeof this.acertos === "number" && !isNaN(this.acertos) ? this.acertos : 0;
            const erros = typeof this.erros === "number" && !isNaN(this.erros) ? this.erros : 0;
            const pontuacao = acertos * 10 - erros * 5;
            
            // Validar faseId
            if (!this.faseId || typeof this.faseId !== "string" || this.faseId.trim() === "") {
              throw new Error("ID da fase inválido");
            }
            
            console.log("Registrando conclusão da fase:", {
              faseId: this.faseId,
              pontuacao,
              acertos,
              erros
            });
            
            await registrarConclusaoFase(this.faseId, pontuacao, acertos, erros);
            
            console.log("Fase concluída com sucesso! Redirecionando...");
            
            // Pequeno delay para garantir que a API processou tudo
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (typeof window !== "undefined") {
              // Marcar que o usuário acabou de jogar (para mostrar NPS quando voltar)
              localStorage.setItem("ultima_partida_timestamp", Date.now().toString());
              
              // Se tem trilhaId, voltar para a trilha para atualizar o progresso
              if (this.trilhaId) {
                window.location.href = `/trilha?trilhaId=${this.trilhaId}`;
              } else {
                window.history.back();
              }
            }
          } catch (error: any) {
            console.error("❌ Erro ao registrar conclusão:", error);
            console.error("📊 Detalhes do erro no GameScene:", {
              message: error?.message,
              faseId: this.faseId,
              acertos: this.acertos,
              erros: this.erros,
            });
            
            // Re-habilitar botão e mostrar mensagem de erro
            btnContinuar.setInteractive(true);
            btnContinuar.setStyle({ color: "#ffffff" });
            const mensagemErro = error?.message || "Erro ao salvar progresso. Tente novamente.";
            btnContinuar.setText(`ERRO: ${mensagemErro.substring(0, 20)}...`);
            
            // Restaurar texto original após 3 segundos
            setTimeout(() => {
              if (btnContinuar) {
                btnContinuar.setText("CONTINUAR");
              }
            }, 3000);
            // Reabilitar botão em caso de erro
            if (btnContinuar) {
              btnContinuar.setInteractive({ 
                useHandCursor: true,
                hitArea: new Phaser.Geom.Rectangle(-btnContinuarWidth / 2, -btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight)
              });
              btnContinuar.setStyle({ color: "#ffffff" });
              btnContinuar.setText("CONTINUAR");
            }
            
            // Mostrar mensagem de erro
            const erroText = this.add.text(painelX, painelY - 100, "Erro ao salvar. Tente novamente.", {
              fontSize: "20px",
              color: "#ff4444",
              fontStyle: "bold"
            }).setOrigin(0.5).setDepth(1004);
            
            // Remover mensagem após 3 segundos
            this.time.delayedCall(3000, () => {
              erroText.destroy();
            });
          }
        });

        // Desenhar fundo inicial do botão Continuar
        if (btnContinuarBg) {
          btnContinuarBg.fillStyle(0x000000, 0.3);
          btnContinuarBg.fillRoundedRect(btnContinuarX - btnContinuarWidth / 2 + 2, btnContinuarY - btnContinuarHeight / 2 + 2, btnContinuarWidth, btnContinuarHeight, 12);
          btnContinuarBg.fillGradientStyle(0x4a9eff, 0x4a9eff, 0x3a8eef, 0x3a8eef, 1);
          btnContinuarBg.fillRoundedRect(btnContinuarX - btnContinuarWidth / 2, btnContinuarY - btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight, 12);
          btnContinuarBg.lineStyle(2, 0x6ab8ff, 0.9);
          btnContinuarBg.strokeRoundedRect(btnContinuarX - btnContinuarWidth / 2, btnContinuarY - btnContinuarHeight / 2, btnContinuarWidth, btnContinuarHeight, 12);
          btnContinuarBg.setDepth(1002);
        }
      }

      // Botão Jogar de Novo com estilo melhorado (responsivo)
      const btnJogarNovoBg = this.add.graphics();
      const btnJogarNovoWidth = Math.max(200, Math.min(300, painelWidth * 0.6)); // Responsivo: 60% da largura do painel
      const btnJogarNovoHeight = Math.max(50, Math.min(70, painelHeight * 0.12)); // Responsivo: 12% da altura do painel
      const btnJogarNovoX = painelX;
      // Ajustar posição Y baseado se há botão Continuar ou não (responsivo)
      const btnJogarNovoY = resultado === "vitoria" 
        ? btnContinuarY + btnContinuarHeight + (painelHeight * 0.08) 
        : pontuacaoY + (painelHeight * 0.15);

      const btnJogarNovoFontSize = Math.max(24, Math.min(32, width * 0.04)); // Responsivo: entre 24px e 32px ou 4% da largura
      const btnJogarNovo = this.add.text(btnJogarNovoX, btnJogarNovoY, "JOGAR DE NOVO", {
        fontSize: `${btnJogarNovoFontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: Math.max(2, Math.min(3, width * 0.003)),
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 4,
          stroke: true,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setDepth(1003)
      .setInteractive({ 
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-btnJogarNovoWidth / 2, -btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight)
      })
      .on("pointerover", () => {
        btnJogarNovoBg.clear();
        // Sombra no hover
        btnJogarNovoBg.fillStyle(0x000000, 0.4);
        btnJogarNovoBg.fillRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2 + 3, btnJogarNovoY - btnJogarNovoHeight / 2 + 3, btnJogarNovoWidth, btnJogarNovoHeight, 12);
        // Fundo no hover (verde)
        btnJogarNovoBg.fillGradientStyle(0x5aff88, 0x5aff88, 0x4aff77, 0x4aff77, 1);
        btnJogarNovoBg.fillRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2, btnJogarNovoY - btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
        // Borda no hover
        btnJogarNovoBg.lineStyle(3, 0x88ffaa, 1);
        btnJogarNovoBg.strokeRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2, btnJogarNovoY - btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
        btnJogarNovo.setStyle({ color: "#88ffaa" });
        this.tweens.add({
          targets: btnJogarNovo,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: "Power2"
        });
      })
      .on("pointerout", () => {
        btnJogarNovoBg.clear();
        // Sombra normal
        btnJogarNovoBg.fillStyle(0x000000, 0.3);
        btnJogarNovoBg.fillRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2 + 2, btnJogarNovoY - btnJogarNovoHeight / 2 + 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
        // Fundo normal (verde)
        btnJogarNovoBg.fillGradientStyle(0x4aff77, 0x4aff77, 0x3aff66, 0x3aff66, 1);
        btnJogarNovoBg.fillRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2, btnJogarNovoY - btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
        // Borda normal
        btnJogarNovoBg.lineStyle(2, 0x6aff88, 0.9);
        btnJogarNovoBg.strokeRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2, btnJogarNovoY - btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
        btnJogarNovo.setStyle({ color: "#ffffff" });
        this.tweens.add({
          targets: btnJogarNovo,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: "Power2"
        });
      })
      .on("pointerdown", () => {
        // Limpar elementos HTML antes de reiniciar
        this.limparElementosHTML();
        // Recarregar a página para garantir uma inicialização completamente limpa
        if (typeof window !== "undefined") {
          // Pequeno delay para garantir que a limpeza seja concluída
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      });

      // Desenhar fundo inicial do botão Jogar de Novo
      btnJogarNovoBg.fillStyle(0x000000, 0.3);
      btnJogarNovoBg.fillRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2 + 2, btnJogarNovoY - btnJogarNovoHeight / 2 + 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
      btnJogarNovoBg.fillGradientStyle(0x4aff77, 0x4aff77, 0x3aff66, 0x3aff66, 1);
      btnJogarNovoBg.fillRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2, btnJogarNovoY - btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
      btnJogarNovoBg.lineStyle(2, 0x6aff88, 0.9);
      btnJogarNovoBg.strokeRoundedRect(btnJogarNovoX - btnJogarNovoWidth / 2, btnJogarNovoY - btnJogarNovoHeight / 2, btnJogarNovoWidth, btnJogarNovoHeight, 12);
      btnJogarNovoBg.setDepth(1002);

      // Botão Sair com estilo melhorado (responsivo)
      const btnSairBg = this.add.graphics();
      const btnSairWidth = Math.max(200, Math.min(300, painelWidth * 0.6)); // Responsivo: 60% da largura do painel
      const btnSairHeight = Math.max(50, Math.min(70, painelHeight * 0.12)); // Responsivo: 12% da altura do painel
      const btnSairX = painelX;
      // Ajustar posição Y baseado se há botão Continuar ou não (responsivo)
      const btnSairY = resultado === "vitoria" 
        ? btnJogarNovoY + btnJogarNovoHeight + (painelHeight * 0.08) 
        : btnJogarNovoY + btnJogarNovoHeight + (painelHeight * 0.08);

      const btnSairFontSize = Math.max(24, Math.min(32, width * 0.04)); // Responsivo: entre 24px e 32px ou 4% da largura
      const btnSair = this.add.text(btnSairX, btnSairY, "SAIR", {
        fontSize: `${btnSairFontSize}px`,
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: Math.max(2, Math.min(3, width * 0.003)),
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000000",
          blur: 3,
          stroke: true,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setDepth(1003)
      .setInteractive({ 
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(-btnSairWidth / 2, -btnSairHeight / 2, btnSairWidth, btnSairHeight)
      })
      .on("pointerover", () => {
        btnSairBg.clear();
        // Sombra no hover
        btnSairBg.fillStyle(0x000000, 0.4);
        btnSairBg.fillRoundedRect(btnSairX - btnSairWidth / 2 + 3, btnSairY - btnSairHeight / 2 + 3, btnSairWidth, btnSairHeight, 10);
        // Fundo no hover
        btnSairBg.fillGradientStyle(0xff7b7b, 0xff7b7b, 0xff6b6b, 0xff6b6b, 1);
        btnSairBg.fillRoundedRect(btnSairX - btnSairWidth / 2, btnSairY - btnSairHeight / 2, btnSairWidth, btnSairHeight, 10);
        // Borda no hover
        btnSairBg.lineStyle(3, 0xffaaaa, 1);
        btnSairBg.strokeRoundedRect(btnSairX - btnSairWidth / 2, btnSairY - btnSairHeight / 2, btnSairWidth, btnSairHeight, 10);
        btnSair.setStyle({ color: "#ffaaaa" });
        this.tweens.add({
          targets: btnSair,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: "Power2"
        });
      })
      .on("pointerout", () => {
        btnSairBg.clear();
        // Sombra normal
        btnSairBg.fillStyle(0x000000, 0.3);
        btnSairBg.fillRoundedRect(btnSairX - btnSairWidth / 2 + 2, btnSairY - btnSairHeight / 2 + 2, btnSairWidth, btnSairHeight, 10);
        // Fundo normal
        btnSairBg.fillGradientStyle(0xff6b6b, 0xff6b6b, 0xff5b5b, 0xff5b5b, 1);
        btnSairBg.fillRoundedRect(btnSairX - btnSairWidth / 2, btnSairY - btnSairHeight / 2, btnSairWidth, btnSairHeight, 10);
        // Borda normal
        btnSairBg.lineStyle(2, 0xff8888, 0.9);
        btnSairBg.strokeRoundedRect(btnSairX - btnSairWidth / 2, btnSairY - btnSairHeight / 2, btnSairWidth, btnSairHeight, 10);
        btnSair.setStyle({ color: "#ffffff" });
        this.tweens.add({
          targets: btnSair,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: "Power2"
        });
      })
      .on("pointerdown", async () => {
        // Desabilitar botão durante o salvamento
        btnSair.setInteractive(false);
        btnSair.setStyle({ color: "#888888" });
        btnSair.setText("SALVANDO...");
        
        try {
          // Garantir que os valores são válidos
          const acertos = typeof this.acertos === "number" && !isNaN(this.acertos) ? this.acertos : 0;
          const erros = typeof this.erros === "number" && !isNaN(this.erros) ? this.erros : 0;
          const pontuacao = acertos * 10 - erros * 5;
          
          // Validar faseId
          if (!this.faseId || typeof this.faseId !== "string" || this.faseId.trim() === "") {
            throw new Error("ID da fase inválido");
          }
          
          console.log("Registrando conclusão da fase:", {
            faseId: this.faseId,
            pontuacao,
            acertos,
            erros
          });
          
          await registrarConclusaoFase(this.faseId, pontuacao, acertos, erros);
          
          console.log("Fase concluída com sucesso! Redirecionando...");
          
          // Pequeno delay para garantir que a API processou tudo
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (typeof window !== "undefined") {
            // Marcar que o usuário acabou de jogar (para mostrar NPS quando voltar)
            localStorage.setItem("ultima_partida_timestamp", Date.now().toString());
            
            // Se tem trilhaId, voltar para a trilha para atualizar o progresso
            if (this.trilhaId) {
              window.location.href = `/trilha?trilhaId=${this.trilhaId}`;
            } else {
              window.history.back();
            }
          }
          } catch (error: any) {
            console.error("❌ Erro ao registrar conclusão:", error);
            console.error("📊 Detalhes do erro no GameScene (botão Sair):", {
              message: error?.message,
              faseId: this.faseId,
              acertos: this.acertos,
              erros: this.erros,
            });
            
            // Re-habilitar botão e mostrar mensagem de erro
            btnSair.setInteractive(true);
            btnSair.setStyle({ color: "#ffffff" });
            const mensagemErro = error?.message || "Erro ao salvar progresso.";
            btnSair.setText(`ERRO: ${mensagemErro.substring(0, 15)}...`);
            
            // Restaurar texto original após 3 segundos
            setTimeout(() => {
              if (btnSair) {
                btnSair.setText("SAIR");
              }
            }, 3000);
          // Reabilitar botão em caso de erro
          btnSair.setInteractive({ 
            useHandCursor: true,
            hitArea: new Phaser.Geom.Rectangle(-btnSairWidth / 2, -btnSairHeight / 2, btnSairWidth, btnSairHeight)
          });
          btnSair.setStyle({ color: "#ffffff" });
          btnSair.setText("SAIR");
          
          // Mostrar mensagem de erro
          const erroText = this.add.text(painelX, painelY - 100, "Erro ao salvar. Tente novamente.", {
            fontSize: "20px",
            color: "#ff4444",
            fontStyle: "bold"
          }).setOrigin(0.5).setDepth(1004);
          
          // Remover mensagem após 3 segundos
          this.time.delayedCall(3000, () => {
            erroText.destroy();
          });
        }
      });

      // Desenhar fundo inicial do botão Sair
      btnSairBg.fillStyle(0x000000, 0.3);
      btnSairBg.fillRoundedRect(btnSairX - btnSairWidth / 2 + 2, btnSairY - btnSairHeight / 2 + 2, btnSairWidth, btnSairHeight, 10);
      btnSairBg.fillGradientStyle(0xff6b6b, 0xff6b6b, 0xff5b5b, 0xff5b5b, 1);
      btnSairBg.fillRoundedRect(btnSairX - btnSairWidth / 2, btnSairY - btnSairHeight / 2, btnSairWidth, btnSairHeight, 10);
      btnSairBg.lineStyle(2, 0xff8888, 0.9);
      btnSairBg.strokeRoundedRect(btnSairX - btnSairWidth / 2, btnSairY - btnSairHeight / 2, btnSairWidth, btnSairHeight, 10);
      btnSairBg.setDepth(1002);
    }
  };
}

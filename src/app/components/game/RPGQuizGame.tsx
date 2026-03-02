"use client";

import { useEffect, useRef, useState } from "react";
import { createGameScene } from "@/app/game/GameScene";
import apiClient from "@/app/services/api";
import { buscarFasePorId } from "@/app/game/api";

interface RPGQuizGameProps {
  faseId: string;
  trilhaId?: string;
}

// Função para determinar o inimigo baseado na ordem da fase
function getEnemyIdByFaseOrder(ordem: number): string {
  switch (ordem) {
    case 1:
      return "spectre";
    case 2:
      return "arqueira";
    case 3:
      return "magoCorrompido";
    case 4:
      return "cavaleiroDecaido";
    default:
      return "spectre"; // Padrão
  }
}

export default function RPGQuizGame({ faseId, trilhaId }: RPGQuizGameProps) {
  const gameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personagemUsuario, setPersonagemUsuario] = useState<string>("Guerreiro");
  const [enemyId, setEnemyId] = useState<string>("spectre"); // Padrão

  // Carregar personagem do usuário e determinar inimigo baseado na ordem da fase
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar personagem
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await apiClient.get("/api/users/me");
            if (response.data && response.data.personagem) {
              setPersonagemUsuario(response.data.personagem);
            }
          } catch (error) {
            console.error("Erro ao carregar personagem:", error);
            setPersonagemUsuario("Guerreiro"); // Padrão em caso de erro
          }
        } else {
          setPersonagemUsuario("Guerreiro"); // Padrão
        }

        // Carregar fase para obter a ordem e determinar o inimigo
        if (faseId) {
          try {
            const faseData = await buscarFasePorId(faseId);
            const ordem = faseData?.ordem || 1;
            const enemyIdCalculado = getEnemyIdByFaseOrder(ordem);
            setEnemyId(enemyIdCalculado);
            console.log(`Fase ordem ${ordem} -> Inimigo: ${enemyIdCalculado}`);
          } catch (error) {
            console.error("Erro ao carregar fase para determinar inimigo:", error);
            setEnemyId("spectre"); // Padrão em caso de erro
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, [faseId]);

  useEffect(() => {
    if (!faseId) {
      setError("ID da fase não fornecido");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadPhaser = async () => {
      try {
        // Verificar se o container está disponível
        if (!containerRef.current || !isMounted) {
          return;
        }

        // Carregar Phaser dinamicamente
        console.log("Importando Phaser...");
        const PhaserModule = await import("phaser");
        const Phaser = PhaserModule.default || PhaserModule;
        console.log("Phaser importado:", Phaser ? "OK" : "ERRO");

        if (!isMounted || gameRef.current) {
          if (isMounted) setIsLoading(false);
          return;
        }

        console.log("Criando GameScene com faseId:", faseId, "personagem:", personagemUsuario, "inimigo:", enemyId);
        // Criar a cena do jogo com o personagem do usuário e inimigo determinado pela ordem da fase
        const GameScene = createGameScene(Phaser, faseId, personagemUsuario, trilhaId, enemyId);
        console.log("GameScene criada:", GameScene ? "OK" : "ERRO");

        // Criar configuração do jogo totalmente responsiva
        // Usar dimensões do container ou viewport
        const getGameDimensions = () => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            return {
              width: rect.width || window.innerWidth,
              height: rect.height || window.innerHeight
            };
          }
          return {
            width: window.innerWidth,
            height: window.innerHeight
          };
        };
        
        const { width: gameWidth, height: gameHeight } = getGameDimensions();
        
        console.log("Dimensões do jogo:", gameWidth, "x", gameHeight);
        console.log("Container:", containerRef.current);
        console.log("Container dimensions:", containerRef.current.offsetWidth, "x", containerRef.current.offsetHeight);
        
        const gameConfig: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current,
          backgroundColor: "#2a2a3a",
          width: gameWidth,
          height: gameHeight,
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: gameWidth,
            height: gameHeight,
            resizeInterval: 0, // Atualizar imediatamente no resize
          },
          physics: {
            default: "arcade",
            arcade: { debug: false },
          },
          scene: GameScene,
          render: {
            antialias: true,
            pixelArt: false,
          },
          dom: {
            createContainer: true
          }
        };

        // Criar instância do jogo
        console.log("Criando instância do Phaser Game...");
        console.log("Container antes:", containerRef.current ? "OK" : "NULL");
        console.log("Config - type:", gameConfig.type, "width:", gameConfig.width, "height:", gameConfig.height);
        
        try {
          gameRef.current = new Phaser.Game(gameConfig);
          console.log("Phaser Game criado:", gameRef.current);

          // Verificar se o jogo foi criado corretamente
          if (gameRef.current) {
            console.log("Game criado com sucesso!");
            console.log("Game config:", gameRef.current.config);
            
            // Verificar canvas após um pequeno delay
            setTimeout(() => {
              const canvas = containerRef.current?.querySelector('canvas');
              console.log("Canvas após criação:", canvas);
              if (canvas) {
                console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
                console.log("Canvas style:", canvas.style.cssText);
                // Forçar visibilidade do canvas
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
              } else {
                console.error("Canvas não encontrado!");
              }
            }, 500);
          }
        } catch (gameError) {
          console.error("Erro ao criar Phaser Game:", gameError);
          throw gameError;
        }

        // Aguardar um tempo fixo para o jogo inicializar
        timeoutId = setTimeout(() => {
          console.log("Timeout - ocultando loading após 2s");
          if (isMounted) {
            setIsLoading(false);
          }
        }, 2000);

      } catch (err) {
        console.error("Erro ao carregar Phaser:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar o jogo");
          setIsLoading(false);
        }
      }
    };

    // Função para verificar e inicializar quando o container estiver pronto
    const waitForContainer = () => {
      if (!isMounted) {
        console.log("Componente desmontado, cancelando inicialização");
        setIsLoading(false);
        return;
      }

      if (!containerRef.current) {
        console.log("Container ainda não disponível, tentando novamente...");
        setTimeout(waitForContainer, 100);
        return;
      }

      // Verificar se o container tem dimensões válidas
      const container = containerRef.current;
      if (container.offsetWidth === 0 && container.offsetHeight === 0) {
        console.log("Container sem dimensões, aguardando...");
        setTimeout(waitForContainer, 100);
        return;
      }

      console.log("✅ Container encontrado, iniciando Phaser...");
      console.log("Container dimensions:", container.offsetWidth, "x", container.offsetHeight);
      loadPhaser();
    };

    // Aguardar um pouco para garantir que o container está pronto
    const timer = setTimeout(waitForContainer, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (timeoutId) clearTimeout(timeoutId);
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (err) {
          console.error("Erro ao destruir jogo:", err);
        }
        gameRef.current = null;
      }
    };
  }, [faseId, personagemUsuario, enemyId]);

  return (
    <div 
      className="w-screen h-screen bg-gray-900 overflow-hidden p-0 m-0 relative"
      style={{ 
        width: '100vw', 
        height: '100vh', 
        margin: 0, 
        padding: 0,
        position: 'relative',
        backgroundColor: '#1a1a2a'
      }}
    >
      {/* Container do jogo - sempre renderizado */}
      <div 
        ref={containerRef}
        id="game-container"
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%', 
          margin: 0, 
          padding: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#1a1a2a',
          display: 'block'
        }}
      />
      
      {/* Overlay de loading - aparece por cima */}
      {isLoading && (
        <div 
          className="flex justify-center items-center absolute inset-0 bg-gray-900 bg-opacity-90 z-50"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000
          }}
        >
          <div className="text-white text-center">
            <p className="text-xl font-bold mb-4">Carregando jogo...</p>
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
      
      {/* Overlay de erro - aparece por cima */}
      {error && (
        <div 
          className="flex justify-center items-center absolute inset-0 bg-gray-900 bg-opacity-90 z-50"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1000
          }}
        >
          <div className="text-white text-center p-8">
            <p className="text-xl font-bold mb-2">Erro ao carregar o jogo</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PageWrapper } from "@/app/components/accessibility/PageWrapper";
import { useKeyboardNavigation } from "@/app/hooks/useAccessibility";

// This is a wrapper component to ensure Phaser is only loaded on the client side.
const GameComponent = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const searchParams = useSearchParams();
  useKeyboardNavigation(); // Hook de acessibilidade

  useEffect(() => {
    // Get parameters from the URL
    const faseId = searchParams.get("faseId");
    const trilhaId = searchParams.get("trilhaId");
    const personagemUsuario = searchParams.get("personagem") || undefined;
    const enemyId = searchParams.get("enemyId") || undefined;

    if (!faseId) {
      console.error("faseId is required to start the game.");
      // Optionally, show an error message to the user
      return;
    }

    // Dynamically import Phaser and the scene factory
    import("phaser").then((Phaser) => {
      import("./GameScene").then(({ createGameScene }) => {
        // Ensure the game is not re-initialized
        if (gameRef.current) {
          return;
        }

        // Create the scene class using the factory
        const GameScene = createGameScene(
          Phaser,
          faseId,
          personagemUsuario,
          trilhaId,
          enemyId
        );

        // Phaser game configuration
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: "game-container",
          width: window.innerWidth,
          height: window.innerHeight,
          scene: [GameScene],
          physics: {
            default: "arcade",
            arcade: {
              gravity: { y: 0 },
            },
          },
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
        };

        // Create the game instance
        gameRef.current = new Phaser.Game(config);
      });
    });

    // Cleanup function to destroy the game instance on component unmount
    return () => {
      if (gameRef.current) {
        // The custom 'limparElementosHTML' function seems to handle scene-specific cleanup.
        // Accessing the active scene and calling it directly.
        const scene = gameRef.current.scene.getScene("GameScene") as any;
        if (scene && typeof scene.limparElementosHTML === "function") {
          scene.limparElementosHTML();
        }
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [searchParams]);

  return <div id="game-container" style={{ width: "100%", height: "100vh" }} />;
};


export default function GamePage() {
    return (
        <PageWrapper
            title="Estude.My - Game"
            description="Tela de jogo da plataforma de aprendizado gamificado Estude.My"
        >
            <GameComponent />
        </PageWrapper>
    );
}

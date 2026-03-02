"use client";

import { useEffect, useRef } from "react";

export default function TestGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const testPhaser = async () => {
      try {
        console.log("TESTE: Importando Phaser...");
        const Phaser = await import("phaser");
        console.log("TESTE: Phaser importado:", Phaser.default || Phaser);
        
        if (!containerRef.current) {
          console.error("TESTE: Container não encontrado!");
          return;
        }

        const PhaserLib = Phaser.default || Phaser;
        
        const config = {
          type: PhaserLib.AUTO,
          parent: containerRef.current,
          width: 800,
          height: 600,
          backgroundColor: "#ff0000", // VERMELHO para debug
          scene: {
            create: function() {
              console.log("TESTE: CREATE chamado!");
              this.add.text(400, 300, "TESTE FUNCIONANDO!", {
                fontSize: "48px",
                color: "#ffffff"
              }).setOrigin(0.5);
            }
          }
        };

        console.log("TESTE: Criando jogo...");
        const game = new PhaserLib.Game(config);
        console.log("TESTE: Jogo criado:", game);
      } catch (error) {
        console.error("TESTE: Erro:", error);
      }
    };

    testPhaser();
  }, []);

  return (
    <div className="w-screen h-screen bg-blue-500 flex items-center justify-center">
      <div 
        ref={containerRef}
        className="w-3/4 h-3/4 bg-yellow-500 border-4 border-white"
        style={{ minWidth: '800px', minHeight: '600px' }}
      />
    </div>
  );
}


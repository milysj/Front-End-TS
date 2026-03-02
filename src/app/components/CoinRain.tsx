'use client';

import {useEffect, useState} from "react";
import Image from "next/image";

// ===============================
// Número total de moedas que vão "cair"
// ===============================

const NUM_COINS = 20;

// ===============================
// Componente CoinRain
// ===============================
export default function CoinRain() {
    // Estado para armazenar as moedas geradas
    const [coins, setCoins] = useState<{ id: number; left: number; delay: number }[]>([]);

    // useEffect é usado para gerar as moedas uma vez quando o componente é montado
    useEffect(() => {
        const generatedCoins = Array.from({length: NUM_COINS}, (_, i) => ({
            id: i,                        // id único
            left: Math.random() * 100,    // posição horizontal aleatória em %
            delay: Math.random() * 5,     // atraso aleatório da animação em segundos
        }));
        setCoins(generatedCoins);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
            {/* Renderiza cada moeda */}
            {coins.map((coin) => (
                <div
                    key={coin.id}
                    className="absolute animate-fall" // Classe CSS que anima a queda
                    style={{
                        left: `${coin.left}%`,        // posição horizontal
                        animationDelay: `${coin.delay}s`, // atraso para começar a animação
                    }}
                >
                    <Image
                        src="/img/coin-pixel.png" // imagem da moeda
                        alt="Moeda pixelada"
                        width={32}
                        height={32}
                    />
                </div>
            ))}
        </div>
    );
}

// Configuração de personagens e inimigos do jogo

export interface AttackConfig {
  nome: string;
  custo: number;
  dano: number;
  cor: number;
  gif: string;
}

export interface CharacterConfig {
  id: string;
  nome: string;
  // GIFs de animação
  idleGif: string;
  attackGifs: {
    basic: string; // Ataque básico (quando acerta pergunta)
    special1: string; // Ataque especial 1
    special2: string; // Ataque especial 2
  };
  // Estatísticas
  hpMax: number;
  manaMax: number;
  // Ataques especiais
  ataques: AttackConfig[];
  // Escala do personagem
  escala: number;
}

export interface EnemyConfig {
  id: string;
  nome: string;
  // Caminho base para os GIFs (opcional, padrão: castelo/{id})
  path?: string;
  // GIFs de animação
  idleGif: string;
  attackGifs: {
    attack1: string; // Ataque 1 (aleatório)
    attack2: string; // Ataque 2 (aleatório)
    attack3: string; // Ataque 3 (aleatório)
  };
  // Estatísticas
  hpMax: number;
  manaMax: number;
  // Escala do inimigo
  escala: number;
}

// Configuração de personagens jogáveis
export const CHARACTERS: Record<string, CharacterConfig> = {
  samurai: {
    id: "samurai",
    nome: "Samurai",
    idleGif: "/assests/samurai/samurai_Idle.gif",
    attackGifs: {
      basic: "samurai_Golpe_1 .gif",
      special1: "samurai_Golpe_2 .gif",
      special2: "samurai_Full .gif"
    },
    hpMax: 100,
    manaMax: 100,
    ataques: [
      { nome: "Ataque Corte", custo: 2, dano: 30, cor: 0xff4444, gif: "samurai_Golpe_2 .gif" }, // 2 barras de especial
      { nome: "Ataque Fúria", custo: 5, dano: 40, cor: 0xff44ff, gif: "samurai_Full .gif" } // 5 barras de especial
    ],
    escala: 1.3
  }
};

// Configuração de inimigos
export const ENEMIES: Record<string, EnemyConfig> = {
  spectre: {
    id: "spectre",
    nome: "Spectre",
    idleGif: "/assests/castelo/spectre/Spectre_Parado.gif",
    attackGifs: {
      attack1: "SpectreFull.gif",
      attack2: "Spectre_Golpe_1.gif",
      attack3: "Spectre_Golpe_2.gif"
    },
    hpMax: 300,
    manaMax: 200,
    escala: 1.3
  },
  arqueira: {
    id: "arqueira",
    nome: "Arqueira",
    path: "castelo/Arqueira/Arqueira",
    idleGif: "/assests/castelo/Arqueira/Arqueira/Arqueira Parada.gif",
    attackGifs: {
      attack1: "Arqueira Full.gif",
      attack2: "Arqueira Golpe 1.gif",
      attack3: "Arqueira Golpe 2.gif"
    },
    hpMax: 250,
    manaMax: 200,
    escala: 1.3
  },
  cavaleiroDecaido: {
    id: "cavaleiroDecaido",
    nome: "Cavaleiro Decaído",
    path: "castelo/Cavaleiro Decaido/Cavaleiro Decaido",
    idleGif: "/assests/castelo/Cavaleiro Decaido/Cavaleiro Decaido/Cavaleiro Decadente Parado.gif",
    attackGifs: {
      attack1: "Cavaleiro Decadente Full.gif",
      attack2: "Cavaleiro Decadente Golpe 1.gif",
      attack3: "Cavaleiro Decadente Golpe 2.gif"
    },
    hpMax: 400,
    manaMax: 100,
    escala: 2.2
  },
  magoCorrompido: {
    id: "magoCorrompido",
    nome: "Mago Corrompido",
    path: "castelo/Mago Corrompido/Mago Corrompido",
    idleGif: "/assests/castelo/Mago Corrompido/Mago Corrompido/Mago Corrompido Parado.gif",
    attackGifs: {
      attack1: "Mago Corrompido Full.gif",
      attack2: "Mago Corrompido Golpe 1.gif",
      attack3: "Mago Corrompido Golpe 2.gif"
    },
    hpMax: 200,
    manaMax: 400,
    escala: 1.3
  }
};

// Função auxiliar para obter configuração de personagem
export function getCharacterConfig(characterId: string): CharacterConfig {
  return CHARACTERS[characterId] || CHARACTERS.samurai; // Fallback para samurai
}

// Função auxiliar para obter configuração de inimigo
export function getEnemyConfig(enemyId: string): EnemyConfig {
  return ENEMIES[enemyId] || ENEMIES.spectre; // Fallback para spectre
}

// Função para obter GIF de ataque aleatório do inimigo
export function getRandomEnemyAttack(enemyId: string): string {
  const enemy = getEnemyConfig(enemyId);
  const attacks = [
    enemy.attackGifs.attack1,
    enemy.attackGifs.attack2,
    enemy.attackGifs.attack3
  ];
  return attacks[Math.floor(Math.random() * attacks.length)];
}


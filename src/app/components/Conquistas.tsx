import Image from "next/image";

// ===============================
// Componente de Conquistas
// ===============================
export default function Conquistas() {
    // ===============================
    // Dados das conquistas
    // ===============================
    const totalAchievements = 37;        // Total de conquistas disponíveis
    const unlockedAchievements = 37;     // Conquistas desbloqueadas pelo usuário
    const percentage = (unlockedAchievements / totalAchievements) * 100; // Progresso em %

    // const placeholderImage = "/e880cc04-498a-4b80-a79e-9cc87ed73f16.png"; // imagem placeholder (não usada neste caso)

    return (
        <div className="bg-gray-800 text-white p-4 rounded-xl w-[400px] mx-auto mt-4 shadow-lg">
            {/* Título da seção */}
            <h2 className="text-sm text-gray-400 uppercase">Conquistas</h2>

            {/* Resumo do progresso */}
            <div className="flex items-center mt-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"/>
                {/* Indicador visual */}
                <p className="text-sm">
                    Você alcançou todas as {totalAchievements} conquistas! <span className="text-gray-400">(100%)</span>
                </p>
            </div>

            {/* Barra de progresso */}
            <div className="bg-blue-500 h-2 rounded-full mt-2">
                <div
                    className="bg-blue-300 h-2 rounded-full"
                    style={{width: `${percentage}%`}} // Largura proporcional ao progresso
                />
            </div>

            {/* Categoria de conquista */}
            <div className="mt-4">
                <h3 className="text-white font-semibold">Geografia</h3>
                <p className="text-gray-400 text-sm">Obtenha todas as outras conquistas</p>
            </div>

            {/* Lista de conquistas */}
            <div className="mt-3 flex gap-2 items-center flex-wrap">
                {Array.from({length: 6}).map((_, index) => (
                    <div
                        key={index}
                        className="w-10 h-10 bg-black border border-yellow-400 rounded overflow-hidden"
                    >
                        <Image
                            src="/img/trofeu.png"
                            alt={`Conquista ${index + 1}`}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                        />
                    </div>
                ))}
                {/* Indicador de conquistas restantes */}
                <span className="text-gray-300 text-sm">+31</span>
            </div>

            {/* Botão para ver todas as conquistas */}
            <div className="mt-2 text-right">
                <button className="text-sm text-gray-400 hover:text-white underline">
                    Ver as minhas conquistas
                </button>
            </div>
        </div>
    );
}


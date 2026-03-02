'use client'
import Image from "next/image";
import {Star} from "lucide-react";

// Componente de cartão de progresso de curso
export default function Progresso() {
    return (
      <div className="w-[300px] mx-auto mt-4 bg-white rounded-xl shadow-md overflow-hidden border">
        {/* Imagem do curso */}
        <div className="mb-6 flex justify-center">
          <Image
            width={100}
            height={100}
            src="/img/ConsultAi.png"
            alt="Imagem do curso" // Ocupa todo o container
            objectFit="cover" // Mantém proporção e cobre toda área
          />
          {/* Botão de opções */}
          <div className="absolute top-2 right-2 text-black bg-white rounded-full w-6 h-6 flex items-center justify-center shadow">
            <span>⋮</span>
          </div>
        </div>

        <div className="p-3">
          {/* Título e autor do curso */}
          <h3 className="font-semibold text-gray-800 text-base leading-tight">
            Algoritmos e Lógica de Programação - O Curso...
          </h3>
          <p className="text-sm text-gray-500 mt-1">Nelio Alves</p>

          {/* Barra de progresso */}
          <div className="mt-3">
            <div className="h-1 bg-purple-200 rounded-full">
              <div
                className="h-1 bg-purple-600 rounded-full"
                style={{ width: "68%" }}
              />
            </div>

            {/* Percentual concluído e avaliação em estrelas */}
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>68% concluído</span>
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </span>
            </div>

            {/* Mensagem para avaliação */}
            <p className="text-sm text-center text-gray-400 mt-1">
              Deixe uma classificação
            </p>
          </div>
        </div>
      </div>
    );
}

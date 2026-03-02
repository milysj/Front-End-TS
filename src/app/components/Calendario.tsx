'use client';

import React, {useState, useEffect} from 'react';
import FullCalendar from '@fullcalendar/react'; // Componente principal do calendário
import dayGridPlugin from '@fullcalendar/daygrid'; // Exibe visualização em grade de dias (mês)
import interactionPlugin from '@fullcalendar/interaction'; // Permite interação com o calendário (click nos dias/eventos)
import {format} from 'date-fns'; // Biblioteca para formatar datas

const CalendarPage = () => {
    // ===============================
    // Estado para armazenar eventos
    // ===============================
    interface CalendarEvent {
        title: string;
        date: string;
    }
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // ===============================
    // Efeito para buscar eventos da API
    // ===============================
    useEffect(() => {
        // Requisição para a API que retorna eventos
            // fetch('http://localhost:3000/api/events')
            //     .then((response) => response.json())
            //     .then((data) => {
            //         // Formata os eventos para o FullCalendar
            //         interface ApiEvent {
            //             title: string;
            //             date: string;
            //         }

            //         interface CalendarEvent {
            //             title: string;
            //             date: string;
            //         }

            //         const formattedEvents: CalendarEvent[] = (data as ApiEvent[]).map((event: ApiEvent) => ({
            //             title: event.title,
            //             date: format(new Date(event.date), 'yyyy-MM-dd') // FullCalendar exige data neste formato
            //         }));
            //         setEvents(formattedEvents); // Atualiza estado
            //     })
            //     .catch((error) => console.error('Erro ao carregar eventos:', error));

        // ===============================
        // Evento de teste adicionado manualmente
        // ===============================
        const formattedEvents = [{
            title: "Teste",
            date: "2025-04-24" // Formato aceito pelo FullCalendar
        }]
        setEvents(formattedEvents);
    }, []); // Executa apenas uma vez ao montar o componente

    return (
        <div className="container mx-auto p-8 bg-white max-w-9/12">
            {/* Título do calendário */}
            <h1 className="text-3xl font-bold mb-4 text-center">Calendário de Eventos</h1>

            {/* Componente FullCalendar */}
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]} // Plugins para exibição e interação
                initialView="dayGridMonth" // Visualização inicial: mês
                events={events} // Lista de eventos do estado
                eventClick={(info) => alert(`Evento: ${info.event.title} em ${info.event.start ? info.event.start.toLocaleString() : 'Data desconhecida'}`)} // Ação ao clicar em evento
                headerToolbar={{ // Configuração da barra de navegação do calendário
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek,dayGridDay',
                }}
            />
        </div>
    );
};

export default CalendarPage;

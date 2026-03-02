"use client";
import Image from "next/image";
import React, {useState} from "react";

// Dados simulados de notificações
const notifications = [
    {id: 1, to: "João", time: "12:48:27 PM"},
    {id: 2, to: "João", time: "12:48:20 PM"},
    {id: 3, to: "João", time: "12:43:42 PM"},
    {id: 4, to: "João", time: "12:43:37 PM"},
    {id: 5, to: "João", time: "12:43:34 PM"},
];

// Dados simulados de eventos
const events = [
    {id: 1, title: "System Maintenance", description: "Scheduled at 10 PM"},
    {id: 2, title: "User Login", description: "Emma logged in from mobile"},
];

// Componente principal de notificações e eventos
export default function App() {
    const [tab, setTab] = useState("notifications"); // Estado para alternar entre "notifications" e "events"

    return (
    <div className="flex items-center justify-center p-4 m-auto">
        {/* ===============================
          Card principal da conta
          =============================== */}
        <div className="bg-white p-6 rounded shadow-md w-full mx-auto">
            <div className="flex justify-around border-b border-gray-300 mb-2">
                <button
                    onClick={() => setTab("notifications")}
                    className={`w-1/2 py-2 text-center ${
                        tab === "notifications" ? "border-b-2 border-black font-bold" : ""
                    }`}
                >
                    Notifications
                </button>
                <button
                    onClick={() => setTab("events")}
                    className={`w-1/2 py-2 text-center ${
                        tab === "events" ? "border-b-2 border-black font-bold" : ""
                    }`}
                >
                    Events
                </button>
            </div>

            {/* Lista de notificações */}
            {tab === "notifications" && (
                <div className="space-y-2">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="bg-gray-100 p-3 rounded shadow flex items-start gap-3"
                        >
                            {/* Avatar da notificação */}
                            <Image
                                width={40}
                                height={40}
                                src='/img/personagem.png'
                                alt="avatar"
                                className="rounded-full w-10 h-10"
                            />
                            <div className="flex-1">
                                <div className="font-bold">João</div>
                                <div className="text-sm text-gray-600">To: {notif.to}</div>
                                <div className="font-semibold mt-1">Test Notification</div>
                                <div className="text-sm">Esta é uma mensagem de teste.</div>
                            </div>
                            {/* Indicação de novo e horário */}
                            <div className="flex flex-col items-end text-xs text-gray-500">
                                <div className="w-2 h-2 bg-red-600 rounded-full mb-1"></div>
                                <div>{notif.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lista de eventos */}
            {tab === "events" && (
                <div className="space-y-2">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-blue-100 p-3 rounded shadow"
                        >
                            <div className="font-bold">{event.title}</div>
                            <div className="text-sm text-gray-700">{event.description}</div>
                        </div>
                    ))}
                </div>
            )}
            </div>
            </div>
    );
}

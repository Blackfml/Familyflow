/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Send, Users, MessageSquare, Clock, Smile } from "lucide-react";
import { FamilyState, GroupMessage } from "../types";

interface FamilyChatViewProps {
  state: FamilyState;
  currentUser: string;
  onSendGroupMessage: (content: string) => Promise<void>;
  chatLoading?: boolean;
}

export default function FamilyChatView({
  state,
  currentUser,
  onSendGroupMessage,
  chatLoading = false
}: FamilyChatViewProps) {
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = state.groupChat || [];
  const users = Object.values(state.users);

  // Quick conversation starters
  const starters = [
    "Quem vai fazer as compras de hoje? 🛒",
    "Pode me dar uma mãozinha aqui? 🙋‍♂️",
    "Meta de hoje cumprida! Orgulho do casal! ❤️",
    "Já terminou as suas tarefas de hoje? 📝",
    "Que horas vamos almoçar/jantar? 🍕"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || chatLoading) return;
    const msg = userInput;
    setUserInput("");
    await onSendGroupMessage(msg);
  };

  const handleStarterClick = async (text: string) => {
    if (chatLoading) return;
    await onSendGroupMessage(text);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  return (
    <div id="family-chat-section" className="flex flex-col h-[calc(100vh-140px)] max-h-[700px] relative">
      
      {/* Top Bar with active family members */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-t-3xl flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Chat do Casal & Família
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Converse e faça perguntas em tempo real
            </p>
          </div>
        </div>

        {/* List of family members */}
        <div className="flex -space-x-2 overflow-hidden items-center">
          {users.map((u) => (
            <div key={u.id} className="relative group">
              <img
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                src={u.avatar}
                alt={u.name}
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
            </div>
          ))}
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 ml-3 uppercase tracking-wider">
            {users.length} {users.length === 1 ? "ativo" : "ativos"}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30 p-4 space-y-4 border-x border-slate-200 dark:border-slate-800 min-h-0">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Nenhuma mensagem por aqui ainda.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs leading-normal">
              Mande uma mensagem ou escolha um dos atalhos abaixo para iniciar o papo e se organizar com seu par!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser;
            const senderProfile = state.users[msg.sender];
            const senderAvatar = senderProfile?.avatar;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                {!isMe && (
                  senderAvatar ? (
                    <img
                      src={senderAvatar}
                      alt={msg.sender}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-900">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )
                )}

                {/* Bubble Container */}
                <div className={`space-y-1 ${isMe ? "text-right" : "text-left"}`}>
                  {/* Sender Name */}
                  {!isMe && (
                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 px-1">
                      {msg.sender}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    className={`p-3 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none dark:bg-indigo-600"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Time */}
                  <div className={`flex items-center gap-1 text-[8.5px] text-slate-400 dark:text-slate-500 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Starters Carousel (Quick Taps) */}
      <div className="bg-slate-50/50 dark:bg-slate-950/30 border-x border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shrink-0 mr-1">
          Rápido ⚡
        </span>
        {starters.map((starter, i) => (
          <button
            key={i}
            onClick={() => handleStarterClick(starter)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300 transition active:scale-95 cursor-pointer shadow-sm"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-b-3xl shadow-sm shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={chatLoading}
            placeholder={`Conversar como ${currentUser}...`}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 rounded-2xl px-4 py-3 text-xs outline-none transition text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || chatLoading}
            className="px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-2xl flex items-center justify-center transition active:scale-95 shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

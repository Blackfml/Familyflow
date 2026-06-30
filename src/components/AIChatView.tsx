/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { FamilyState, ChatMessage } from "../types";
import AIModeSelector from "./AIModeSelector";
import { api } from "../services/api";
import VirtualList from "./ui/VirtualList";
type AIMode = "correria" | "foco" | "familia";

interface AIChatViewProps {
  state: FamilyState;
  onSendChatMessage: (message: string) => Promise<string>;
  onReorganizeAI: () => Promise<string>;
  onAnalyzeWorkloadAI: () => Promise<string>;
  onWeeklyMeetingAI: () => Promise<string>;
  chatLoading: boolean;
  onClearChatHistory?: () => void;
}

export default function AIChatView({
  state,
  onSendChatMessage,
  onReorganizeAI,
  onAnalyzeWorkloadAI,
  onWeeklyMeetingAI,
  chatLoading,
  onClearChatHistory
}: AIChatViewProps) {
  const [userInput, setUserInput] = useState("");
  const [aiMode, setAiMode] = useState<AIMode>("familia");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quick action options exactly as in the mockup
  const suggestions = [
    { 
      title: "Organize meu dia", 
      subtitle: "Planejamento inteligente", 
      icon: "calendar_today", 
      color: "text-brand-success",
      prompt: "Por favor, organize as tarefas do meu dia de forma otimizada."
    },
    { 
      title: "Quem está sobrecarregado?", 
      subtitle: "Análise de carga de trabalho", 
      icon: "scale", 
      color: "text-blue-400",
      prompt: "Quem está mais sobrecarregado hoje? Faça uma análise da carga de trabalho."
    },
    { 
      title: "Quais tarefas estão atrasadas?", 
      subtitle: "Ver todas as pendências", 
      icon: "warning", 
      color: "text-brand-danger",
      prompt: "Quais tarefas estão atrasadas na nossa organização familiar?"
    },
    { 
      title: "Monte um plano para amanhã", 
      subtitle: "Preparar agenda do casal", 
      icon: "auto_awesome", 
      color: "text-brand-purple",
      prompt: "Monte um plano de organização para o dia de amanhã."
    }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, chatLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || chatLoading) return;
    const tempInput = userInput;
    setUserInput("");
    await onSendChatMessage(tempInput);
  };

  const handleSuggestionClick = async (promptText: string) => {
    if (chatLoading) return;
    await onSendChatMessage(promptText);
  };

  // Robust inline markdown parser helper
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      // Bold text parser
      const parseBold = (text: string) => {
        const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
        return parts.map((part, i) => {
          if (i % 2 === 1) {
            return <strong key={i} className="font-extrabold text-brand-purple bg-brand-purple/10 px-1 rounded">{part}</strong>;
          }
          return part;
        });
      };

      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-xs font-bold text-brand-purple mt-3 mb-1 uppercase tracking-wider">{parseBold(trimmed.replace("###", "").trim())}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-sm font-extrabold text-brand-primary mt-4 mb-2 border-b border-slate-800 pb-1">{parseBold(trimmed.replace("##", "").trim())}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-md font-black text-white mt-4 mb-2">{parseBold(trimmed.replace("#", "").trim())}</h2>;
      }

      // Bullet lists
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-[11px] leading-relaxed my-1">
            {parseBold(trimmed.substring(1).trim())}
          </li>
        );
      }

      // Plain paragraph
      return (
        <p key={idx} className="text-[11px] leading-relaxed text-slate-300 my-1 whitespace-pre-wrap">
          {parseBold(trimmed)}
        </p>
      );
    });
  };

  useEffect(() => {
    api.get<{ mode: AIMode }>("/gemini/mode").then(r => setAiMode(r.mode)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[700px] relative">
      
      <AIModeSelector currentMode={aiMode} onModeChange={setAiMode} />

      {/* Header controls with title and clean history trigger */}
      <div className="flex justify-between items-center shrink-0 pb-3 border-b border-slate-800/40 mb-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            IA FamilyFlow
          </h2>
        </div>
        {onClearChatHistory && state.chatHistory.length > 0 && (
          <button 
            onClick={onClearChatHistory}
            className="text-[11px] text-slate-500 hover:text-slate-350 flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
            title="Limpar histórico"
          >
            <span className="material-symbols-rounded text-[14px]">history</span> Limpar
          </button>
        )}
      </div>

      {/* Main message pane */}
      <div className="flex-1 overflow-y-auto p-4 bg-brand-bg/50 border border-slate-800/40 rounded-3xl space-y-5 min-h-[200px] mb-4">
        
        {/* Empty state visual layout - Matches mockup exactly */}
        {state.chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-5 animate-in fade-in duration-500">
            {/* Concentric glossy robot rings */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-brand-purple/10 animate-ping duration-1000" />
              <div className="absolute w-24 h-24 rounded-full border border-brand-purple/20 flex items-center justify-center">
                <div className="w-18 h-18 rounded-full bg-brand-purple/10 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
                  <span className="material-symbols-rounded text-[40px]">smart_toy</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-bold text-white">Como posso ajudar?</h3>
              <p className="text-[11px] text-slate-400 mt-2 max-w-[240px] leading-relaxed">
                Eu analiso sua rotina e organizo o melhor para vocês.
              </p>
            </div>
          </div>
        )}

        {/* Existing messages render */}
        <VirtualList
          items={state.chatHistory}
          itemHeight={120}
          overscan={3}
          className="flex-1"
          emptyMessage=""
          renderItem={(msg: ChatMessage) => {
          const isModel = msg.role === "model";
          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"} mb-5`}
            >
              {/* Profile Icon Avatar */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                isModel 
                  ? "bg-brand-purple/10 border border-brand-purple/30 text-brand-purple" 
                  : "bg-brand-primary text-white"
              }`}>
                <span className="material-symbols-rounded text-[16px]">
                  {isModel ? "smart_toy" : "person"}
                </span>
              </div>

              {/* Message text block */}
              <div className={`p-4 rounded-2xl text-[11.5px] leading-relaxed ${
                isModel 
                  ? "bg-brand-card border border-slate-800 text-slate-200" 
                  : "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
              }`}>
                {isModel ? (
                  <div className="space-y-1">
                    {renderFormattedContent(msg.content)}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <span className="text-[8px] opacity-50 block mt-1.5 text-right font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
          }}
        />

        {/* Gemini thinking loader */}
        {chatLoading && (
          <div className="flex items-start gap-3 max-w-[85%] mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple shrink-0">
              <span className="material-symbols-rounded text-[16px]">smart_toy</span>
            </div>
            <div className="p-4 rounded-2xl bg-brand-card border border-slate-800/80 w-64 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[10.5px] text-brand-purple font-extrabold uppercase tracking-wider">
                <span className="material-symbols-rounded text-[14px] animate-spin">progress_activity</span>
                Pensando...
              </div>
              <div className="h-2 bg-slate-800 rounded-full w-full animate-pulse" />
              <div className="h-2 bg-slate-800 rounded-full w-5/6 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* QUICK SUGGESTIONS LIST - ONLY IF NO PREVIOUS HISTORY / AT INITIAL TURN */}
      {state.chatHistory.length === 0 && !chatLoading && (
        <div className="grid grid-cols-1 gap-2.5 mb-4 shrink-0 max-h-[180px] overflow-y-auto pr-1">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(s.prompt)}
              className="p-3 text-left rounded-2xl border border-slate-800 hover:border-slate-700 bg-brand-card hover:bg-slate-900 flex items-center justify-between gap-3 transition cursor-pointer active:scale-98 group"
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-rounded text-[18px] ${s.color}`}>
                  {s.icon}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-brand-primary transition">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.subtitle}</p>
                </div>
              </div>
              <span className="material-symbols-rounded text-slate-600 text-[16px] group-hover:translate-x-0.5 transition">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      )}

      {/* FOOTER MESSAGE FIELD - ChatGPT design */}
      <form onSubmit={handleSubmit} className="flex gap-2 shrink-0 pt-1">
        <div className="flex-1 flex items-center gap-2 bg-brand-card border border-slate-800 rounded-2xl px-4 py-1">
          {/* Quick icon prefix */}
          <span className="material-symbols-rounded text-slate-500 text-[18px]">keyboard</span>
          
          <input 
            type="text" 
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={chatLoading}
            className="flex-1 py-3 text-xs bg-transparent text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          {/* Quick mic asset icon (visual mockup only) */}
          <span className="material-symbols-rounded text-slate-500 text-[18px] cursor-pointer hover:text-slate-350">
            mic
          </span>
        </div>

        <button 
          id="send-ai-chat-btn"
          type="submit"
          disabled={!userInput.trim() || chatLoading}
          className="w-12 h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
        </button>
      </form>

    </div>
  );
}

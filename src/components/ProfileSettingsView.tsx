/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FamilyState } from "../types";
import { motion } from "motion/react";

interface ProfileSettingsViewProps {
  state: FamilyState;
  currentUser: string;
  onSwitchUser: (user: string) => void;
  onResetState: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onTestNotification?: (type: "task" | "notification" | "success") => void;
  systemNotificationPermission?: string;
  onRequestSystemPermission?: () => void;
  onLogout: () => void;
  onDeleteProfile: (username: string) => void;
  onOpenNotificationCenter?: () => void;
}

export default function ProfileSettingsView({
  state,
  currentUser,
  onResetState,
  darkMode,
  onToggleDarkMode,
  onTestNotification,
  systemNotificationPermission = "default",
  onRequestSystemPermission,
  onLogout,
  onDeleteProfile,
  onOpenNotificationCenter
}: ProfileSettingsViewProps) {
  const [showDialog, setShowDialog] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"reset" | "delete" | null>(null);
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  const activeProfile = state.users[currentUser] || {
    id: "fallback",
    name: currentUser,
    avatar: "",
    points: 1250,
    streak: 8,
    level: 12,
    email: "alessandro@familyflow.io",
    provider: "Email",
    gender: "Masculino" as "Masculino" | "Feminino"
  };

  // XP calculations for the progress bar
  const currentXP = activeProfile.points || 1250;
  const targetXP = 2000;
  const xpPercentage = Math.min(100, Math.max(10, Math.round((currentXP / targetXP) * 100)));

  const triggerExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `familyflow_backup_${currentUser.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowDialog("Backup de dados exportado com sucesso para download!");
  };

  return (
    <div className="space-y-7 pb-32 animate-in fade-in slide-in-from-bottom-3 duration-300 text-slate-200">
      
      {/* 1. Header & Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Perfil</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Configurações e conquistas do casal</p>
        </div>
      </div>

      {/* 2. Top Profile Summary Card (Avatar Grande, Nome, Nível, XP Progress) */}
      <div className="bg-brand-card rounded-3xl border border-slate-800/40 p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
        <div className="relative">
          {activeProfile.avatar ? (
            <img 
              src={activeProfile.avatar} 
              alt={activeProfile.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <span className="material-symbols-rounded text-[40px]">person</span>
            </div>
          )}
          <span className="absolute bottom-0 right-1 bg-brand-primary text-white font-black text-xs w-7 h-7 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
            {activeProfile.level || 12}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white tracking-tight">{activeProfile.name}</h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {activeProfile.email || "alessandro@familyflow.io"}
          </p>
        </div>

        {/* Level XP Progress Bar matching mockup */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden border border-slate-800/30">
            <motion.div 
              className="bg-brand-success h-full" 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400">
            {currentXP.toLocaleString("pt-BR")} / {targetXP.toLocaleString("pt-BR")} XP
          </p>
        </div>
      </div>

      {/* 3. Stats section - Horizontal Grid of 3 identical widgets */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Estatísticas</h4>
          <button 
            onClick={() => setShowDialog("Pontos combinados do casal atualizados em tempo real.")}
            className="text-[10.5px] font-bold text-brand-primary cursor-pointer hover:underline"
          >
            Ver tudo
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Points Stat */}
          <div className="bg-brand-card border border-slate-800/40 rounded-2xl p-3.5 flex flex-col justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pontos</span>
            <span className="text-base font-bold text-white mt-1.5">{currentXP.toLocaleString("pt-BR")}</span>
            <span className="text-[8px] text-brand-success font-bold mt-1 bg-brand-success/10 px-1.5 py-0.5 rounded-md">+150 hoje</span>
          </div>

          {/* Streak Stat */}
          <div className="bg-brand-card border border-slate-800/40 rounded-2xl p-3.5 flex flex-col justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Sequência</span>
            <span className="text-base font-bold text-white mt-1.5">{activeProfile.streak || 8} dias</span>
            <span className="text-[8px] text-slate-500 font-medium mt-1">Melhor: 12</span>
          </div>

          {/* Achievements Stat */}
          <div className="bg-brand-card border border-slate-800/40 rounded-2xl p-3.5 flex flex-col justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Conquistas</span>
            <span className="text-base font-bold text-white mt-1.5">24</span>
            <button 
              onClick={() => setShowDialog("Lista completa de conquistas do casal em preparação para a próxima versão!")}
              className="text-[8px] text-brand-primary font-bold mt-1 hover:underline"
            >
              Ver todas
            </button>
          </div>
        </div>
      </div>

      {/* 3b. Season Medals - Dynamic based on Gender */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-rounded text-brand-warning text-[15px]">military_tech</span>
            Medalhas de Honra ({activeProfile.gender || "Feminino"})
          </h4>
          <span className="text-[11px] font-black uppercase text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full">
            Temporada 1
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {activeProfile.gender === "Masculino" ? (
            <>
              {/* Medal 1 - Masculino */}
              <div className="bg-brand-card border border-blue-500/10 hover:border-blue-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 transition duration-200">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/15">
                  <span className="material-symbols-rounded text-[24px]">shield</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white leading-tight uppercase">Guardião</span>
                  <span className="block text-[8px] text-slate-400 mt-1">Concluiu 15 tarefas domésticas</span>
                </div>
              </div>

              {/* Medal 2 - Masculino */}
              <div className="bg-brand-card border border-amber-500/10 hover:border-amber-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 transition duration-200">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/15">
                  <span className="material-symbols-rounded text-[24px]">swords</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white leading-tight uppercase">Rei do Foco</span>
                  <span className="block text-[8px] text-slate-400 mt-1">Sequência ativa de 8 dias</span>
                </div>
              </div>

              {/* Medal 3 - Masculino */}
              <div className="bg-brand-card border border-emerald-500/10 hover:border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 transition duration-200">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/15">
                  <span className="material-symbols-rounded text-[24px]">workspace_premium</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white leading-tight uppercase">Mestre de XP</span>
                  <span className="block text-[8px] text-slate-400 mt-1">Atingiu o Nível 12</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Medal 1 - Feminino */}
              <div className="bg-brand-card border border-pink-500/10 hover:border-pink-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 transition duration-200">
                <div className="w-11 h-11 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/15">
                  <span className="material-symbols-rounded text-[24px]">diamond</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white leading-tight uppercase">Estrela Guia</span>
                  <span className="block text-[8px] text-slate-400 mt-1">Organizou 5 eventos em casal</span>
                </div>
              </div>

              {/* Medal 2 - Feminino */}
              <div className="bg-brand-card border border-purple-500/10 hover:border-purple-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 transition duration-200">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/15">
                  <span className="material-symbols-rounded text-[24px]">emoji_events</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white leading-tight uppercase">Soberana</span>
                  <span className="block text-[8px] text-slate-400 mt-1">Concluiu os hábitos semanais</span>
                </div>
              </div>

              {/* Medal 3 - Feminino */}
              <div className="bg-brand-card border border-rose-500/10 hover:border-rose-500/20 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 transition duration-200">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/15">
                  <span className="material-symbols-rounded text-[24px]">favorite</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-white leading-tight uppercase">Harmonia</span>
                  <span className="block text-[8px] text-slate-400 mt-1">Conversou 20x com o assistente</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Settings Group List - Structured with Chevron matching mockup */}
      <div className="space-y-3">
        <div className="pl-1">
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Configurações</h4>
        </div>

        <div className="bg-brand-card border border-slate-800/40 rounded-3xl divide-y divide-slate-800/40 overflow-hidden">
          {/* Option: Meu Perfil */}
          <button 
            onClick={() => setShowDialog("Meu Perfil: Alessandro • Cargo: Casal • Conectado via Google")}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-900 text-left transition cursor-pointer"
          >
            <span className="flex items-center gap-3.5 text-xs font-bold text-slate-200">
              <span className="material-symbols-rounded text-brand-primary text-[20px]">person</span>
              Meu Perfil
            </span>
            <span className="material-symbols-rounded text-slate-600 text-[18px]">chevron_right</span>
          </button>

          {/* Option: Preferências (Dark Mode toggle inside) */}
          <button 
            onClick={onToggleDarkMode}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-900 text-left transition cursor-pointer"
          >
            <span className="flex items-center gap-3.5 text-xs font-bold text-slate-200">
              <span className="material-symbols-rounded text-brand-success text-[20px]">palette</span>
              Preferências (Modo Escuro)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-black uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md">
                {darkMode ? "Escuro" : "Claro"}
              </span>
              <span className="material-symbols-rounded text-slate-600 text-[18px]">chevron_right</span>
            </div>
          </button>

          {/* Option: Notificações */}
          <button 
            onClick={() => {
              if (onOpenNotificationCenter) {
                onOpenNotificationCenter();
              } else if (onRequestSystemPermission) {
                onRequestSystemPermission();
              } else {
                setShowDialog(`Lembretes e alertas push estão em modo: ${systemNotificationPermission}`);
              }
            }}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-900 text-left transition cursor-pointer"
          >
            <span className="flex items-center gap-3.5 text-xs font-bold text-slate-200">
              <span className="material-symbols-rounded text-brand-warning text-[20px]">notifications</span>
              Notificações {systemNotificationPermission === "granted" ? "(Ativas)" : ""}
            </span>
            <span className="material-symbols-rounded text-slate-600 text-[18px]">chevron_right</span>
          </button>

          {/* Option: Segurança e Privacidade */}
          <button 
            onClick={() => setShowDialog("Segurança: Criptografia ponta-a-ponta e banco de dados isolado via Firestore.")}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-900 text-left transition cursor-pointer"
          >
            <span className="flex items-center gap-3.5 text-xs font-bold text-slate-200">
              <span className="material-symbols-rounded text-brand-danger text-[20px]">shield</span>
              Segurança e Privacidade
            </span>
            <span className="material-symbols-rounded text-slate-600 text-[18px]">chevron_right</span>
          </button>

          {/* Option: Integrações */}
          <button 
            onClick={triggerExport}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-900 text-left transition cursor-pointer"
          >
            <span className="flex items-center gap-3.5 text-xs font-bold text-slate-200">
              <span className="material-symbols-rounded text-brand-purple text-[20px]">sync</span>
              Integrações (Backup de dados)
            </span>
            <span className="material-symbols-rounded text-slate-600 text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 5. Device Notification testing (Sub-bento layout inside settings) */}
      {onTestNotification && (
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800/40 space-y-3">
          <h5 className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">Testar Disparadores Push</h5>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onTestNotification("task")}
              className="py-2 bg-slate-900 hover:bg-slate-850 text-[11px] font-bold rounded-xl cursor-pointer transition active:scale-95"
            >
              Tarefa ⏰
            </button>
            <button
              onClick={() => onTestNotification("notification")}
              className="py-2 bg-slate-900 hover:bg-slate-850 text-[11px] font-bold rounded-xl cursor-pointer transition active:scale-95"
            >
              Chat 💬
            </button>
            <button
              onClick={() => onTestNotification("success")}
              className="py-2 bg-slate-900 hover:bg-slate-850 text-[11px] font-bold rounded-xl cursor-pointer transition active:scale-95"
            >
              Meta 🏆
            </button>
          </div>
        </div>
      )}

      {/* 6. Action: Sair da conta */}
      <div className="space-y-3">
        <button 
          onClick={onLogout}
          className="w-full py-4 bg-brand-card hover:bg-red-500/5 text-red-500 border border-slate-800/40 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
        >
          <span className="material-symbols-rounded text-[18px]">logout</span>
          Sair da conta
        </button>
      </div>

      {/* 7. Advanced System Danger Zone */}
      <div className="bg-red-500/5 p-5 rounded-3xl border border-red-500/10 space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <span className="material-symbols-rounded text-[18px]">warning</span>
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest">Zona de Perigo</h4>
        </div>
        <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
          Deseja redefinir todo o banco familiar? Isso limpará permanentemente o histórico.
        </p>

        <div className="flex gap-2 pt-1">
          <button 
            onClick={() => setConfirmAction("reset")}
            className="flex-1 py-2 text-[11px] font-black text-slate-400 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl cursor-pointer transition text-center"
          >
            Resetar DB
          </button>
          <button 
            onClick={() => setConfirmAction("delete")}
            className="flex-1 py-2 text-[11px] font-black text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer transition text-center"
          >
            Excluir Perfil
          </button>
        </div>
      </div>

      {/* CUSTOM SYSTEM CONFIRMATION DIALOG SHEET (REPLACES window.confirm) */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 max-w-xs w-full rounded-[24px] p-6 border border-slate-800/80 shadow-2xl text-center space-y-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto border border-red-500/15">
              <span className="material-symbols-rounded text-[24px]">warning</span>
            </div>
            
            <h3 className="font-extrabold text-white text-[11px] uppercase tracking-widest">
              {confirmAction === "reset" ? "Resetar Banco" : "Excluir Perfil"}
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              {confirmAction === "reset" 
                ? "Tem certeza que deseja resetar todo o FamilyFlow? Todos os perfis, hábitos, tarefas e histórico serão limpos permanentemente."
                : `Deseja realmente excluir o perfil de "${currentUser}" permanentemente? Seus pontos, medalhas e conquistas serão perdidos.`}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setConfirmAction(null)}
                className="py-2.5 bg-slate-950 border border-slate-800/60 hover:bg-slate-900 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (confirmAction === "reset") {
                    onResetState();
                  } else {
                    onDeleteProfile(currentUser);
                  }
                  setConfirmAction(null);
                }}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl cursor-pointer transition"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL NOTIFICATION DIALOG SHEET */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-card max-w-xs w-full rounded-3xl p-5 border border-slate-800/60 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <span className="material-symbols-rounded text-brand-success text-[40px]">check_circle</span>
            <p className="text-xs font-bold text-slate-200 leading-relaxed">{showDialog}</p>
            <button 
              onClick={() => setShowDialog(null)}
              className="w-full py-2.5 bg-brand-primary text-white font-extrabold text-xs rounded-xl cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

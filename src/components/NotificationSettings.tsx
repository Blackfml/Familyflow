import React, { useEffect, useState } from "react";
import { Bell, Moon, Volume2, Smartphone, Mail, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { api } from "../services/api";

interface NotificationSettingsProps {
  currentUser: string;
  onClose?: () => void;
}

export default function NotificationSettings({ currentUser, onClose }: NotificationSettingsProps) {
  const [channels, setChannels] = useState<Record<string, boolean>>({
    push: true,
    sound: true,
    vibration: true,
    email: false,
  });
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [saved, setSaved] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get<any>(`/notification-channels/${currentUser}`).then(setChannels).catch(() => {});
    api.get<any>("/state").then((s: any) => {
      if (s?.notifications) setNotificationHistory(s.notifications.slice(0, 10));
    }).catch(() => {});
  }, [currentUser]);

  const toggleChannel = async (channel: string, value: boolean) => {
    setChannels(prev => ({ ...prev, [channel]: value }));
    try {
      await api.post("/notification-channels/set", { userId: currentUser, channel, enabled: value });
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveQuietHours = async () => {
    try {
      await api.post("/notification-channels/quiet-hours", { userId: currentUser, start: quietStart, end: quietEnd });
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" /> Canais de Notificação
        </h3>

        {[
          { key: "push", label: "Push", icon: <Smartphone className="w-4 h-4" />, desc: "Notificações no dispositivo" },
          { key: "sound", label: "Som", icon: <Volume2 className="w-4 h-4" />, desc: "Alertas sonoros" },
          { key: "vibration", label: "Vibração", icon: <Smartphone className="w-4 h-4" />, desc: "Vibrar ao receber" },
          { key: "email", label: "Email", icon: <Mail className="w-4 h-4" />, desc: "Resumo por email" },
        ].map(({ key, label, icon, desc }) => (
          <div key={key} className="flex items-center justify-between p-3 bg-brand-card border border-slate-800/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{icon}</span>
              <div>
                <span className="text-xs font-bold text-white">{label}</span>
                <p className="text-[10px] text-slate-500">{desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggleChannel(key, !channels[key])}
              className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${channels[key] ? "bg-blue-600" : "bg-slate-800"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${channels[key] ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Moon className="w-4 h-4 text-purple-400" /> Horário de Silêncio
        </h3>
        <div className="p-4 bg-brand-card border border-slate-800/40 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Início</label>
              <input
                type="time"
                value={quietStart}
                onChange={e => setQuietStart(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Fim</label>
              <input
                type="time"
                value={quietEnd}
                onChange={e => setQuietEnd(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white"
              />
            </div>
          </div>
          <button
            onClick={saveQuietHours}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Salvar Horário de Silêncio
          </button>
        </div>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-emerald-400 text-xs font-bold"
        >
          <CheckCircle2 className="w-4 h-4" /> Configurações salvas!
        </motion.div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Histórico Recente
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notificationHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhuma notificação ainda.</p>
          ) : (
            notificationHistory.map((n: any, i: number) => (
              <div key={n.id || i} className="p-2.5 bg-brand-card border border-slate-800/40 rounded-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-white">{n.title}</span>
                  <span className="text-[8px] text-slate-500">
                    {n.timestamp ? new Date(n.timestamp).toLocaleDateString("pt-BR") : ""}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

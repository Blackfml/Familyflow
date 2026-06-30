import React, { useEffect, useState } from "react";
import { Trophy, Medal, Star } from "lucide-react";
import { api } from "../services/api";

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  level: number;
}

interface LeaderboardProps {
  currentUserId?: string;
  onClose?: () => void;
}

const rankIcons = [
  <Trophy className="w-4 h-4 text-yellow-500" />,
  <Medal className="w-4 h-4 text-slate-400" />,
  <Medal className="w-4 h-4 text-amber-700" />,
];

const rankColors = [
  "border-yellow-500/30 bg-yellow-500/5",
  "border-slate-400/30 bg-slate-400/5",
  "border-amber-700/30 bg-amber-700/5",
];

export default function Leaderboard({ currentUserId, onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<LeaderboardEntry[]>("/gamification/leaderboard")
      .then(data => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard
      </h3>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">Nenhum participante ainda.</p>
        ) : (
          entries.map((entry, i) => (
            <div
              key={entry.userId}
              className={`p-3 rounded-2xl border flex items-center gap-3 ${
                currentUserId && entry.userId === currentUserId
                  ? "border-blue-500/40 bg-blue-500/10"
                  : i < 3
                    ? rankColors[i] + " border"
                    : "border-slate-800/40 bg-brand-card"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white">
                {i < 3 ? rankIcons[i] : <span className="text-slate-500">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-white block">
                  {entry.name}
                  {currentUserId && entry.userId === currentUserId && (
                    <span className="ml-1 text-[8px] text-blue-400">(você)</span>
                  )}
                </span>
                <span className="text-[9px] text-slate-400">Nível {entry.level}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white block">{entry.points.toLocaleString("pt-BR")}</span>
                <span className="text-[8px] text-slate-500">pts</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

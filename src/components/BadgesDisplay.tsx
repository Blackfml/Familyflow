import React, { useEffect, useState } from "react";
import { Award, Zap, TrendingUp, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserAchievements, Badge } from "../types";
import { api } from "../services/api";

interface BadgesDisplayProps {
  userId: string;
  onClose?: () => void;
}

const POINTS_PER_LEVEL = 100;

export default function BadgesDisplay({ userId, onClose }: BadgesDisplayProps) {
  const [achievements, setAchievements] = useState<UserAchievements | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    api.get<UserAchievements>(`/gamification/achievements/${userId}`).then(setAchievements).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!achievements?.badges) return;
    const recent = achievements.badges.filter(b => {
      if (!b.unlockedAt) return false;
      return Date.now() - new Date(b.unlockedAt).getTime() < 5000;
    });
    if (recent.length > 0) setNewBadges(recent);
  }, [achievements]);

  if (!achievements) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentLevelPoints = achievements.level * POINTS_PER_LEVEL;
  const nextLevelPoints = (achievements.level + 1) * POINTS_PER_LEVEL;
  const progress = Math.min(100, ((achievements.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-brand-card border border-slate-800/40 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Nível {achievements.level}</h3>
            <p className="text-[11px] text-slate-400">{achievements.points.toLocaleString("pt-BR")} pontos</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
            {achievements.level}
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, progress)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-bold">
            <span>{achievements.points.toLocaleString("pt-BR")} XP</span>
            <span>{nextLevelPoints.toLocaleString("pt-BR")} XP</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center p-2 bg-slate-900 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block">Streak</span>
            <span className="text-sm font-bold text-white">{achievements.streak}d</span>
          </div>
          <div className="text-center p-2 bg-slate-900 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block">Tarefas</span>
            <span className="text-sm font-bold text-white">{achievements.tasksCompleted}</span>
          </div>
          <div className="text-center p-2 bg-slate-900 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold block">Score</span>
            <span className="text-sm font-bold text-white">{achievements.weeklyScore}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Badges
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence>
            {achievements.badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={newBadges.includes(badge) ? { scale: 0, rotate: -180 } : { scale: 1 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="p-3 bg-brand-card border border-slate-800/40 rounded-2xl flex items-center gap-3"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <span className="text-[11px] font-bold text-white block">{badge.name}</span>
                  <span className="text-[9px] text-slate-400">{badge.description}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {achievements.badges.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-4">
            Complete tarefas e mantenha streaks para desbloquear badges!
          </p>
        )}
      </div>

      <div className="bg-brand-card border border-slate-800/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[11px] font-bold text-white">Pontuação Semanal</span>
            <p className="text-[9px] text-slate-400">Tarefas concluídas nesta semana</p>
          </div>
        </div>
        <span className="text-lg font-bold text-white">{achievements.weeklyScore}</span>
      </div>
    </div>
  );
}

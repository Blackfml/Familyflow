import { Goal } from "../../types";
import Card from "../ui/AppCard";
import { formatDate } from "../../utils/formatters";

interface GoalCardProps {
  goal: Goal;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function GoalCard({ goal, onComplete, onDelete }: GoalCardProps) {
  const progress = Math.min(Math.max(goal.progress || 0, 0), 100);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{goal.title}</h3>
          {goal.description && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{goal.description}</p>
          )}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {goal.status}
            </span>
            {goal.deadline && (
              <span className="text-xs text-slate-500">{formatDate(goal.deadline)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onComplete && goal.status !== "Concluído" && (
            <button
              onClick={() => onComplete(goal.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
              title="Concluir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Excluir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

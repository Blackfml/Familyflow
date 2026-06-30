import { Habit } from "../../types";
import Card from "../ui/AppCard";

interface HabitCardProps {
  habit: Habit;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function HabitCard({ habit, onComplete, onDelete }: HabitCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{habit.title}</h3>
          {habit.description && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{habit.description}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">{habit.responsible}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-medium">{habit.streak}</span>
            </div>
            {habit.icon && (
              <span className="text-lg">{habit.icon}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onComplete && (
            <button
              onClick={() => onComplete(habit.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
              title="Completar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(habit.id)}
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

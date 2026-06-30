import { Task } from "../../types";
import Card from "../ui/AppCard";
import { getPriorityColor, getStatusColor, formatDate } from "../../utils/formatters";

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const priorityBorder = {
    Alta: "border-l-red-500",
    Média: "border-l-yellow-500",
    Baixa: "border-l-green-500",
    Urgente: "border-l-red-500",
  }[task.priority] || "border-l-slate-500";

  return (
    <Card className={`border-l-4 ${priorityBorder}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{task.title}</h3>
          <p className="text-slate-400 text-sm mt-1">{task.responsible}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${getPriorityColor(task.priority)}-500/20 text-${getPriorityColor(task.priority)}-400`}>
              {task.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${getStatusColor(task.status)}-500/20 text-${getStatusColor(task.status)}-400`}>
              {task.status}
            </span>
            {task.date && (
              <span className="text-xs text-slate-500">{formatDate(task.date)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onComplete && task.status !== "Concluído" && (
            <button
              onClick={() => onComplete(task.id)}
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
              onClick={() => onDelete(task.id)}
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

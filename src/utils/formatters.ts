export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = { Alta: "red", Média: "yellow", Baixa: "green", Urgente: "red" };
  return map[priority] || "slate";
}

export function getStatusColor(status: string): string {
  if (status === "Concluído") return "emerald";
  if (status === "A Fazer") return "blue";
  return "amber";
}

export type AppTheme = "light" | "dark" | "rose" | "nature" | "ocean";

export type UserRole = string;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserAchievements {
  userId: string;
  badges: Badge[];
  points: number;
  level: number;
  streak: number;
  tasksCompleted: number;
  habitsCompleted: number;
  weeklyScore: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  streak: number;
  streakUpdatedAt: string;
  email?: string;
  provider?: string;
  gender?: "Masculino" | "Feminino";
  uid?: string;
  badges?: Badge[];
  fcmTokens?: string[];
  notificationChannels?: {
    push: boolean;
    sound: boolean;
    vibration: boolean;
    email: boolean;
    quietHours?: { start: string; end: string };
  };
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TaskStatus = "A Fazer" | "Em andamento" | "Concluído" | "Cancelado" | "Aguardando";
export type TaskPriority = "Baixa" | "Média" | "Alta" | "Urgente";

export interface Task {
  id: string;
  title: string;
  description: string;
  responsible: UserRole;
  createdBy: string;
  category: string;
  date: string;
  time?: string;
  durationEstimate?: number;
  intelligentStartTime?: string;
  cost?: number;
  priority: TaskPriority;
  color: string;
  icon: string;
  checklist: TaskChecklistItem[];
  attachments: string[];
  status: TaskStatus;
  notes?: string;
  recurrence: "Nenhuma" | "Diária" | "Semanal" | "Mensal";
  tags: string[];
  percentCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline: string;
  progress: number;
  subtasks: { id: string; text: string; completed: boolean }[];
  category: string;
  icon: string;
  status: "Em Progresso" | "Concluído" | "Pausado";
  createdBy: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  responsible: UserRole;
  streak: number;
  history: { [dateStr: string]: boolean };
  icon: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  cost?: number;
  purchased: boolean;
  responsible?: UserRole;
  createdBy: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  responsible: UserRole;
  category: string;
  cost?: number;
}

export interface HistoryLog {
  id: string;
  userName: string;
  action: string;
  targetName: string;
  targetType: "task" | "goal" | "habit" | "shopping" | "calendar" | "general";
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  targetUser: string;
  type: "info" | "success" | "warning" | "ai";
  readBy: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface GroupMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface FamilyState {
  users: { [username: string]: UserProfile };
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  shoppingList: ShoppingItem[];
  calendarEvents: CalendarEvent[];
  history: HistoryLog[];
  notifications: AppNotification[];
  chatHistory: ChatMessage[];
  groupChat?: GroupMessage[];
  lastWeeklyMeetingSummary?: string;
}

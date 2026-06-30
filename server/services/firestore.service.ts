import { getDb } from "../config/firebase";
import { FieldValue } from "firebase-admin/firestore";
import type { Task, Goal, Habit, ShoppingItem, CalendarEvent, ChatMessage, GroupMessage, AppNotification, UserProfile } from "../../src/types";
import { env } from "../config/env";

const C = {
  tasks: `${env.FIRESTORE_COLLECTION_PREFIX}tasks`,
  goals: `${env.FIRESTORE_COLLECTION_PREFIX}goals`,
  habits: `${env.FIRESTORE_COLLECTION_PREFIX}habits`,
  shopping: `${env.FIRESTORE_COLLECTION_PREFIX}shopping`,
  events: `${env.FIRESTORE_COLLECTION_PREFIX}events`,
  chat: `${env.FIRESTORE_COLLECTION_PREFIX}chat`,
  groupChat: `${env.FIRESTORE_COLLECTION_PREFIX}groupChat`,
  notifications: `${env.FIRESTORE_COLLECTION_PREFIX}notifications`,
  users: `${env.FIRESTORE_COLLECTION_PREFIX}users`,
} as const;

function db() {
  return getDb();
}

function docSnapToData<T>(snap: FirebaseFirestore.DocumentSnapshot): T | null {
  return snap.exists ? (snap.data() as T) : null;
}

function querySnapToArray<T>(snap: FirebaseFirestore.QuerySnapshot): T[] {
  return snap.docs.map((d) => d.data() as T);
}

export const firestoreService = {
  // ── Tasks ──────────────────────────────────────────────
  async getTasks(familyId?: string): Promise<Task[]> {
    let query: FirebaseFirestore.Query = db().collection(C.tasks).orderBy("createdAt", "desc");
    if (familyId) query = query.where("familyId", "==", familyId);
    const snap = await query.get();
    return querySnapToArray<Task>(snap);
  },

  async getTask(id: string): Promise<Task | null> {
    const doc = await db().collection(C.tasks).doc(id).get();
    return docSnapToData<Task>(doc);
  },

  async createTask(task: Task): Promise<Task> {
    await db().collection(C.tasks).doc(task.id).set(task);
    return task;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    await db().collection(C.tasks).doc(id).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteTask(id: string): Promise<void> {
    await db().collection(C.tasks).doc(id).delete();
  },

  // ── Goals ──────────────────────────────────────────────
  async getGoals(): Promise<Goal[]> {
    const snap = await db().collection(C.goals).orderBy("createdAt", "desc").get();
    return querySnapToArray<Goal>(snap);
  },

  async getGoal(id: string): Promise<Goal | null> {
    const doc = await db().collection(C.goals).doc(id).get();
    return docSnapToData<Goal>(doc);
  },

  async createGoal(goal: Goal): Promise<Goal> {
    await db().collection(C.goals).doc(goal.id).set(goal);
    return goal;
  },

  async updateGoal(id: string, data: Partial<Goal>): Promise<void> {
    await db().collection(C.goals).doc(id).update(data);
  },

  async deleteGoal(id: string): Promise<void> {
    await db().collection(C.goals).doc(id).delete();
  },

  // ── Habits ─────────────────────────────────────────────
  async getHabits(): Promise<Habit[]> {
    const snap = await db().collection(C.habits).get();
    return querySnapToArray<Habit>(snap);
  },

  async createHabit(habit: Habit): Promise<Habit> {
    await db().collection(C.habits).doc(habit.id).set(habit);
    return habit;
  },

  async updateHabit(id: string, data: Partial<Habit>): Promise<void> {
    await db().collection(C.habits).doc(id).update(data);
  },

  async deleteHabit(id: string): Promise<void> {
    await db().collection(C.habits).doc(id).delete();
  },

  async toggleHabit(id: string, dateStr: string): Promise<void> {
    const doc = await db().collection(C.habits).doc(id).get();
    if (!doc.exists) return;
    const habit = doc.data() as Habit;
    const history = habit.history || {};
    if (history[dateStr]) {
      history[dateStr] = !history[dateStr];
    } else {
      history[dateStr] = true;
    }
    await doc.ref.update({ history });
  },

  // ── Shopping ───────────────────────────────────────────
  async getShoppingList(): Promise<ShoppingItem[]> {
    const snap = await db().collection(C.shopping).orderBy("createdAt", "desc").get();
    return querySnapToArray<ShoppingItem>(snap);
  },

  async addItem(item: ShoppingItem): Promise<ShoppingItem> {
    await db().collection(C.shopping).doc(item.id).set(item);
    return item;
  },

  async updateItem(id: string, data: Partial<ShoppingItem>): Promise<void> {
    await db().collection(C.shopping).doc(id).update(data);
  },

  async deleteItem(id: string): Promise<void> {
    await db().collection(C.shopping).doc(id).delete();
  },

  // ── Events ─────────────────────────────────────────────
  async getEvents(): Promise<CalendarEvent[]> {
    const snap = await db().collection(C.events).orderBy("date", "asc").get();
    return querySnapToArray<CalendarEvent>(snap);
  },

  async getEvent(id: string): Promise<CalendarEvent | null> {
    const doc = await db().collection(C.events).doc(id).get();
    return docSnapToData<CalendarEvent>(doc);
  },

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    await db().collection(C.events).doc(event.id).set(event);
    return event;
  },

  async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<void> {
    await db().collection(C.events).doc(id).update(data);
  },

  async deleteEvent(id: string): Promise<void> {
    await db().collection(C.events).doc(id).delete();
  },

  // ── Chat ───────────────────────────────────────────────
  async getChatMessages(limit = 100): Promise<ChatMessage[]> {
    const snap = await db().collection(C.chat).orderBy("timestamp", "desc").limit(limit).get();
    return querySnapToArray<ChatMessage>(snap);
  },

  async addChatMessage(msg: ChatMessage): Promise<ChatMessage> {
    await db().collection(C.chat).doc(msg.id).set(msg);
    return msg;
  },

  async deleteChatMessage(id: string): Promise<void> {
    await db().collection(C.chat).doc(id).delete();
  },

  // ── Group Chat ─────────────────────────────────────────
  async getGroupMessages(limit = 200): Promise<GroupMessage[]> {
    const snap = await db().collection(C.groupChat).orderBy("timestamp", "desc").limit(limit).get();
    return querySnapToArray<GroupMessage>(snap);
  },

  async addGroupMessage(msg: GroupMessage): Promise<GroupMessage> {
    await db().collection(C.groupChat).doc(msg.id).set(msg);
    return msg;
  },

  // ── Users ──────────────────────────────────────────────
  async getUsers(): Promise<Record<string, UserProfile>> {
    const snap = await db().collection(C.users).get();
    const result: Record<string, UserProfile> = {};
    snap.docs.forEach((d) => {
      result[d.id] = d.data() as UserProfile;
    });
    return result;
  },

  async getUser(id: string): Promise<UserProfile | null> {
    const doc = await db().collection(C.users).doc(id).get();
    return docSnapToData<UserProfile>(doc);
  },

  async setUser(id: string, profile: UserProfile): Promise<void> {
    await db().collection(C.users).doc(id).set(profile);
  },

  async deleteUser(id: string): Promise<void> {
    await db().collection(C.users).doc(id).delete();
  },

  // ── Notifications ──────────────────────────────────────
  async getNotifications(): Promise<AppNotification[]> {
    const snap = await db().collection(C.notifications).orderBy("timestamp", "desc").limit(100).get();
    return querySnapToArray<AppNotification>(snap);
  },

  async addNotification(n: AppNotification): Promise<AppNotification> {
    await db().collection(C.notifications).doc(n.id).set(n);
    return n;
  },

  async updateNotification(id: string, data: Partial<AppNotification>): Promise<void> {
    await db().collection(C.notifications).doc(id).update(data);
  },

  async deleteNotification(id: string): Promise<void> {
    await db().collection(C.notifications).doc(id).delete();
  },

  // ── Batch Operations ───────────────────────────────────
  async syncAll(state: {
    users: Record<string, UserProfile>;
    tasks: Task[];
    goals: Goal[];
    habits: Habit[];
    shoppingList: ShoppingItem[];
    calendarEvents: CalendarEvent[];
    chatHistory: ChatMessage[];
    groupChat?: GroupMessage[];
    notifications: AppNotification[];
  }): Promise<void> {
    const batch = db().batch();

    for (const [key, profile] of Object.entries(state.users)) {
      batch.set(db().collection(C.users).doc(key), profile);
    }
    for (const task of state.tasks) {
      batch.set(db().collection(C.tasks).doc(task.id), task);
    }
    for (const goal of state.goals) {
      batch.set(db().collection(C.goals).doc(goal.id), goal);
    }
    for (const habit of state.habits) {
      batch.set(db().collection(C.habits).doc(habit.id), habit);
    }
    for (const item of state.shoppingList) {
      batch.set(db().collection(C.shopping).doc(item.id), item);
    }
    for (const event of state.calendarEvents) {
      batch.set(db().collection(C.events).doc(event.id), event);
    }
    for (const msg of state.chatHistory) {
      batch.set(db().collection(C.chat).doc(msg.id), msg);
    }
    if (state.groupChat) {
      for (const msg of state.groupChat) {
        batch.set(db().collection(C.groupChat).doc(msg.id), msg);
      }
    }
    for (const n of state.notifications) {
      batch.set(db().collection(C.notifications).doc(n.id), n);
    }

    await batch.commit();
  },
};

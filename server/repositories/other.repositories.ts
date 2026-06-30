import { getDb } from "../config/firebase";
import { Habit, ShoppingItem, CalendarEvent, AppNotification, HistoryLog, GroupMessage, ChatMessage } from "../../src/types";

export const habitRepository = {
  async findByFamily(familyId: string): Promise<Habit[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("habits").get();
    return snapshot.docs.map((d) => d.data() as Habit);
  },
  async findById(familyId: string, habitId: string): Promise<Habit | null> {
    const doc = await getDb()
      .collection("families").doc(familyId)
      .collection("habits").doc(habitId).get();
    return doc.exists ? (doc.data() as Habit) : null;
  },
  async create(familyId: string, habit: Habit): Promise<Habit> {
    await getDb().collection("families").doc(familyId)
      .collection("habits").doc(habit.id).set(habit);
    return habit;
  },
  async update(familyId: string, habitId: string, data: Partial<Habit>): Promise<void> {
    await getDb().collection("families").doc(familyId)
      .collection("habits").doc(habitId).update(data);
  },
  async remove(familyId: string, habitId: string): Promise<void> {
    await getDb().collection("families").doc(familyId)
      .collection("habits").doc(habitId).delete();
  },
};

export const shoppingRepository = {
  async findByFamily(familyId: string): Promise<ShoppingItem[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("shopping").get();
    return snapshot.docs.map((d) => d.data() as ShoppingItem);
  },
  async create(familyId: string, item: ShoppingItem): Promise<ShoppingItem> {
    await getDb().collection("families").doc(familyId)
      .collection("shopping").doc(item.id).set(item);
    return item;
  },
  async update(familyId: string, itemId: string, data: Partial<ShoppingItem>): Promise<void> {
    await getDb().collection("families").doc(familyId)
      .collection("shopping").doc(itemId).update(data);
  },
  async remove(familyId: string, itemId: string): Promise<void> {
    await getDb().collection("families").doc(familyId)
      .collection("shopping").doc(itemId).delete();
  },
};

export const eventRepository = {
  async findByFamily(familyId: string): Promise<CalendarEvent[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("events").orderBy("date").get();
    return snapshot.docs.map((d) => d.data() as CalendarEvent);
  },
  async create(familyId: string, event: CalendarEvent): Promise<CalendarEvent> {
    await getDb().collection("families").doc(familyId)
      .collection("events").doc(event.id).set(event);
    return event;
  },
};

export const notificationRepository = {
  async findByFamily(familyId: string): Promise<AppNotification[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("notifications").orderBy("timestamp", "desc").limit(50).get();
    return snapshot.docs.map((d) => d.data() as AppNotification);
  },
  async create(familyId: string, notification: AppNotification): Promise<AppNotification> {
    await getDb().collection("families").doc(familyId)
      .collection("notifications").doc(notification.id).set(notification);
    return notification;
  },
  async markRead(familyId: string, userId: string): Promise<void> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("notifications").get();
    const batch = getDb().batch();
    snapshot.docs.forEach((doc) => {
      const data = doc.data() as AppNotification;
      if (!data.readBy.includes(userId)) {
        batch.update(doc.ref, { readBy: [...data.readBy, userId] });
      }
    });
    await batch.commit();
  },
};

export const chatRepository = {
  async findByFamily(familyId: string, limit = 200): Promise<GroupMessage[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("chat").orderBy("timestamp", "desc").limit(limit).get();
    return snapshot.docs.reverse().map((d) => d.data() as GroupMessage);
  },
  async create(familyId: string, message: GroupMessage): Promise<GroupMessage> {
    await getDb().collection("families").doc(familyId)
      .collection("chat").doc(message.id).set(message);
    return message;
  },
};

export const historyRepository = {
  async findByFamily(familyId: string, limit = 20): Promise<HistoryLog[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection("history").orderBy("timestamp", "desc").limit(limit).get();
    return snapshot.docs.map((d) => d.data() as HistoryLog);
  },
  async create(familyId: string, log: HistoryLog): Promise<HistoryLog> {
    await getDb().collection("families").doc(familyId)
      .collection("history").doc(log.id).set(log);
    return log;
  },
};

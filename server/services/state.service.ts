import { FamilyState, UserProfile } from "../../src/types";
import fs from "fs";
import path from "path";
import { getDb } from "../config/firebase";
import { firestoreService } from "./firestore.service";

const STATE_FILE = path.join(process.cwd(), "family_state.json");

const getInitialState = (): FamilyState => ({
  users: {},
  tasks: [],
  goals: [],
  habits: [],
  shoppingList: [],
  calendarEvents: [],
  history: [],
  notifications: [],
  chatHistory: [{
    id: "chat-1",
    role: "model",
    content: "Olá! Sou o **FamilyFlow AI**, seu assistente familiar de confiança. Como posso ajudar vocês hoje?",
    timestamp: new Date().toISOString(),
  }],
  groupChat: [],
  lastWeeklyMeetingSummary: "",
});

let familyState: FamilyState = getInitialState();

export const stateService = {
  get(): FamilyState {
    return familyState;
  },

  async load(): Promise<FamilyState> {
    try {
      if (fs.existsSync(STATE_FILE)) {
        familyState = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
      } else {
        familyState = getInitialState();
        fs.writeFileSync(STATE_FILE, JSON.stringify(familyState, null, 2), "utf-8");
      }
    } catch {
      familyState = getInitialState();
    }

    try {
      const db = getDb();
      const docRef = db.collection("appState").doc("familyState");
      const doc = await docRef.get();
      if (doc.exists) {
        familyState = doc.data() as FamilyState;
        fs.writeFileSync(STATE_FILE, JSON.stringify(familyState, null, 2), "utf-8");
      } else {
        await docRef.set(familyState);
      }
    } catch (err: any) {
      console.warn("Firestore legacy doc sync failed:", err.message);
    }

    try {
      const [tasks, goals, habits, shoppingItems, events, notifications] = await Promise.all([
        firestoreService.getTasks(),
        firestoreService.getGoals(),
        firestoreService.getHabits(),
        firestoreService.getShoppingList(),
        firestoreService.getEvents(),
        firestoreService.getNotifications(),
      ]);

      if (tasks.length > 0) familyState.tasks = tasks;
      if (goals.length > 0) familyState.goals = goals;
      if (habits.length > 0) familyState.habits = habits;
      if (shoppingItems.length > 0) familyState.shoppingList = shoppingItems;
      if (events.length > 0) familyState.calendarEvents = events;
      if (notifications.length > 0) familyState.notifications = notifications;

      const chats = await firestoreService.getChatMessages(200);
      if (chats.length > 0) familyState.chatHistory = chats;

      const users = await firestoreService.getUsers();
      if (Object.keys(users).length > 0) familyState.users = users;
    } catch (err: any) {
      console.warn("Firestore collections load failed:", err.message);
    }

    return familyState;
  },

  async save(): Promise<void> {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(familyState, null, 2), "utf-8");
    } catch (err) {
      console.error("Local save failed:", err);
    }

    try {
      const db = getDb();
      await db.collection("appState").doc("familyState").set(familyState);
    } catch (err: any) {
      console.warn("Firestore legacy doc save failed:", err.message);
    }

    try {
      await firestoreService.syncAll(familyState);
    } catch (err: any) {
      console.warn("Firestore collections sync failed:", err.message);
    }
  },

  async syncAll(): Promise<void> {
    try {
      await firestoreService.syncAll(familyState);
    } catch (err: any) {
      console.error("syncAll failed:", err.message);
    }
  },

  reset(): FamilyState {
    familyState = getInitialState();
    this.save();
    return familyState;
  },

  getUsers(): UserProfile[] {
    return Object.values(familyState.users);
  },

  getUser(name: string): UserProfile | undefined {
    return familyState.users[name];
  },

  addUser(name: string, user: UserProfile): void {
    familyState.users[name] = user;
  },

  removeUser(name: string): void {
    delete familyState.users[name];
  },
};

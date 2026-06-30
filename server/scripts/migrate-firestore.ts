import fs from "fs";
import path from "path";
import { initFirebase } from "../config/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { FamilyState, Task, Goal, Habit, ShoppingItem, CalendarEvent, ChatMessage, GroupMessage, AppNotification, UserProfile } from "../../src/types";

const STATE_FILE = path.join(process.cwd(), "family_state.json");

const PREFIX = process.env.FIRESTORE_COLLECTION_PREFIX || "familyflow_";

interface MigrationCounts {
  tasks: number;
  goals: number;
  habits: number;
  shopping: number;
  events: number;
  chat: number;
  groupChat: number;
  notifications: number;
  users: number;
}

async function migrateCollection<T>(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  items: T[],
  getId: (item: T) => string,
): Promise<number> {
  const col = db.collection(`${PREFIX}${collectionName}`);
  let count = 0;
  for (const item of items) {
    try {
      const id = getId(item);
      await col.doc(id).set(item);
      count++;
    } catch (err: any) {
      console.error(`  Error migrating ${collectionName}/${getId(item)}: ${err.message}`);
    }
  }
  return count;
}

async function migrateUsers(
  db: FirebaseFirestore.Firestore,
  users: Record<string, UserProfile>,
): Promise<number> {
  const col = db.collection(`${PREFIX}users`);
  let count = 0;
  for (const [username, profile] of Object.entries(users)) {
    try {
      await col.doc(username).set(profile);
      count++;
    } catch (err: any) {
      console.error(`  Error migrating users/${username}: ${err.message}`);
    }
  }
  return count;
}

async function migrate() {
  console.log("=".repeat(60));
  console.log("FamilyFlow Firestore Migration");
  console.log("=".repeat(60));

  if (!fs.existsSync(STATE_FILE)) {
    console.error(`State file not found at ${STATE_FILE}`);
    console.log("Run the server first to generate a state file.");
    process.exit(1);
  }

  const raw = fs.readFileSync(STATE_FILE, "utf-8");
  const data: FamilyState = JSON.parse(raw);
  console.log(`Loaded state with:`);
  console.log(`  Users: ${Object.keys(data.users).length}`);
  console.log(`  Tasks: ${data.tasks.length}`);
  console.log(`  Goals: ${data.goals.length}`);
  console.log(`  Habits: ${data.habits.length}`);
  console.log(`  Shopping items: ${data.shoppingList.length}`);
  console.log(`  Events: ${data.calendarEvents.length}`);
  console.log(`  Chat messages: ${data.chatHistory.length}`);
  console.log(`  Group chat messages: ${data.groupChat?.length || 0}`);
  console.log(`  Notifications: ${data.notifications.length}`);
  console.log("");

  let db: FirebaseFirestore.Firestore;
  try {
    db = initFirebase();
    console.log("Firebase initialized successfully.\n");
  } catch (err: any) {
    console.error("Failed to initialize Firebase:", err.message);
    process.exit(1);
  }

  const counts: MigrationCounts = {
    tasks: 0,
    goals: 0,
    habits: 0,
    shopping: 0,
    events: 0,
    chat: 0,
    groupChat: 0,
    notifications: 0,
    users: 0,
  };

  console.log("Migrating collections...");

  if (data.tasks.length > 0) {
    console.log("  [tasks] ...");
    counts.tasks = await migrateCollection(db, "tasks", data.tasks, (t: Task) => t.id);
    console.log(`    -> ${counts.tasks} documents written`);
  }

  if (data.goals.length > 0) {
    console.log("  [goals] ...");
    counts.goals = await migrateCollection(db, "goals", data.goals, (g: Goal) => g.id);
    console.log(`    -> ${counts.goals} documents written`);
  }

  if (data.habits.length > 0) {
    console.log("  [habits] ...");
    counts.habits = await migrateCollection(db, "habits", data.habits, (h: Habit) => h.id);
    console.log(`    -> ${counts.habits} documents written`);
  }

  if (data.shoppingList.length > 0) {
    console.log("  [shopping] ...");
    counts.shopping = await migrateCollection(db, "shopping", data.shoppingList, (s: ShoppingItem) => s.id);
    console.log(`    -> ${counts.shopping} documents written`);
  }

  if (data.calendarEvents.length > 0) {
    console.log("  [events] ...");
    counts.events = await migrateCollection(db, "events", data.calendarEvents, (e: CalendarEvent) => e.id);
    console.log(`    -> ${counts.events} documents written`);
  }

  if (data.chatHistory.length > 0) {
    console.log("  [chat] ...");
    counts.chat = await migrateCollection(db, "chat", data.chatHistory, (c: ChatMessage) => c.id);
    console.log(`    -> ${counts.chat} documents written`);
  }

  if (data.groupChat && data.groupChat.length > 0) {
    console.log("  [groupChat] ...");
    counts.groupChat = await migrateCollection(db, "groupChat", data.groupChat, (g: GroupMessage) => g.id);
    console.log(`    -> ${counts.groupChat} documents written`);
  }

  if (data.notifications.length > 0) {
    console.log("  [notifications] ...");
    counts.notifications = await migrateCollection(db, "notifications", data.notifications, (n: AppNotification) => n.id);
    console.log(`    -> ${counts.notifications} documents written`);
  }

  if (Object.keys(data.users).length > 0) {
    console.log("  [users] ...");
    counts.users = await migrateUsers(db, data.users);
    console.log(`    -> ${counts.users} documents written`);
  }

  console.log("\nUpdating appState document with migration flag...");
  try {
    await db.collection(`${PREFIX}appState`).doc("familyState").set({
      ...data,
      migrated: true,
      migratedAt: FieldValue.serverTimestamp(),
    });
    console.log("  appState/familyState updated with migrated flag.");
  } catch (err: any) {
    console.error("  Failed to update appState:", err.message);
  }

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  console.log("");
  console.log("=".repeat(60));
  console.log("Migration Summary");
  console.log("=".repeat(60));
  console.log(`  Tasks:         ${counts.tasks}`);
  console.log(`  Goals:         ${counts.goals}`);
  console.log(`  Habits:        ${counts.habits}`);
  console.log(`  Shopping:      ${counts.shopping}`);
  console.log(`  Events:        ${counts.events}`);
  console.log(`  Chat:          ${counts.chat}`);
  console.log(`  Group Chat:    ${counts.groupChat}`);
  console.log(`  Notifications: ${counts.notifications}`);
  console.log(`  Users:         ${counts.users}`);
  console.log(`  ─────────────────────`);
  console.log(`  Total:         ${total} documents migrated`);
  console.log("=".repeat(60));

  if (total === 0) {
    console.log("No data to migrate. The Firestore collections are ready for new data.");
  } else {
    console.log("Migration completed successfully!");
  }

  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

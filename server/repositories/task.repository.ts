import { getDb } from "../config/firebase";
import { Task } from "../../src/types";

const COLLECTION = "tasks";

export const taskRepository = {
  async findByFamily(familyId: string): Promise<Task[]> {
    const snapshot = await getDb()
      .collection("families")
      .doc(familyId)
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((d) => d.data() as Task);
  },

  async findById(familyId: string, taskId: string): Promise<Task | null> {
    const doc = await getDb()
      .collection("families")
      .doc(familyId)
      .collection(COLLECTION)
      .doc(taskId)
      .get();
    return doc.exists ? (doc.data() as Task) : null;
  },

  async create(familyId: string, task: Task): Promise<Task> {
    await getDb()
      .collection("families")
      .doc(familyId)
      .collection(COLLECTION)
      .doc(task.id)
      .set(task);
    return task;
  },

  async update(familyId: string, taskId: string, data: Partial<Task>): Promise<void> {
    await getDb()
      .collection("families")
      .doc(familyId)
      .collection(COLLECTION)
      .doc(taskId)
      .update(data);
  },

  async remove(familyId: string, taskId: string): Promise<void> {
    await getDb()
      .collection("families")
      .doc(familyId)
      .collection(COLLECTION)
      .doc(taskId)
      .delete();
  },
};

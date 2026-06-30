import { getDb } from "../config/firebase";
import { Goal } from "../../src/types";

const COLLECTION = "goals";

export const goalRepository = {
  async findByFamily(familyId: string): Promise<Goal[]> {
    const snapshot = await getDb()
      .collection("families").doc(familyId)
      .collection(COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map((d) => d.data() as Goal);
  },

  async findById(familyId: string, goalId: string): Promise<Goal | null> {
    const doc = await getDb()
      .collection("families").doc(familyId)
      .collection(COLLECTION).doc(goalId).get();
    return doc.exists ? (doc.data() as Goal) : null;
  },

  async create(familyId: string, goal: Goal): Promise<Goal> {
    await getDb()
      .collection("families").doc(familyId)
      .collection(COLLECTION).doc(goal.id).set(goal);
    return goal;
  },

  async update(familyId: string, goalId: string, data: Partial<Goal>): Promise<void> {
    await getDb()
      .collection("families").doc(familyId)
      .collection(COLLECTION).doc(goalId).update(data);
  },

  async remove(familyId: string, goalId: string): Promise<void> {
    await getDb()
      .collection("families").doc(familyId)
      .collection(COLLECTION).doc(goalId).delete();
  },
};

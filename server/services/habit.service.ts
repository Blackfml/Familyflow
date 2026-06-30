import { Habit } from "../../src/types";
import { habitRepository } from "../repositories";
import { NotFoundError, ValidationError } from "../types/errors";
import { stateService } from "./state.service";

const HABIT_POINTS = 15;

export const habitService = {
  async list(familyId: string): Promise<Habit[]> {
    return habitRepository.findByFamily(familyId);
  },

  async toggle(
    familyId: string,
    habitId: string,
    dateStr: string,
    completed: boolean,
    userName?: string
  ): Promise<Habit> {
    const existing = await habitRepository.findById(familyId, habitId);
    if (!existing) throw new NotFoundError("Hábito", habitId);

    if (!existing.history) existing.history = {};
    existing.history[dateStr] = completed;

    if (completed) {
      existing.streak += 1;
      if (userName) {
        const state = stateService.get();
        if (state.users[userName]) {
          state.users[userName].points += HABIT_POINTS;
        }
        await stateService.save();
      }
    } else {
      existing.streak = Math.max(0, existing.streak - 1);
    }

    await habitRepository.update(familyId, habitId, existing);
    return existing;
  },

  async remove(familyId: string, habitId: string): Promise<void> {
    const existing = await habitRepository.findById(familyId, habitId);
    if (!existing) throw new NotFoundError("Hábito", habitId);
    await habitRepository.remove(familyId, habitId);
  },
};

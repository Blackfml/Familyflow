import { CalendarEvent } from "../../src/types";
import { eventRepository } from "../repositories";
import { ValidationError } from "../types/errors";

export const eventService = {
  async list(familyId: string): Promise<CalendarEvent[]> {
    return eventRepository.findByFamily(familyId);
  },

  async create(familyId: string, data: Partial<CalendarEvent>, creatorName: string): Promise<CalendarEvent> {
    if (!data.title || !data.date || !data.startTime) {
      throw new ValidationError("Título, data e horário são obrigatórios");
    }

    const newEvent: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime || data.startTime,
      responsible: data.responsible || "Ambos",
      category: data.category || "Compromisso",
      cost: data.cost || 0,
    };

    return eventRepository.create(familyId, newEvent);
  },
};

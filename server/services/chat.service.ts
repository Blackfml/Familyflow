import { GroupMessage } from "../../src/types";
import { chatRepository } from "../repositories";
import { ValidationError } from "../types/errors";

export const chatService = {
  async sendGroupMessage(familyId: string, sender: string, content: string): Promise<GroupMessage> {
    if (!sender || !content) {
      throw new ValidationError("Remetente e mensagem são obrigatórios");
    }

    const newMessage: GroupMessage = {
      id: `gmsg-${Date.now()}`,
      sender,
      content,
      timestamp: new Date().toISOString(),
    };

    return chatRepository.create(familyId, newMessage);
  },
};

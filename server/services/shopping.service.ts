import { ShoppingItem } from "../../src/types";
import { shoppingRepository } from "../repositories";
import { NotFoundError, ValidationError } from "../types/errors";

export const shoppingService = {
  async list(familyId: string): Promise<ShoppingItem[]> {
    return shoppingRepository.findByFamily(familyId);
  },

  async upsert(familyId: string, data: Partial<ShoppingItem>, creatorName: string): Promise<ShoppingItem> {
    if (!data.name) throw new ValidationError("Nome do item é obrigatório");

    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}`,
      name: data.name,
      quantity: data.quantity || 1,
      cost: data.cost || 0,
      purchased: false,
      responsible: data.responsible || "Ambos",
      createdBy: creatorName,
      createdAt: new Date().toISOString(),
    };

    return shoppingRepository.create(familyId, newItem);
  },

  async toggle(familyId: string, itemId: string, purchased: boolean): Promise<void> {
    await shoppingRepository.update(familyId, itemId, { purchased } as Partial<ShoppingItem>);
  },

  async remove(familyId: string, itemId: string): Promise<void> {
    await shoppingRepository.remove(familyId, itemId);
  },
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import VirtualList from "./ui/VirtualList";
import { 
  Apple, 
  Plus, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  ShoppingBag,
  ListPlus,
  Heart,
  AlertCircle
} from "lucide-react";
import { FamilyState, ShoppingItem, UserRole } from "../types";

interface ShoppingViewProps {
  state: FamilyState;
  onAddShoppingItem: (itemData: any) => void;
  onToggleShoppingItem: (id: string, purchased: boolean) => void;
  onDeleteShoppingItem: (id: string) => void;
  currentUser: string;
  autoOpenAddModal?: boolean;
  onAddModalOpened?: () => void;
}

export default function ShoppingView({
  state,
  onAddShoppingItem,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  currentUser,
  autoOpenAddModal,
  onAddModalOpened
}: ShoppingViewProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [cost, setCost] = useState("");
  const [resp, setResp] = useState<UserRole>("Ambos");

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoOpenAddModal) {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (onAddModalOpened) {
        onAddModalOpened();
      }
    }
  }, [autoOpenAddModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;

    onAddShoppingItem({
      name: itemName,
      quantity: parseInt(quantity) || 1,
      cost: parseFloat(cost) || 0,
      responsible: resp,
      createdBy: currentUser,
    });

    // Reset Form
    setItemName("");
    setQuantity("1");
    setCost("");
    setResp("Ambos");
  };

  // Compile totals
  const totalCostEstimate = state.shoppingList.reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 1)), 0);
  const purchasedCost = state.shoppingList
    .filter(item => item.purchased)
    .reduce((sum, item) => sum + ((item.cost || 0) * (item.quantity || 1)), 0);

  return (
    <div id="shopping-section" className="space-y-6 pb-20">
      
      {/* Header card with budget calculations */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-5 rounded-3xl shadow-lg shadow-emerald-100 dark:shadow-none relative overflow-hidden">
        <div className="absolute right-2 bottom-2 opacity-15">
          <ShoppingBag className="w-20 h-20" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">LISTA DE COMPRAS COMPARTILHADA</span>
        <h2 className="text-xl font-bold mt-1">Sincronização em Tempo Real</h2>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20 text-xs font-mono">
          <div>
            <p className="opacity-80 font-sans">Estimativa Total:</p>
            <p className="text-lg font-black mt-0.5">R$ {totalCostEstimate.toFixed(2)}</p>
          </div>
          <div>
            <p className="opacity-80 font-sans">Gasto Efetuado:</p>
            <p className="text-lg font-black mt-0.5 text-emerald-100">R$ {purchasedCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* QUICK ADD FORM */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <ListPlus className="w-4 h-4 text-emerald-600" /> Adicionar Item à Lista
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Nome do Item</label>
              <input 
                ref={inputRef}
                type="text" 
                value={itemName}
                onChange={e => setItemName(e.target.value)}
                placeholder="Ex: Fraldas, Abacate orgânico, Leite..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Quantidade</label>
              <input 
                type="number" 
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="1"
                min="1"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Preço Un. (R$ Opcional)</label>
              <input 
                type="number" 
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white font-mono"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition duration-200 shadow-sm shadow-emerald-500/10"
          >
            Adicionar na Lista (+5 pts)
          </button>
        </form>
      </div>

      {/* SHOPPING LIST BLOCK */}
      <div className="space-y-2">
        {state.shoppingList.length > 0 ? (
          <VirtualList
            items={state.shoppingList}
            itemHeight={80}
            overscan={2}
            className="max-h-[500px]"
            emptyMessage="A lista de compras está vazia!"
            renderItem={(item: ShoppingItem) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm mb-2"
            >
              <div className="flex items-center gap-3">
                {/* Custom round purchase check */}
                <button
                  id={`purchase-item-${item.id}`}
                  onClick={() => onToggleShoppingItem(item.id, !item.purchased)}
                  className={`p-1.5 rounded-lg border transition duration-200 ${item.purchased ? "bg-emerald-650 border-emerald-650 text-white" : "border-slate-300 text-transparent hover:bg-slate-50 dark:hover:bg-slate-850"}`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-current" />
                </button>

                <div>
                  <span className={`text-xs font-bold text-slate-900 dark:text-white ${item.purchased ? "line-through opacity-50 text-slate-400" : ""}`}>
                    {item.name}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                    <span>Qtd: {item.quantity}</span>
                    {item.cost ? (
                      <>
                        <span>•</span>
                        <span>R$ {item.cost.toFixed(2)} cada</span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* Action column */}
              <div className="flex items-center gap-2">
                {item.cost ? (
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-300 font-mono">
                    R$ {(item.cost * item.quantity).toFixed(2)}
                  </span>
                ) : null}
                <button 
                  id={`delete-shopping-${item.id}`}
                  onClick={() => onDeleteShoppingItem(item.id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  title="Excluir item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
            )}
          />
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-6">A lista de compras está vazia! Adicione itens saudáveis.</p>
        )}
      </div>

    </div>
  );
}

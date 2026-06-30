import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";

const ShoppingView = lazy(() => import("../components/ShoppingView"));

export default function ShoppingPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleAddShoppingItem, handleToggleShoppingItem, handleDeleteShoppingItem } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <ShoppingView
        state={state}
        onAddShoppingItem={handleAddShoppingItem}
        onToggleShoppingItem={handleToggleShoppingItem}
        onDeleteShoppingItem={handleDeleteShoppingItem}
        currentUser={currentUser}
      />
    </Suspense>
  );
}

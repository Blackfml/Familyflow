import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";

const HabitsView = lazy(() => import("../components/HabitsView"));

export default function HabitsPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleToggleHabit, handleAddHabit, handleDeleteHabit } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <HabitsView
        state={state}
        onToggleHabit={handleToggleHabit}
        onAddHabit={handleAddHabit}
        onDeleteHabit={handleDeleteHabit}
        currentUser={currentUser}
      />
    </Suspense>
  );
}

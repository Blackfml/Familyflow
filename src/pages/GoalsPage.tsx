import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";

const GoalsView = lazy(() => import("../components/GoalsView"));

export default function GoalsPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleAddGoal } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <GoalsView
        state={state}
        onAddGoal={handleAddGoal}
        currentUser={currentUser}
      />
    </Suspense>
  );
}

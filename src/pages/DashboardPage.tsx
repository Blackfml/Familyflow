import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { useFlowActions } from "../hooks/useFlowActions";

const HomeDashboard = lazy(() => import("../components/HomeDashboard"));

export default function DashboardPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const {
    handleToggleHabit,
    handleReorganizeAI,
    aiLoading,
    aiRecommendation,
    handleSaveTask,
  } = useFlowActions();

  if (!state) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <Suspense fallback={null}>
      <HomeDashboard
        state={state}
        currentUser={currentUser}
        onSwitchUser={(user) => useAuthStore.getState().setCurrentUser(user)}
        onAddTaskClick={() => useUIStore.getState().setActiveTab("Tasks")}
        onNavigate={(tab) => useUIStore.getState().setActiveTab(tab)}
        onQuickToggleHabit={(habitId) => handleToggleHabit(habitId, today, true)}
        onQuickCompleteTask={(taskId) => handleSaveTask({ id: taskId, status: "Concluída" })}
        onReorganizeAI={handleReorganizeAI}
        aiLoading={aiLoading}
        aiRecommendation={aiRecommendation}
      />
    </Suspense>
  );
}

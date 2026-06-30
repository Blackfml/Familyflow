import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";

const TasksView = lazy(() => import("../components/TasksView"));

export default function TasksPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleSaveTask, handleDeleteTask } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <TasksView
        state={state}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        currentUser={currentUser}
      />
    </Suspense>
  );
}

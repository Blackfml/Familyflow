import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";

const TimelineAgenda = lazy(() => import("../components/TimelineAgenda"));

export default function AgendaPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleAddCalendarEvent } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <TimelineAgenda
        state={state}
        onAddEvent={handleAddCalendarEvent}
        currentUser={currentUser}
      />
    </Suspense>
  );
}

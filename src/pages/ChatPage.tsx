import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";

const FamilyChatView = lazy(() => import("../components/FamilyChatView"));

export default function ChatPage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleSendGroupMessage, aiLoading } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <FamilyChatView
        state={state}
        currentUser={currentUser}
        onSendGroupMessage={handleSendGroupMessage}
        chatLoading={aiLoading}
      />
    </Suspense>
  );
}

import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useFlowActions } from "../hooks/useFlowActions";

const AIChatView = lazy(() => import("../components/AIChatView"));

export default function AIPage() {
  const state = useFamilyStore((s) => s.state);
  const {
    handleSendChatMessage,
    handleReorganizeAI,
    handleAnalyzeWorkloadAI,
    handleWeeklyMeetingAI,
    aiLoading,
  } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <AIChatView
        state={state}
        onSendChatMessage={handleSendChatMessage}
        onReorganizeAI={handleReorganizeAI}
        onAnalyzeWorkloadAI={handleAnalyzeWorkloadAI}
        onWeeklyMeetingAI={handleWeeklyMeetingAI}
        chatLoading={aiLoading}
      />
    </Suspense>
  );
}

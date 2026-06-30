import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useFlowActions } from "../hooks/useFlowActions";
import { UserProfile, FamilyState } from "../types";

const AuthScreen = lazy(() => import("../components/AuthScreen"));

export default function AuthPage() {
  const state = useFamilyStore((s) => s.state);
  const { handleDeleteProfile } = useFlowActions();

  return (
    <Suspense fallback={null}>
      <AuthScreen
        state={state}
        onRegisterSuccess={(newUser: UserProfile, updatedState: FamilyState) => {
          useFamilyStore.getState().setState(updatedState);
          useAuthStore.getState().setCurrentUser(newUser.name);
        }}
        onSelectUser={(name: string) => useAuthStore.getState().setCurrentUser(name)}
        onDeleteProfile={handleDeleteProfile}
      />
    </Suspense>
  );
}

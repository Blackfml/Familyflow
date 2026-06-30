import { Suspense, lazy } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { useFlowActions } from "../hooks/useFlowActions";

const ProfileSettingsView = lazy(() => import("../components/ProfileSettingsView"));

export default function ProfilePage() {
  const state = useFamilyStore((s) => s.state);
  const currentUser = useAuthStore((s) => s.currentUser);
  const darkMode = useUIStore((s) => s.darkMode);
  const {
    handleResetState,
    toggleDarkMode,
    handleDeleteProfile,
  } = useFlowActions();

  if (!state) return null;

  return (
    <Suspense fallback={null}>
      <ProfileSettingsView
        state={state}
        currentUser={currentUser}
        onSwitchUser={(user) => useAuthStore.getState().setCurrentUser(user)}
        onResetState={handleResetState}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={() => useAuthStore.getState().logout()}
        onDeleteProfile={handleDeleteProfile}
      />
    </Suspense>
  );
}

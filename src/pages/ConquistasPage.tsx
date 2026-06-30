import { Suspense, lazy } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const BadgesDisplay = lazy(() => import("../components/BadgesDisplay"));
const Leaderboard = lazy(() => import("../components/Leaderboard"));

export default function ConquistasPage() {
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Conquistas</h2>
        <p className="text-xs text-slate-400 font-medium mt-1">Badges, nível e leaderboard</p>
      </div>
      <Suspense fallback={null}>
        <BadgesDisplay userId={currentUser} />
      </Suspense>
      <Suspense fallback={null}>
        <Leaderboard currentUserId={currentUser} />
      </Suspense>
    </div>
  );
}

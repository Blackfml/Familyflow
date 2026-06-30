import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AgendaPage = lazy(() => import("./pages/AgendaPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const HabitsPage = lazy(() => import("./pages/HabitsPage"));
const ShoppingPage = lazy(() => import("./pages/ShoppingPage"));
const AIPage = lazy(() => import("./pages/AIPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ConquistasPage = lazy(() => import("./pages/ConquistasPage"));

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Suspense fallback={null}><DashboardPage /></Suspense> },
      { path: "agenda", element: <Suspense fallback={null}><AgendaPage /></Suspense> },
      { path: "tarefas", element: <Suspense fallback={null}><TasksPage /></Suspense> },
      { path: "objetivos", element: <Suspense fallback={null}><GoalsPage /></Suspense> },
      { path: "habitos", element: <Suspense fallback={null}><HabitsPage /></Suspense> },
      { path: "compras", element: <Suspense fallback={null}><ShoppingPage /></Suspense> },
      { path: "ia", element: <Suspense fallback={null}><AIPage /></Suspense> },
      { path: "chat", element: <Suspense fallback={null}><ChatPage /></Suspense> },
      { path: "conquistas", element: <Suspense fallback={null}><ConquistasPage /></Suspense> },
      { path: "perfil", element: <Suspense fallback={null}><ProfilePage /></Suspense> },
    ],
  },
]);

export default routes;

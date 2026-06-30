import { useState, useEffect } from "react";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import { realtimeService } from "../services/realtime";

export function useRealtime() {
  const fetchState = useFamilyStore((s) => s.fetchState);
  const token = useAuthStore((s) => s.token);
  const addFloatingAlert = useNotificationStore((s) => s.addFloatingAlert);

  useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchState();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchState]);

  useEffect(() => {
    if (!token) return;

    realtimeService.onStateUpdate(() => {
      fetchState();
    });

    realtimeService.onNotification((data) => {
      addFloatingAlert({
        title: data.title || "Notificação",
        body: data.body || "",
        type: "notification",
      });
    });

    realtimeService.connect(token);

    return () => {
      realtimeService.disconnect();
    };
  }, [token, fetchState, addFloatingAlert]);
}

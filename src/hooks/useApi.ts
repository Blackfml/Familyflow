import { useState, useCallback } from "react";
import { api } from "../services/api";
import { useFamilyStore } from "../stores/useFamilyStore";
import { useNotificationStore } from "../stores/useNotificationStore";

type ApiMethod = "get" | "post" | "put" | "delete";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const updateState = useFamilyStore((s) => s.setState);

  const request = useCallback(async <T>(method: ApiMethod, path: string, body?: any): Promise<T> => {
    setLoading(true);
    try {
      const data = await (api as any)[method](path, body);
      if (data.state) updateState(data.state);
      return data;
    } finally {
      setLoading(false);
    }
  }, [updateState]);

  const post = <T>(path: string, body?: any) => request<T>("post", path, body);
  const del = <T>(path: string) => request<T>("delete", path);
  const get = <T>(path: string) => request<T>("get", path);

  return { loading, post, del, get };
}

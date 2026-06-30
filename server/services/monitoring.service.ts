import { stateService } from "./state.service";

interface Metric {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  memory: { used: number; total: number; percentage: number };
  lastError?: string;
  services: {
    api: boolean;
    gemini: boolean;
    firebase?: boolean;
    memory: boolean;
  };
}

const startTime = Date.now();
let metricsStore: Metric[] = [];
let lastError: string | undefined;

export const monitoringService = {
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    metricsStore.push({
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
    });
    if (metricsStore.length > 10000) {
      metricsStore = metricsStore.slice(-5000);
    }
  },

  getMetrics(name?: string, minutes = 60): Metric[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    let filtered = metricsStore.filter((m) => new Date(m.timestamp).getTime() >= cutoff);
    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }
    return filtered;
  },

  checkHealth(): HealthCheckResult {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const percentage = totalMem > 0 ? Math.round((usedMem / totalMem) * 100) : 0;

    const apiOk = true;
    const geminiOk = !!process.env.GEMINI_API_KEY;
    const memoryOk = percentage < 90;

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (percentage > 80) {
      status = "degraded";
    }
    if (percentage > 95) {
      status = "unhealthy";
    }

    return {
      status,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: {
        used: usedMem,
        total: totalMem,
        percentage,
      },
      lastError,
      services: {
        api: apiOk,
        gemini: geminiOk,
        memory: memoryOk,
      },
    };
  },

  getAverageResponseTime(endpoint: string): number {
    const metrics = metricsStore.filter(
      (m) => m.name === "response_time" && m.tags?.endpoint === endpoint
    );
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round((sum / metrics.length) * 100) / 100;
  },

  getErrorRate(): number {
    const total = metricsStore.filter((m) => m.name === "response_time").length;
    if (total === 0) return 0;
    const errors = metricsStore.filter(
      (m) => m.name === "response_time" && (m.tags?.status || "200").startsWith("5")
    ).length;
    return Math.round((errors / total) * 10000) / 100;
  },

  recordError(error: string): void {
    lastError = error;
  },
};

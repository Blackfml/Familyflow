import { describe, it, expect, beforeEach } from "vitest";

type AIMode = "correria" | "foco" | "familia";

const MODE_PROMPTS: Record<AIMode, string> = {
  correria: "Modo CORRERIA ativado. A família está com pouco tempo. Priorize tarefas urgentes.",
  foco: "Modo FOCO ativado. A família precisa de concentração. Sugira blocos de trabalho profundo.",
  familia: "Modo FAMILIA ativado (padrão). Equilíbrio entre tarefas e convivência.",
};

let currentMode: AIMode = "familia";

function getMode(): AIMode {
  return currentMode;
}

function setMode(mode: AIMode): void {
  currentMode = mode;
}

function getModePrompt(mode: AIMode): string {
  return MODE_PROMPTS[mode] || MODE_PROMPTS.familia;
}

describe("AI Modes Service", () => {
  beforeEach(() => {
    currentMode = "familia";
  });

  describe("getMode", () => {
    it("returns default mode as familia", () => {
      expect(getMode()).toBe("familia");
    });

    it("returns current mode after change", () => {
      setMode("correria");
      expect(getMode()).toBe("correria");
    });
  });

  describe("setMode", () => {
    it("changes mode to correria", () => {
      setMode("correria");
      expect(getMode()).toBe("correria");
    });

    it("changes mode to foco", () => {
      setMode("foco");
      expect(getMode()).toBe("foco");
    });

    it("changes mode to familia", () => {
      setMode("correria");
      setMode("familia");
      expect(getMode()).toBe("familia");
    });
  });

  describe("getModePrompt", () => {
    it("returns correria prompt for correria mode", () => {
      expect(getModePrompt("correria")).toContain("urgentes");
    });

    it("returns foco prompt for foco mode", () => {
      expect(getModePrompt("foco")).toContain("profundo");
    });

    it("returns familia prompt for familia mode", () => {
      expect(getModePrompt("familia")).toContain("Equilíbrio");
    });

    it("falls back to familia for unknown mode", () => {
      expect(getModePrompt("unknown" as AIMode)).toContain("Equilíbrio");
    });
  });

  describe("mode prompts content", () => {
    it("all prompts are non-empty strings", () => {
      Object.values(MODE_PROMPTS).forEach(prompt => {
        expect(prompt.length).toBeGreaterThan(0);
      });
    });

    it("correria mentions critical focus", () => {
      expect(MODE_PROMPTS.correria).toContain("urgentes");
    });

    it("foco mentions concentration", () => {
      expect(MODE_PROMPTS.foco).toContain("concentração");
    });

    it("familia mentions balance", () => {
      expect(MODE_PROMPTS.familia).toContain("Equilíbrio");
    });

    it("exactly 3 modes defined", () => {
      expect(Object.keys(MODE_PROMPTS)).toHaveLength(3);
    });
  });
});

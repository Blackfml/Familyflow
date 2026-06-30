import { describe, it, expect } from "vitest";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatTime(timeStr: string): string {
  return timeStr;
}

function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    Alta: "red",
    Média: "yellow",
    Baixa: "green",
    Urgente: "red",
  };
  return map[priority] || "slate";
}

function getStatusColor(status: string): string {
  if (status === "Concluído") return "emerald";
  if (status === "A Fazer") return "blue";
  return "amber";
}

describe("Formatters", () => {
  describe("formatDate", () => {
    it("formats date string to pt-BR locale", () => {
      const d = formatDate("2026-06-30T12:00:00.000Z");
      expect(d).toBe("30/06/2026");
    });

    it("handles ISO date strings with time", () => {
      const d = formatDate("2026-06-30T12:00:00.000Z");
      expect(d).toBe("30/06/2026");
    });

    it("returns valid date format dd/mm/yyyy", () => {
      const d = formatDate("2026-01-01T12:00:00.000Z");
      expect(d).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("formats last day of year correctly", () => {
      const d = formatDate("2026-12-31T12:00:00.000Z");
      expect(d).toBe("31/12/2026");
    });

    it("returns Invalid Date for bad input", () => {
      const d = new Date("not-a-date");
      expect(d.toString()).toBe("Invalid Date");
    });
  });

  describe("formatTime", () => {
    it("returns the time string unchanged", () => {
      expect(formatTime("14:30")).toBe("14:30");
    });

    it("handles empty time string", () => {
      expect(formatTime("")).toBe("");
    });
  });

  describe("getPriorityColor", () => {
    it("returns red for Alta priority", () => {
      expect(getPriorityColor("Alta")).toBe("red");
    });

    it("returns yellow for Média priority", () => {
      expect(getPriorityColor("Média")).toBe("yellow");
    });

    it("returns green for Baixa priority", () => {
      expect(getPriorityColor("Baixa")).toBe("green");
    });

    it("returns red for Urgente priority", () => {
      expect(getPriorityColor("Urgente")).toBe("red");
    });

    it("returns slate for unknown priority", () => {
      expect(getPriorityColor("Unknown")).toBe("slate");
    });

    it("is case sensitive", () => {
      expect(getPriorityColor("alta")).toBe("slate");
    });
  });

  describe("getStatusColor", () => {
    it("returns emerald for Concluído", () => {
      expect(getStatusColor("Concluído")).toBe("emerald");
    });

    it("returns blue for A Fazer", () => {
      expect(getStatusColor("A Fazer")).toBe("blue");
    });

    it("returns amber for other statuses", () => {
      expect(getStatusColor("Em andamento")).toBe("amber");
      expect(getStatusColor("Cancelado")).toBe("amber");
    });

    it("returns amber for empty status", () => {
      expect(getStatusColor("")).toBe("amber");
    });
  });
});

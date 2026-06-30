import fs from "fs";
import path from "path";

export type AIMode = "correria" | "foco" | "familia";

const MODE_FILE = path.join(process.cwd(), "server/data/ai_mode.json");

let cachedMode: AIMode | null = null;

function readMode(): AIMode {
  if (cachedMode) return cachedMode;
  try {
    if (fs.existsSync(MODE_FILE)) {
      const data = JSON.parse(fs.readFileSync(MODE_FILE, "utf-8"));
      cachedMode = data.mode || "familia";
      return cachedMode;
    }
  } catch {
    console.warn("Mode file corrupted, using default.");
  }
  return "familia";
}

function writeMode(mode: AIMode) {
  cachedMode = mode;
  const dir = path.dirname(MODE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MODE_FILE, JSON.stringify({ mode }, null, 2), "utf-8");
}

const MODE_PROMPTS: Record<AIMode, string> = {
  correria: `Modo CORRERIA ativado. A família está com pouco tempo.
Priorize tarefas urgentes e minimize sugestões não essenciais.
Seja direto(a), objetivo(a) e foque no que é crítico.
Evite planejamento de longo prazo. Foco no imediato.`,

  foco: `Modo FOCO ativado. A família precisa de concentração.
Sugira blocos de trabalho profundo (deep work).
Evite sugestões de pausas, distrações ou tarefas sociais.
Ajude a eliminar interrupções e otimizar a produtividade individual.`,

  familia: `Modo FAMILIA ativado (padrão). Equilíbrio entre tarefas e convivência.
Sugira atividades que ambos possam fazer juntos.
Incentive a divisão justa de tarefas e momentos de qualidade.`,
};

export const aiModesService = {
  getMode(): AIMode {
    return readMode();
  },

  setMode(mode: AIMode): void {
    writeMode(mode);
  },

  getModePrompt(mode: AIMode): string {
    return MODE_PROMPTS[mode] || MODE_PROMPTS.familia;
  },
};

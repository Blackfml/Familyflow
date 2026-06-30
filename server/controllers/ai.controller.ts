import { Request, Response } from "express";
import { stateService } from "../services/state.service";
import { aiService } from "../services/ai.service";
import { aiToolsService } from "../services/ai-tools.service";
import { aiModesService } from "../services/ai-modes.service";
import { aiMemoryService } from "../services/ai-memory.service";

export const aiController = {
  async chat(req: Request, res: Response) {
    const { prompt, chatHistory } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt é obrigatório" });
      return;
    }

    try {
      const userName = (req as any).userName || "Usuário";
      const result = await aiService.chat({ prompt, chatHistory, userName });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: "Erro ao processar mensagem" });
    }
  },

  async chatStream(req: Request, res: Response) {
    const { prompt, chatHistory } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt é obrigatório" });
      return;
    }

    const userName = (req as any).userName || "Usuário";

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    try {
      const stream = await aiService.chatStream({ prompt, chatHistory, userName });
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: "Erro no streaming" })}\n\n`);
      res.end();
    }
  },

  async getMode(req: Request, res: Response) {
    const mode = aiModesService.getMode();
    res.json({ mode });
  },

  async setMode(req: Request, res: Response) {
    const { mode } = req.body;
    if (!mode || !["correria", "foco", "familia"].includes(mode)) {
      res.status(400).json({ error: "Modo inválido. Use: correria, foco ou familia" });
      return;
    }
    aiModesService.setMode(mode);
    res.json({ mode, message: `Modo "${mode}" ativado` });
  },

  async reorganize(req: Request, res: Response) {
    try {
      const result = await aiToolsService.execute("reorganizeSchedule", { userName: (req as any).userName || "IA" });
      const recommendation = `### 🤖 Sugestão de Reorganização\n\nCom base na prioridade, sugiro a seguinte ordem:\n\n${result.suggestion.join("\n")}`;
      res.json({ recommendation, state: stateService.get() });
    } catch {
      res.status(500).json({ error: "Erro ao reorganizar agenda" });
    }
  },

  async analyzeWorkload(req: Request, res: Response) {
    try {
      const result = await aiToolsService.execute("getWorkloadBalance", {});
      const analysis = `### 📊 Análise de Carga de Trabalho\n\n${result.analysis.map((a: any) => `- **${a.name}**: ${a.pendingTasks} tarefa(s) pendente(s), ${a.points} pontos`).join("\n") || "Nenhuma tarefa pendente."}`;
      res.json({ analysis, state: stateService.get() });
    } catch {
      res.status(500).json({ error: "Erro ao analisar carga de trabalho" });
    }
  },

  async weeklyMeeting(req: Request, res: Response) {
    try {
      const result = await aiToolsService.execute("generateWeeklyReport", {});
      const state = stateService.get();
      const summary = `### 📅 Resumo da Reunião Semanal\n\n**Tarefas Concluídas (7 dias):** ${result.completedTasks}\n**Tarefas Pendentes:** ${result.pendingTasks}\n\n**Top Hábitos:**\n${result.topHabits.map((h: any) => `- ${h.title}: ${h.streak} dias`).join("\n")}`;
      state.lastWeeklyMeetingSummary = summary;
      await stateService.save();
      res.json({ summary, state });
    } catch {
      res.status(500).json({ error: "Erro ao gerar reunião semanal" });
    }
  },
};

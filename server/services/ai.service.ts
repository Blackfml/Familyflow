import { GoogleGenAI } from "@google/genai";
import { ai } from "../config/ai";
import { stateService } from "./state.service";
import { aiMemoryService } from "./ai-memory.service";
import { aiToolsService } from "./ai-tools.service";
import { aiModesService } from "./ai-modes.service";
import { ChatMessage } from "../../src/types";

function getFamilyContextString(): string {
  const state = stateService.get();
  const userNames = Object.keys(state.users);
  const namesStr = userNames.length > 0 ? userNames.join(" e ") : "o casal";

  const mode = aiModesService.getMode();
  const modePrompt = aiModesService.getModePrompt(mode);

  return `
Você é o assistente virtual "FamilyFlow AI" encarregado de ajudar o casal ${namesStr} a organizar sua rotina, tarefas, metas, hábitos, finanças e divisão de trabalho.

${modePrompt}

USUÁRIOS E PONTOS:
${Object.values(state.users).map(u => `- ${u.name}: Nível ${u.level}, ${u.points} pontos, streak ${u.streak} dias.`).join("\n")}

TAREFAS ATIVAS:
${state.tasks.filter(t => t.status !== "Concluído").map((t, i) => `
Tarefa ${i + 1}: "${t.title}" - Responsável: ${t.responsible} - Prioridade: ${t.priority} - Status: ${t.status}`).join("\n")}

METAS:
${state.goals.map(g => `- "${g.title}": ${g.progress}% concluído`).join("\n")}

HÁBITOS:
${state.habits.map(h => `- "${h.title}": Streak ${h.streak} dias`).join("\n")}

FERRAMENTAS DISPONÍVEIS:
${aiToolsService.getToolDescriptions()}

MEMÓRIAS RECENTES:
${aiMemoryService.getContextString()}

REGRAS:
- Sempre responda em PORTUGUÊS BRASILEIRO com markdown amigável.
- Use as ferramentas disponíveis quando o usuário pedir uma ação específica.
- Se não tiver uma ferramenta para a ação, responda com conversa normal.
`;
}

function getLocalFallbackChat(prompt: string): string {
  const state = stateService.get();
  const pending = state.tasks.filter(t => t.status !== "Concluído");
  const p = prompt.toLowerCase();

  if (p.includes("tarefa") || p.includes("fazer")) {
    return `### 📋 Visão Geral das Tarefas Ativas\n\nOlá! Vocês têm **${pending.length}** tarefas pendentes.\n\n${pending.slice(0, 3).map(t => `- **${t.title}** (${t.responsible}, ${t.priority})`).join("\n")}`;
  }

  if (p.includes("meta") || p.includes("poup")) {
    return `### 🎯 Metas\n\n${state.goals.map(g => `- **${g.title}**: ${g.progress}%`).join("\n") || "Nenhuma meta ativa."}`;
  }

  if (p.includes("hábito") || p.includes("habito") || p.includes("rotina")) {
    return `### ⚡ Hábitos\n\n${state.habits.map(h => `- **${h.title}**: ${h.streak} dias seguidos!`).join("\n") || "Nenhum hábito ativo."}`;
  }

  return `### 👋 Olá! Sou o FamilyFlow AI\n\nComo posso ajudar vocês hoje?\n1. Ver tarefas pendentes\n2. Analisar metas\n3. Reorganizar agenda\n4. Sugerir redistribuição de tarefas`;
}

export const aiService = {
  async chat(reqBody: { prompt: string; chatHistory?: ChatMessage[]; userName?: string }): Promise<{ reply: string; state: any }> {
    const { prompt, chatHistory, userName } = reqBody;
    if (!prompt) {
      return { reply: "Prompt é obrigatório", state: stateService.get() };
    }

    let reply = "";

    try {
      const intent = await aiToolsService.detectIntent(prompt);
      if (intent && intent.tool && intent.tool !== "getTasks") {
        const toolResult = await aiToolsService.execute(intent.tool, { ...intent.args, userName });
        reply = typeof toolResult.message === "string" ? toolResult.message : JSON.stringify(toolResult, null, 2);
        await aiMemoryService.remember(`tool-${intent.tool}-${Date.now()}`, `Executou ${intent.tool}: ${reply}`, "context");
      } else {
        const context = getFamilyContextString();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [{
            role: "user",
            parts: [{ text: `${context}\n\nHistórico recente:\n${(chatHistory || []).slice(-6).map((c: any) => `${c.role === "user" ? "Usuário" : "Assistente"}: ${c.content}`).join("\n")}\n\nMensagem: "${prompt}"` }]
          }]
        });
        reply = response.text || "Desculpe, não consegui processar.";
        await aiMemoryService.remember(`conversa-${Date.now()}`, `Usuário perguntou: "${prompt}". Resposta gerada.`, "context");
      }
    } catch (err: any) {
      console.warn("AI service fallback:", err.message);
      reply = getLocalFallbackChat(prompt);
    }

    const state = stateService.get();
    const userMsg: ChatMessage = { id: `chat-usr-${Date.now()}`, role: "user", content: prompt, timestamp: new Date().toISOString() };
    const botMsg: ChatMessage = { id: `chat-bot-${Date.now()}`, role: "model", content: reply, timestamp: new Date().toISOString() };
    state.chatHistory.push(userMsg, botMsg);
    await stateService.save();

    return { reply, state };
  },

  async chatStream(reqBody: { prompt: string; chatHistory?: ChatMessage[]; userName?: string }): Promise<AsyncIterable<string>> {
    const { prompt, chatHistory, userName } = reqBody;

    const state = stateService.get();
    const context = getFamilyContextString();

    const fullPrompt = `${context}\n\nHistórico recente:\n${(chatHistory || []).slice(-6).map((c: any) => `${c.role === "user" ? "Usuário" : "Assistente"}: ${c.content}`).join("\n")}\n\nMensagem: "${prompt}"`;

    async function* generate() {
      let fullReply = "";
      try {
        const response = await ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });
        for await (const chunk of response) {
          const text = chunk.text || "";
          fullReply += text;
          yield text;
        }
      } catch (err: any) {
        console.warn("Stream fallback:", err.message);
        const fallback = getLocalFallbackChat(prompt);
        fullReply = fallback;
        yield fallback;
      }

      const userMsg: ChatMessage = { id: `chat-usr-${Date.now()}`, role: "user", content: prompt, timestamp: new Date().toISOString() };
      const botMsg: ChatMessage = { id: `chat-bot-${Date.now()}`, role: "model", content: fullReply, timestamp: new Date().toISOString() };
      state.chatHistory.push(userMsg, botMsg);
      await stateService.save();
    }

    return generate();
  },
};

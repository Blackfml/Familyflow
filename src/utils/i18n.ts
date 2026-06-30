const translations = {
  pt: {
    nav: { home: "Home", agenda: "Agenda", tarefas: "Tarefas", chat: "Chat", ia: "Gemini", perfil: "Perfil" },
    task: { title: "Tarefas", add: "Nova Tarefa", empty: "Nenhuma tarefa pendente", status: { todo: "A Fazer", doing: "Em andamento", done: "Concluído" } },
    goal: { title: "Objetivos", add: "Nova Meta", empty: "Nenhum objetivo definido" },
    habit: { title: "Hábitos", add: "Novo Hábito", empty: "Nenhum hábito ativo" },
    shopping: { title: "Compras", add: "Novo Item", empty: "Lista vazia" },
    agenda: { title: "Agenda", add: "Novo Evento", empty: "Nenhum evento hoje" },
    auth: { login: "Acessar Perfil", register: "Cadastrar Perfil", email: "E-mail", password: "Senha" },
    common: { loading: "Carregando...", error: "Erro", success: "Sucesso", save: "Salvar", cancel: "Cancelar", delete: "Excluir", confirm: "Confirmar" },
  },
};

type Lang = keyof typeof translations;
let currentLang: Lang = "pt";

export function setLanguage(lang: Lang) {
  currentLang = lang;
}

export function t(path: string): string {
  const keys = path.split(".");
  let value: any = translations[currentLang];
  for (const key of keys) {
    value = value?.[key];
  }
  return typeof value === "string" ? value : path;
}

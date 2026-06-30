import { Request, Response } from "express";
import { stateService } from "../services/state.service";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, avatar, provider, gender } = req.body;
    if (!name) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }

    const state = stateService.get();
    const id = `user-${Date.now()}`;
    const now = new Date().toISOString();

    const newUser = {
      id,
      name,
      avatar: avatar || "",
      points: 0,
      level: 1,
      streak: 0,
      streakUpdatedAt: now.split("T")[0],
      email: email || "",
      provider: provider || "Email",
      gender: gender || "Masculino",
    };

    stateService.addUser(name, newUser);

    const token = authService.generateToken({ uid: id, name, email });

    state.history.unshift({
      id: `hist-${Date.now()}`,
      userName: name,
      action: "criou seu perfil",
      targetName: name,
      targetType: "general",
      timestamp: now,
    });

    await stateService.save();
    res.json({ message: "Perfil criado com sucesso!", user: newUser, token, state });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: "E-mail ou nome é obrigatório" });
      return;
    }

    const state = stateService.get();
    const query = email.trim().toLowerCase();
    const matchedUser = Object.values(state.users).find(
      (u: any) =>
        (u.email && u.email.toLowerCase() === query) ||
        (u.name && u.name.toLowerCase() === query)
    );

    if (!matchedUser) {
      res.status(401).json({ error: "Perfil não encontrado" });
      return;
    }

    const token = authService.generateToken({
      uid: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
    });

    res.json({ message: "Acesso autorizado!", user: matchedUser, token, state });
  },

  async firebaseAuth(req: Request, res: Response) {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ error: "Token Firebase é obrigatório" });
      return;
    }

    try {
      const payload = await authService.validateFirebaseToken(idToken);
      const state = stateService.get();

      let matchedUser = Object.values(state.users).find(
        (u) => u.email?.toLowerCase() === payload.email?.toLowerCase() || u.uid === payload.uid
      );

      if (!matchedUser) {
        const now = new Date().toISOString();
        matchedUser = {
          id: `user-${Date.now()}`,
          name: payload.name,
          avatar: "",
          points: 0,
          level: 1,
          streak: 0,
          streakUpdatedAt: now.split("T")[0],
          email: payload.email || "",
          provider: "Google",
          uid: payload.uid,
        };

        stateService.addUser(matchedUser.name, matchedUser);
        state.history.unshift({
          id: `hist-${Date.now()}`,
          userName: matchedUser.name,
          action: "criou seu perfil via Firebase",
          targetName: matchedUser.name,
          targetType: "general",
          timestamp: now,
        });
      }

      const token = authService.generateToken({
        uid: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
      });

      await stateService.save();
      res.json({ message: "Autenticado com Firebase!", user: matchedUser, token, state });
    } catch (err: any) {
      res.status(401).json({ error: err.message || "Token Firebase inválido" });
    }
  },

  async deleteProfile(req: Request, res: Response) {
    const name = decodeURIComponent(req.params.name);
    const state = stateService.get();

    if (!state.users[name]) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    stateService.removeUser(name);

    state.history.unshift({
      id: `hist-${Date.now()}`,
      userName: "Sistema",
      action: "excluiu o perfil",
      targetName: name,
      targetType: "general",
      timestamp: new Date().toISOString(),
    });

    await stateService.save();
    res.json({ message: "Perfil excluído com sucesso!", state });
  },
};

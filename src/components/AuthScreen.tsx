import React, { useState, useRef } from "react";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Upload,
  Check,
  ArrowRight,
  ShieldCheck,
  Info,
  Trash2,
  LockKeyhole,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyState, UserProfile } from "../types";
import { authService } from "../services/auth";

interface AuthScreenProps {
  state: FamilyState | null;
  onRegisterSuccess: (newUser: UserProfile, updatedState: FamilyState) => void;
  onSelectUser: (name: string) => void;
  onDeleteProfile: (name: string) => void;
}

export default function AuthScreen({ state, onRegisterSuccess, onSelectUser, onDeleteProfile }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [provider, setProvider] = useState<"Email" | "Google" | "Apple">("Email");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("A imagem deve ter menos de 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setErrorMsg(null);
      };
      reader.onerror = () => {
        setErrorMsg("Erro ao ler o arquivo de imagem.");
      };
      reader.readAsDataURL(file);
    }
  };

  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setErrorMsg("O email é obrigatório.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await authService.signInWithEmail(loginEmail.trim(), loginPassword);
      onSelectUser(data.user.name);
    } catch (err: any) {
      const message = err.message || "Erro de login.";
      if (message.includes("user-not-found") || message.includes("wrong-password") || message.includes("invalid-credential")) {
        setErrorMsg("Email ou senha incorretos.");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("O nome do perfil é obrigatório.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("O email é obrigatório.");
      return;
    }
    if (!password) {
      setErrorMsg("A senha é obrigatória.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await authService.registerWithEmail(email.trim(), password);
      const userWithAvatar = { ...data.user, avatar: avatar || data.user.avatar || "" };
      onRegisterSuccess(userWithAvatar, data.state);

      setName("");
      setEmail("");
      setPassword("");
      setAvatar("");
    } catch (err: any) {
      const message = err.message || "Erro no registro.";
      if (message.includes("email-already-in-use")) {
        setErrorMsg("Este email já está cadastrado.");
      } else if (message.includes("weak-password")) {
        setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await authService.signInWithGoogle();
      const userWithAvatar = { ...data.user, avatar: avatar || data.user.avatar || "" };
      onRegisterSuccess(userWithAvatar, data.state);
    } catch (err: any) {
      const message = err.message || "Erro na autenticação com Google.";
      if (!message.includes("popup-closed-by-user")) {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await authService.signInWithApple();
      const userWithAvatar = { ...data.user, avatar: avatar || data.user.avatar || "" };
      onRegisterSuccess(userWithAvatar, data.state);
    } catch (err: any) {
      const message = err.message || "Erro na autenticação com Apple.";
      if (!message.includes("popup-closed-by-user")) {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const existingUsers = state ? Object.values(state.users) : [];

  return (
    <div className="min-h-screen bg-[#090B14] text-slate-100 flex flex-col items-center justify-center p-6 md:p-12 transition-colors duration-300">
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="text-center mb-10 space-y-3 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Family<span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5 font-medium leading-relaxed">
            Organização mútua, progresso em casal e hábitos gamificados com inteligência.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#151B2C] rounded-[32px] border border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">
        
        <div className="flex p-2 bg-slate-950/40 border-b border-slate-800/60">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
              activeTab === "login" 
                ? "bg-[#151B2C] text-white shadow-sm border border-slate-800" 
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Acessar Perfil {existingUsers.length > 0 && `(${existingUsers.length})`}
          </button>
          
          <button
            onClick={() => {
              setActiveTab("register");
              setProvider("Email");
              setErrorMsg(null);
            }}
            className={`flex-1 py-3.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
              activeTab === "register" 
                ? "bg-[#151B2C] text-white shadow-sm border border-slate-800" 
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            Cadastrar Perfil
          </button>
        </div>

        <div className="p-8 space-y-6">
          
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-2xl border border-red-200/40 dark:border-red-900/40 flex items-start gap-3">
              <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "register" ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                <form onSubmit={handleRegister} className="space-y-4">
                  
                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Nome do Perfil <span className="text-blue-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Alessandro, Brenda, Lucas..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      E-mail <span className="text-blue-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Senha <span className="text-blue-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

<div className="space-y-2">
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Foto de Perfil
                    </label>
                    
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[130px] ${
                        avatar 
                          ? "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10" 
                          : dragOver 
                            ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-750 hover:bg-slate-50/50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {avatar ? (
                        <div className="space-y-2.5 flex flex-col items-center">
                          <img 
                            src={avatar} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[11px] font-black text-emerald-500 flex items-center gap-1.5 uppercase tracking-wider">
                            <Check className="w-4 h-4 stroke-[3]" /> Foto adicionada
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-blue-500" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Clique ou arraste sua foto de perfil
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Formatos PNG, JPG ou GIF de até 2MB.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition duration-200 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
                  >
                    {loading ? "Processando..." : "Criar Minha Conta"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Ou Cadastre-se Com
                  </span>
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <svg className="w-4.5 h-4.5 text-red-500" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.114 15.433 1 12.24 1 5.48 1 0 6.48 0 13s5.48 12 12.24 12c7.054 0 11.75-4.962 11.75-11.95 0-.8-.088-1.41-.198-1.765H12.24Z"/>
                    </svg>
                    Google
                  </button>

                  <button
                    onClick={handleAppleAuth}
                    disabled={loading}
                    className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <svg className="w-4.5 h-4.5 text-slate-900 dark:text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.05-1 .04-2.22.67-2.94 1.52-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.27-.56 3-1.46Z"/>
                    </svg>
                    Apple
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-6"
              >
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      E-mail <span className="text-blue-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Senha <span className="text-blue-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="Sua senha"
                        value={loginPassword}
                        required
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition duration-200 shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
                  >
                    {loading ? "Entrando..." : "Acessar Minha Conta"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Ou Entre Com
                  </span>
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <svg className="w-4.5 h-4.5 text-red-500" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 2.114 15.433 1 12.24 1 5.48 1 0 6.48 0 13s5.48 12 12.24 12c7.054 0 11.75-4.962 11.75-11.95 0-.8-.088-1.41-.198-1.765H12.24Z"/>
                    </svg>
                    Google
                  </button>

                  <button
                    onClick={handleAppleAuth}
                    disabled={loading}
                    className="flex items-center justify-center gap-2.5 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
                  >
                    <svg className="w-4.5 h-4.5 text-slate-900 dark:text-white" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.05-1 .04-2.22.67-2.94 1.52-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.27-.56 3-1.46Z"/>
                    </svg>
                    Apple
                  </button>
                </div>

                <div className="bg-blue-950/20 p-4 rounded-2xl border border-blue-900/20 text-[10.5px] text-slate-400 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">
                    Autenticação segura via Firebase. Seus dados familiares estão protegidos em ambiente criptografado.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-8 text-center max-w-xs flex flex-col items-center gap-1.5 relative z-10 font-semibold">
        <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-blue-500">
          <LockKeyhole className="w-3.5 h-3.5" /> Conexão Criptografada
        </span>
        Seus dados familiares são guardados em nuvem para sincronização em múltiplos aparelhos.
      </div>

    </div>
  );
}

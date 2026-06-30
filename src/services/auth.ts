import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  IdTokenResult,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const API_BASE = "/api";

let currentToken: string | null = (() => {
  try { return localStorage.getItem("familyflow_token"); }
  catch { return null; }
})();

export function getStoredToken(): string | null {
  return currentToken;
}

export function setStoredToken(token: string | null) {
  currentToken = token;
  try {
    if (token) localStorage.setItem("familyflow_token", token);
    else localStorage.removeItem("familyflow_token");
  } catch {}
}

async function exchangeFirebaseToken(idToken: string): Promise<{ token: string; user: any; state: any }> {
  const res = await fetch(`${API_BASE}/auth/firebase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro de autenticação" }));
    throw new Error(err.error || "Falha na autenticação");
  }
  const data = await res.json();
  setStoredToken(data.token);
  return data;
}

async function handleFirebaseUser(user: User): Promise<{ token: string; user: any; state: any }> {
  const idToken = await user.getIdToken();
  return exchangeFirebaseToken(idToken);
}

export const authService = {
  async signInWithGoogle() {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    const result = await signInWithPopup(auth, provider);
    return handleFirebaseUser(result.user);
  },

  async signInWithApple() {
    const auth = getFirebaseAuth();
    const provider = new OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    const result = await signInWithPopup(auth, provider);
    return handleFirebaseUser(result.user);
  },

  async signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    return handleFirebaseUser(result.user);
  },

  async registerWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return handleFirebaseUser(result.user);
  },

  async signOut() {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    setStoredToken(null);
  },
};

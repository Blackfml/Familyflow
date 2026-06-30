import { stateService } from "./state.service";

interface QuietHours {
  start: string;
  end: string;
}

interface ChannelPrefs {
  push: boolean;
  sound: boolean;
  vibration: boolean;
  email: boolean;
  quietHours?: QuietHours;
}

const DEFAULT_CHANNELS: ChannelPrefs = {
  push: true,
  sound: true,
  vibration: true,
  email: false,
};

function getPrefs(userId: string): ChannelPrefs {
  const state = stateService.get();
  const user = state.users[userId];
  if (!user) return { ...DEFAULT_CHANNELS };
  const stored = (user as any).notificationChannels;
  if (stored && typeof stored === "object") {
    return { ...DEFAULT_CHANNELS, ...stored };
  }
  return { ...DEFAULT_CHANNELS };
}

function savePrefs(userId: string, prefs: ChannelPrefs): void {
  const state = stateService.get();
  const user = state.users[userId];
  if (!user) return;
  (user as any).notificationChannels = prefs;
  stateService.save();
}

function parseHHMM(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export const notificationChannelsService = {
  getChannels(userId: string): Record<string, boolean> {
    const prefs = getPrefs(userId);
    return {
      push: prefs.push,
      sound: prefs.sound,
      vibration: prefs.vibration,
      email: prefs.email,
    };
  },

  setChannel(userId: string, channel: string, enabled: boolean): void {
    const prefs = getPrefs(userId);
    if (channel in prefs) {
      (prefs as any)[channel] = enabled;
      savePrefs(userId, prefs);
    }
  },

  setQuietHours(userId: string, start: string, end: string): void {
    const prefs = getPrefs(userId);
    prefs.quietHours = { start, end };
    savePrefs(userId, prefs);
  },

  isInQuietHours(userId: string): boolean {
    const prefs = getPrefs(userId);
    if (!prefs.quietHours) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseHHMM(prefs.quietHours.start);
    const endMinutes = parseHHMM(prefs.quietHours.end);
    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  },

  shouldNotify(userId: string, channel: string): boolean {
    const prefs = getPrefs(userId);
    if ((prefs as any)[channel] === false) return false;
    if (channel === "push" && this.isInQuietHours(userId)) return false;
    return true;
  },
};

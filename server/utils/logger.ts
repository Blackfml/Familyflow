const LOG_PREFIX = "[FamilyFlow]";

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`${LOG_PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`${LOG_PREFIX} ⚠️ ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`${LOG_PREFIX} 🔴 ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`${LOG_PREFIX} 🔍 ${message}`, ...args);
    }
  },
};

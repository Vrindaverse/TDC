type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (context) {
    return `${base} ${JSON.stringify(context)}`;
  }
  return base;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    console.log(formatMessage("info", message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatMessage("warn", message, context));
  },

  error(message: string, context?: LogContext) {
    console.error(formatMessage("error", message, context));
  },

  auth(action: string, context?: LogContext) {
    this.info(`[AUTH] ${action}`, context);
  },

  db(action: string, context?: LogContext) {
    this.debug(`[DB] ${action}`, context);
  },

  admin(action: string, context?: LogContext) {
    this.info(`[ADMIN] ${action}`, context);
  },

  api(route: string, context?: LogContext) {
    this.info(`[API] ${route}`, context);
  },
};

export function createChildLogger(prefix: string) {
  return {
    debug: (message: string, context?: LogContext) => logger.debug(`[${prefix}] ${message}`, context),
    info: (message: string, context?: LogContext) => logger.info(`[${prefix}] ${message}`, context),
    warn: (message: string, context?: LogContext) => logger.warn(`[${prefix}] ${message}`, context),
    error: (message: string, context?: LogContext) => logger.error(`[${prefix}] ${message}`, context),
  };
}
import chalk from 'chalk';

const levels = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

let currentLevel = levels[process.env.BEMORA_LOG_LEVEL || 'info'] ?? levels.info;

function timestamp() {
  return new Date().toISOString();
}

function maskKey(str) {
  if (!str || str.length < 8) return '***';
  return str.slice(0, 4) + '***' + str.slice(-4);
}

export const logger = {
  setLevel(level) {
    currentLevel = levels[level] ?? levels.info;
  },
  debug(msg, ...args) {
    if (currentLevel >= levels.debug) {
      console.log(chalk.gray(`[${timestamp()}] DEBUG ${msg}`), ...args);
    }
  },
  info(msg, ...args) {
    if (currentLevel >= levels.info) {
      console.log(chalk.cyan(`[${timestamp()}] INFO  ${msg}`), ...args);
    }
  },
  warn(msg, ...args) {
    if (currentLevel >= levels.warn) {
      console.warn(chalk.yellow(`[${timestamp()}] WARN  ${msg}`), ...args);
    }
  },
  error(msg, ...args) {
    if (currentLevel >= levels.error) {
      console.error(chalk.red(`[${timestamp()}] ERROR ${msg}`), ...args);
    }
  },
  maskKey,
};

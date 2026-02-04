import fs from 'fs';

const LOG_FILE = process.env.GH_TX_LOG_FILE || 'transaction.log';

export function logInfo(message: string) {
  const logMsg = `[INFO] ${new Date().toISOString()} ${message}`;
  console.log(logMsg);
  appendLog(logMsg);
}

export function logError(message: string, error?: Error) {
  const logMsg = `[ERROR] ${new Date().toISOString()} ${message} ${error ? error.stack || error.message : ''}`;
  console.error(logMsg);
  appendLog(logMsg);
}

function appendLog(msg: string) {
  try {
    fs.appendFileSync(LOG_FILE, msg + '\n');
  } catch {
    // Fallback: ignore file errors
  }
}


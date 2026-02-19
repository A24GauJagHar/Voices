const fs = require('fs').promises;
const path = require('path');

function isSafePath(route) {
  const absPath = path.resolve(route);
  const baseDir = path.resolve('.');
  return absPath.startsWith(baseDir);
}

function hasValidExtension(fileName, allowedExts) {
  const ext = path.extname(fileName).toLowerCase();
  return allowedExts.includes(ext);
}

async function exists(route) {
  try {
    await fs.access(route);
    return true;
  } catch {
    return false;
  }
}

async function createDirectory(dirName) {
  try {
    await fs.mkdir(dirName, { recursive: true });
    console.log(`✓ Directory '${dirName}' verified/created`);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log(`✓ Directory '${dirName}' already exists`);
    } else {
      console.error(`Error creating directory '${dirName}':`, err.message);
      throw err;
    }
  }
}

async function initDirectories() {
  console.log('--- Initializing directory structure ---');
  const requiredDirs = ['data', 'logs', 'backups'];
  for (const dir of requiredDirs) {
    await createDirectory(dir);
  }
  console.log('✓ Directory structure ready\n');
}

async function writeLog(message, level = 'INFO') {
  try {
    const logPath = path.join('logs', 'activity.log');
    if (!isSafePath(logPath) || !hasValidExtension(logPath, ['.log'])) {
      throw new Error('Unsafe path or invalid log extension');
    }
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${level}: ${message}\n`;
    await fs.appendFile(logPath, entry, 'utf8');
  } catch (err) {
    console.error('Error writing log:', err.message);
  }
}

async function readLastLogs(lines = 5) {
  try {
    const logPath = path.join('logs', 'activity.log');
    if (!(await exists(logPath))) {
      console.log('No logs yet.');
      return [];
    }
    const content = await fs.readFile(logPath, 'utf8');
    const allLines = content.split('\n').filter(l => l.trim());
    return allLines.slice(-lines);
  } catch (err) {
    console.error('Error reading logs:', err.message);
    return [];
  }
}

async function showLastLogs() {
  console.log('--- Last logs ---');
  const logs = await readLastLogs(5);
  if (logs.length === 0) {
    console.log('No logs available.');
  } else {
    logs.forEach(log => console.log(log));
  }
  console.log();
}

async function createBackup(originalPath) {
  try {
    if (!(await exists(originalPath))) {
      console.log(`Cannot create backup: '${originalPath}' not found`);
      return null;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(originalPath);
    const name = path.basename(originalPath, ext);
    const backupPath = path.join('backups', `${name}_backup_${timestamp}${ext}`);
    await fs.copyFile(originalPath, backupPath);
    console.log(`✓ Backup created: ${backupPath}`);
    await writeLog(`Backup created: ${backupPath}`);
    return backupPath;
  } catch (err) {
    console.error('Error creating backup:', err.message);
    await writeLog(`Error creating backup: ${err.message}`, 'ERROR');
    return null;
  }
}

async function createUserConfig(userName) {
  try {
    const configPath = path.join('data', 'config.txt');
    if (!isSafePath(configPath) || !hasValidExtension(configPath, ['.txt'])) {
      throw new Error('Unsafe path or invalid extension');
    }
    const now = new Date().toISOString();
    const content = `User: ${userName}\nStart date: ${now}\nTracked series: 0\n`;
    await fs.writeFile(configPath, content, 'utf8');
    console.log(`✓ Configuration created for: ${userName}`);
    await writeLog(`User configuration created: ${userName}`);
  } catch (err) {
    console.error('Error creating configuration:', err.message);
    await writeLog(`Error creating configuration: ${err.message}`, 'ERROR');
    throw err;
  }
}

async function showConfig() {
  try {
    const configPath = path.join('data', 'config.txt');
    if (!(await exists(configPath))) {
      console.log('No configuration found.');
      return;
    }
    const content = await fs.readFile(configPath, 'utf8');
    console.log('--- Current Configuration ---');
    console.log(content.trim());
    console.log();
  } catch (err) {
    console.error('Error reading configuration:', err.message);
    await writeLog(`Error reading configuration: ${err.message}`, 'ERROR');
  }
}

async function addSeries(name, seasons, status) {
  try {
    const seriesPath = path.join('data', 'series.txt');
    if (!isSafePath(seriesPath) || !hasValidExtension(seriesPath, ['.txt'])) {
      throw new Error('Unsafe path or invalid extension');
    }
    if (await exists(seriesPath)) {
      await createBackup(seriesPath);
    }
    const entry = `${name} - ${seasons} seasons - Status: ${status}\n`;
    await fs.appendFile(seriesPath, entry, 'utf8');
    console.log(`✓ Series '${name}' added`);
    await writeLog(`Series added: ${name}`);
  } catch (err) {
    console.error('Error adding series:', err.message);
    await writeLog(`Error adding series ${name}: ${err.message}`, 'ERROR');
    throw err;
  }
}

async function listSeries() {
  try {
    const seriesPath = path.join('data', 'series.txt');
    if (!(await exists(seriesPath))) {
      console.log('No stored series yet.');
      return;
    }
    const content = await fs.readFile(seriesPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    console.log('--- Stored Series ---');
    if (lines.length === 0) {
      console.log('No series yet.');
    } else {
      lines.forEach((line, idx) => console.log(`${idx + 1}. ${line}`));
    }
    console.log();
    await writeLog('Series list viewed');
  } catch (err) {
    console.error('Error reading series:', err.message);
    await writeLog(`Error reading series: ${err.message}`, 'ERROR');
  }
}

async function initApp() {
  try {
    console.log('=== Series Tracking System ===\n');
    await initDirectories();
    const logPath = path.join('logs', 'activity.log');
    if (!(await exists(logPath))) {
      await fs.writeFile(logPath, '=== Log initialized ===\n', 'utf8');
      console.log('✓ Log file initialized');
    }
    const seriesPath = path.join('data', 'series.txt');
    if (!(await exists(seriesPath))) {
      await fs.writeFile(seriesPath, '', 'utf8');
      console.log('✓ Series file initialized');
    }
    console.log('✓ System initialized successfully\n');
    await writeLog('Series tracking system initialized');
  } catch (err) {
    console.error('Error initializing app:', err.message);
    throw err;
  }
}

async function main() {
  try {
    await initApp();
    await createUserConfig('Harsh Gautambhai');
    console.log('--- Adding series ---');
    await addSeries('Breaking Bad', 5, 'Completed');
    await addSeries('Stranger Things', 4, 'Ongoing');
    await addSeries('The Office', 9, 'Pending');
    console.log();
    await showConfig();
    await listSeries();
    await showLastLogs();
    console.log('=== Demo completed successfully! ===');
  } catch (err) {
    console.error('Main app error:', err.message);
    await writeLog(`Critical error: ${err.message}`, 'CRITICAL');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  initApp,
  createUserConfig,
  addSeries,
  listSeries,
  showConfig,
  writeLog,
  readLastLogs,
  createBackup,
  exists
};

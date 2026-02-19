const fs = require('fs').promises;
const fsSync = require('fs');

async function makeDir(dirName) {
  try {
    await fs.mkdir(dirName, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') console.log(`Error creating directory ${dirName}:`, err.message);
  }
}

async function writeLog(msg) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] INFO: ${msg}\n`;
  try {
    await fs.appendFile('logs/activity.log', entry, 'utf8');
  } catch (err) {
    console.log('Error writing log:', err.message);
  }
}

async function initApp() {
  console.log('=== SeriesTracker v3.0 - JSON Migration ===\n');
  try {
    console.log('--- Initializing system ---');
    await makeDir('data');
    await makeDir('logs');
    await makeDir('backups');
    await makeDir('reports');
    await makeDir('import');
    console.log('✓ Directories verified');
    try {
      await fs.access('logs/activity.log');
    } catch {
      await fs.writeFile('logs/activity.log', '', 'utf8');
    }
    console.log('✓ Logging system active\n');
    await writeLog('System v3.0 initialized');
  } catch (err) {
    console.log('Initialization error:', err.message);
    throw err;
  }
}

async function saveJSON(filePath, obj) {
  try {
    const json = JSON.stringify(obj, null, 2);
    await fs.writeFile(filePath, json, 'utf8');
    console.log(`✓ Saved: ${filePath}`);
    await writeLog(`JSON file saved: ${filePath}`);
  } catch (err) {
    console.log(`Error saving ${filePath}:`, err.message);
    throw err;
  }
}

async function loadJSON(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`File not found: ${filePath}`);
      return null;
    } else if (err instanceof SyntaxError) {
      console.log(`Invalid JSON in ${filePath}:`, err.message);
      throw err;
    } else {
      console.log(`Error loading ${filePath}:`, err.message);
      throw err;
    }
  }
}

async function createConfig(userName) {
  console.log('--- Migrating configuration to JSON ---');
  try {
    const config = {
      app: "SeriesTracker",
      version: "3.0",
      user: userName,
      startDate: new Date().toISOString(),
      followedSeries: 0,
      lastUpdate: new Date().toISOString()
    };
    await saveJSON('data/config.json', config);
    console.log('✓ Configuration saved\n');
  } catch (err) {
    console.log('Error creating configuration:', err.message);
    throw err;
  }
}

async function showConfig() {
  console.log('--- Loading data ---');
  try {
    const config = await loadJSON('data/config.json');
    if (!config) {
      console.log('No configuration saved');
      return;
    }
    console.log('Configuration:');
    console.log(` App: ${config.app} v${config.version}`);
    console.log(` User: ${config.user}`);
    console.log(` Series followed: ${config.followedSeries}\n`);
  } catch (err) {
    console.log('Error showing configuration:', err.message);
  }
}

function validateSeries(s) {
  const errors = [];
  if (!s.title) errors.push('Title is required');
  else if (typeof s.title !== 'string' || s.title.trim() === '') errors.push('Invalid title');
  if (s.seasons === undefined) errors.push('Seasons required');
  else if (typeof s.seasons !== 'number' || s.seasons < 1 || s.seasons > 30) errors.push('Invalid seasons');
  const validStates = ['Completed', 'Ongoing', 'Pending'];
  if (!s.status) errors.push('Status required');
  else if (!validStates.includes(s.status)) errors.push(`Status must be: ${validStates.join(', ')}`);
  if (s.rating !== undefined) {
    if (typeof s.rating !== 'number' || s.rating < 0 || s.rating > 10) errors.push('Rating must be 0–10');
  }
  if (s.genre !== undefined && typeof s.genre !== 'string') errors.push('Genre must be text');
  return { valid: errors.length === 0, errors };
}

async function addSeries(newSeries) {
  try {
    const val = validateSeries(newSeries);
    if (!val.valid) {
      console.log('Validation errors:');
      val.errors.forEach(e => console.log(` - ${e}`));
      return false;
    }
    let series = await loadJSON('data/series.json');
    if (!series || !Array.isArray(series)) series = [];
    newSeries.addedAt = new Date().toISOString();
    series.push(newSeries);
    await saveJSON('data/series.json', series);
    await updateSeriesCount(series.length);
    console.log(`✓ Series added: ${newSeries.title} (${newSeries.genre}) - ${newSeries.rating}`);
    await writeLog(`Series added: ${newSeries.title}`);
    return true;
  } catch (err) {
    console.log('Error adding series:', err.message);
    return false;
  }
}

async function updateSeriesCount(count) {
  try {
    const config = await loadJSON('data/config.json');
    if (config) {
      config.followedSeries = count;
      config.lastUpdate = new Date().toISOString();
      await saveJSON('data/config.json', config);
    }
  } catch (err) {
    console.log('Error updating count:', err.message);
  }
}

async function listSeries() {
  console.log('Loaded series:');
  try {
    const series = await loadJSON('data/series.json');
    if (!series || series.length === 0) {
      console.log(' No series saved\n');
      return;
    }
    series.forEach((s, i) => console.log(` ${i + 1}. ${s.title} (${s.status}) - ${s.genre} - ${s.rating}`));
    console.log('');
  } catch (err) {
    console.log('Error listing series:', err.message);
  }
}

async function createUserProfile(data) {
  console.log('--- Creating user profile ---');
  try {
    const profile = {
      name: data.name,
      email: data.email,
      age: data.age,
      preferences: {
        theme: data.theme || "dark",
        language: data.language || "en",
        notifications: data.notifications !== false
      },
      stats: {
        watchedSeries: 0,
        watchedHours: 0,
        favoriteGenres: []
      },
      registeredAt: new Date().toISOString()
    };
    await saveJSON('data/user.json', profile);
    console.log(`✓ Profile created: ${profile.name}`);
    await writeLog(`User profile created: ${profile.name}`);
  } catch (err) {
    console.log('Error creating profile:', err.message);
    throw err;
  }
}

async function validateFiles() {
  console.log('--- Data validation ---');
  const files = ['data/config.json', 'data/series.json', 'data/user.json'];
  let allValid = true;
  for (const file of files) {
    try {
      const data = await loadJSON(file);
      if (data) console.log(`✓ ${file} - Valid`);
      else console.log(`${file} - Missing`);
    } catch (err) {
      console.log(`${file} - Invalid: ${err.message}`);
      allValid = false;
    }
  }
  if (allValid) console.log('✓ All JSON files valid\n');
  else console.log('Some files contain errors\n');
}

async function main() {
  try {
    await initApp();
    await createConfig('Joan Garcia');
    await createUserProfile({
      name: 'Joan Garcia',
      email: 'joan@example.com',
      age: 25,
      theme: 'dark',
      language: 'en',
      notifications: true
    });
    console.log('--- Adding series in JSON ---');
    await addSeries({ title: "Breaking Bad", seasons: 5, status: "Completed", genre: "Crime", rating: 9.5 });
    await addSeries({ title: "Stranger Things", seasons: 4, status: "Ongoing", genre: "Sci-Fi", rating: 8.7 });
    await addSeries({ title: "The Office", seasons: 9, status: "Completed", genre: "Comedy", rating: 8.9 });
    console.log('✓ Total series: 3\n');
    await showConfig();
    await listSeries();
    await validateFiles();
    console.log('--- Example modification ---');
    const series = await loadJSON('data/series.json');
    if (series && series.length > 0) {
      series[0].status = "Ongoing";
      await saveJSON('data/series.json', series);
      console.log(`✓ Modified: ${series[0].title} → ${series[0].status}\n`);
    }
    console.log('=== Migration completed successfully ===');
    console.log('Generated files:');
    console.log(' - data/config.json');
    console.log(' - data/series.json');
    console.log(' - data/user.json');
    console.log(' - logs/activity.log');
    await writeLog('Migration to JSON completed successfully');
  } catch (err) {
    console.log('\nApp error:', err.message);
    await writeLog(`ERROR: ${err.message}`);
  }
}

main().catch(err => {
  console.error('Critical error:', err);
  process.exit(1);
});

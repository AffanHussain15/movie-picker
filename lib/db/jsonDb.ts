import fs from 'fs';
import path from 'path';
import { Group } from './models';

// We store the DB file in the app data directory or workspace root
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'movie-picker-db.json');

function ensureDbExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ groups: [] }, null, 2), 'utf-8');
  }
}

export async function readJsonDb(): Promise<{ groups: Group[] }> {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON DB, resetting...', error);
    return { groups: [] };
  }
}

export async function writeJsonDb(data: { groups: Group[] }): Promise<void> {
  ensureDbExists();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getJsonGroup(id: string): Promise<Group | null> {
  const db = await readJsonDb();
  const group = db.groups.find((g) => g.id === id);
  return group || null;
}

export async function saveJsonGroup(group: Group): Promise<void> {
  const db = await readJsonDb();
  const index = db.groups.findIndex((g) => g.id === group.id);
  if (index !== -1) {
    db.groups[index] = { ...group, updatedAt: new Date().toISOString() };
  } else {
    db.groups.push({
      ...group,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await writeJsonDb(db);
}

export async function listJsonGroups(): Promise<Group[]> {
  const db = await readJsonDb();
  return db.groups;
}

import * as FileSystem from "expo-file-system/legacy";

const STORAGE_DIR = FileSystem.documentDirectory + "storage/";
const CATEGORY_FILE = STORAGE_DIR + "categories.json";
const MENU_FILE = STORAGE_DIR + "items.json";

async function ensureFolder() {
  const folder = await FileSystem.getInfoAsync(STORAGE_DIR);
  if (!folder.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
}

export async function saveCategoriesFile(categories) {
  await ensureFolder();
  await FileSystem.writeAsStringAsync(CATEGORY_FILE, JSON.stringify(categories));
  console.log("Document directory:", FileSystem.documentDirectory);
}

export async function saveMenuFile(menu) {
  await ensureFolder();
  await FileSystem.writeAsStringAsync(MENU_FILE, JSON.stringify(menu));
}

export async function loadCategoriesFile() {
  const file = await FileSystem.getInfoAsync(CATEGORY_FILE);
  if (!file.exists) return null;

  const content = await FileSystem.readAsStringAsync(CATEGORY_FILE);
  return JSON.parse(content);
}

export async function loadMenuFile() {
  const file = await FileSystem.getInfoAsync(MENU_FILE);
  if (!file.exists) return null;

  const content = await FileSystem.readAsStringAsync(MENU_FILE);
  return JSON.parse(content);
}

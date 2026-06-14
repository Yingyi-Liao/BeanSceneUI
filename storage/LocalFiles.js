import AsyncStorage from "@react-native-async-storage/async-storage";

const CATEGORY_KEY = "offline_categories_v1";
const MENU_KEY = "offline_menu_v1";

export async function saveCategoriesFile(categories) {
  try {
    await AsyncStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  } catch (err) {
    console.log("Failed to save categories:", err);
  }
}

export async function saveMenuFile(menu) {
  try {
    await AsyncStorage.setItem(MENU_KEY, JSON.stringify(menu));
  } catch (err) {
    console.log("Failed to save menu:", err);
  }
}

export async function loadCategoriesFile() {
  try {
    const json = await AsyncStorage.getItem(CATEGORY_KEY);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.log("Failed to load categories:", err);
    return null;
  }
}

export async function loadMenuFile() {
  try {
    const json = await AsyncStorage.getItem(MENU_KEY);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.log("Failed to load menu:", err);
    return null;
  }
}

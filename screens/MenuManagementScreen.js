import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {SafeAreaView} from 'react-native-safe-area-context';
import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { API_BASE } from "../constants/apibase";
import { COLORS } from "../constants/colors";
import * as SecureStore from "expo-secure-store";

export default function MenuManagementScreen({ route, navigation }) {
  const { username, role, isOnline = true } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // -----------------------------
  // FETCH CATEGORIES
  // -----------------------------
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/category`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to load categories");
      }

      const data = json.data || [];
      setCategories(data);

      const map = {};
      data.forEach((cat) => {
        map[cat.id] = cat.categoryName;
      });
      setCategoryMap(map);
    } catch (err) {
      setErrorMessage("Failed to load categories: " + err.message);
    }
  };

  // -----------------------------
  // FETCH MENU ITEMS
  // -----------------------------
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_BASE}/api/item`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to load menu items");
      }

      setMenuItems(json.data || []);
    } catch (err) {
      setErrorMessage("Failed to load menu items: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  // -----------------------------
  // CATEGORY LIST FOR FILTER BAR
  // -----------------------------
  const categoryNames = ["All", ...categories.map((c) => c.categoryName)];

  // -----------------------------
  // FILTERING LOGIC
  // -----------------------------
  const filteredMenu = menuItems.filter((item) => {
    const itemName =
      typeof item.itemName === "string" ? item.itemName : "";

    const itemCategories = Array.isArray(item.categories)
      ? item.categories
      : [];

    const itemCategoryNames = itemCategories
      .map((id) => categoryMap[id])
      .filter(Boolean);

    const matchesCategory =
      selectedCategory === "All" ||
      itemCategoryNames.includes(selectedCategory);

    const matchesSearch = itemName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // -----------------------------
  // TABLET GRID PLACEHOLDER
  // -----------------------------
  const menuForDisplay = [...filteredMenu];
  if (isTablet && menuForDisplay.length % 2 !== 0) {
    menuForDisplay.push({ id: "placeholder", isPlaceholder: true });
  }

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const handleUpdateItem = (item) => {
    navigation.navigate("UpdateDeleteItem", {
      item,
      categories,
      categoryMap,
      username,
      role,
      isOnline,
    });
  };

  const handleCreateItem = () => {
    navigation.navigate("CreateItem", {
      categories,
      categoryMap,
      username,
      role,
      isOnline,
    });
  };

  const handleCategoryMgmt = () => {
    navigation.navigate("CategoryManagement", {
      username,
      role,
      isOnline,
    });
  };

  const handleBackToDashboard = () => {
    navigation.navigate("Dashboard", {
      username,
      role,
      isOnline,
    });
  };

  const handleLogout = async () => {
      await SecureStore.deleteItemAsync('jwt');
      navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* STATUS BAR */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: isOnline ? COLORS.statusOnline : COLORS.statusOffline },
        ]}
      >
        <Text style={styles.statusText}>
          {isOnline ? "● System Online" : "○ System Offline"}
        </Text>
      </View>

      {/* HEADER */}
      <View style={[styles.headerContainer, isTablet && styles.headerContainerTablet]}>

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() =>
            navigation.navigate("Dashboard", {
              username,
              role,
              isOnline,
            })
          }
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>

        {/* LOGO */}
        <Image source={BeanSceneLogo} style={styles.logo} resizeMode="contain" />

        {/* USER PROFILE */}
        <View style={[styles.userProfile, isTablet && styles.userProfileTablet]}>
          <View style={{ marginRight: 10 }}>
            <Text style={styles.userNameText}>{username}</Text>
            <Text style={styles.userRoleText}>{role?.toUpperCase()}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtnSmall}
            onPress={handleLogout}
          >
            <Text style={styles.logoutTextSmall}>Log Off</Text>
          </TouchableOpacity>
        </View>
      </View>


      {/* MAIN CONTENT */}
      <View style={styles.mainContent}>
        <Text style={styles.screenTitle}>Menu Management</Text>

        {/* ERROR BOX */}
        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* MANAGEMENT BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.mgmtBtn} onPress={handleCreateItem}>
            <Text style={styles.mgmtBtnText}>➕ Create Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mgmtBtn} onPress={handleCategoryMgmt}>
            <Text style={styles.mgmtBtnText}>📂 Categories</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search menu items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORY FILTER */}
        <View style={styles.categoryWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categoryNames.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryCard,
                  selectedCategory === cat && { backgroundColor: COLORS.beanLightBlue },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && { color: COLORS.white },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LOADING */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={COLORS.beanMidBlue}
            style={{ marginTop: 20 }}
          />
        )}

        {/* TABLET WRAPPER */}
        <View style={isTablet && styles.tabletListWrapper}>
          <Text style={styles.hintText}>Tap an item to edit or delete</Text>
          <FlatList
            key={isTablet ? "tablet" : "mobile"}
            data={menuForDisplay}
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={
              isTablet ? { gap: 15, justifyContent: "space-between" } : null
            }
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.isPlaceholder) {
                return <View style={styles.placeholderCard} />;
              }

              const itemName = item.itemName || "";
              const itemPrice = item.price ?? 0;
              const itemCategories = item.categories || [];
              const itemCategoryNames = itemCategories
                .map((id) => categoryMap[id])
                .filter(Boolean);

              const categoryLabel =
                itemCategoryNames.length > 0
                  ? itemCategoryNames.join(", ")
                  : "Uncategorised";

              const imageUri = item.file
                ? `${API_BASE}/static/${item.file}`
                : null;

              return (
                <TouchableOpacity
                  style={[styles.itemCard, isTablet && styles.itemCardTablet]}
                  onPress={() => handleUpdateItem(item)}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                      <Text style={styles.itemImagePlaceholderText}>No Image</Text>
                    </View>
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{itemName}</Text>
                    <Text style={styles.itemCategory}>{categoryLabel}</Text>
                    <Text style={styles.itemPrice}>
                      ${Number(itemPrice).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* BACK TO DASHBOARD */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  statusBar: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: "bold", color: COLORS.white },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
  },
  headerContainerTablet: {
    paddingHorizontal: 40,
    paddingVertical: 25,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.beanLightGrey,
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
  },
  headerBackButton: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  backgroundColor: COLORS.beanLightGrey,
  borderRadius: 6,
  marginRight: 10,
  },

  headerBackText: {
  fontSize: 14,
  fontWeight: "bold",
  color: COLORS.beanDarkBlue,
  },


  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: "row", alignItems: "center" },
  userProfileTablet: { gap: 20 },

  logoutBtnSmall: {
    backgroundColor: COLORS.errorBg,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  logoutTextSmall: { fontSize: 12, color: COLORS.errorRed, fontWeight: "bold" },

  mainContent: { flex: 1, padding: 20 },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
    marginBottom: 15,
  },

  errorBox: {
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: "bold" },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  mgmtBtn: {
    flex: 1,
    backgroundColor: COLORS.beanMidBlue,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  mgmtBtnText: { color: COLORS.white, fontWeight: "bold", fontSize: 12 },

  searchContainer: { marginBottom: 15 },
  searchBar: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    color: COLORS.textDark,
  },

  categoryWrapper: { marginBottom: 15 },
  categoryScroll: { paddingVertical: 5 },
  categoryCard: {
    backgroundColor: COLORS.chipBg,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: { color: COLORS.chipText, fontWeight: "600" },

  hintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
    textAlign: "center",
  },

  tabletListWrapper: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },

  placeholderCard: {
    width: "48%",
    marginBottom: 15,
    backgroundColor: "transparent",
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  itemCardTablet: { width: "48%" },

  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  itemImagePlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImagePlaceholderText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "bold", color: COLORS.beanDarkBlue },
  itemCategory: { fontSize: 12, color: COLORS.textMuted },
  itemPrice: { fontSize: 16, fontWeight: "bold", color: COLORS.beanLightBlue },

  backButton: { marginTop: 20, padding: 10, alignItems: "center" },
  backButtonText: {
    color: COLORS.beanDarkBlue,
    fontWeight: "bold",
    fontSize: 16,
  },
});

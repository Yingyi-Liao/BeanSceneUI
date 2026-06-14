import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useNavigation, useRoute } from "@react-navigation/native";

import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { API_BASE } from "../constants/apibase.js";
import { COLORS } from "../constants/colors";
import { useOrder } from "../context/OrderContext";

import {
  saveCategoriesFile,
  saveMenuFile,
  loadCategoriesFile,
  loadMenuFile,
} from "../storage/LocalFiles";


export default function CreateOrderMenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { username, role, isOnline = true } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { orderItems, addItem, updateQty, removeItem, clearOrder } = useOrder();

  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [tableNumber, setTableNumber] = useState("");
  const [note, setNote] = useState("");

// Load categories and menu from API (with offline fallback)
  const loadCategoriesOnline = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwt");

      const response = await fetch(`${API_BASE}/api/category`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (!response.ok) return null;

      const map = {};
      json.data.forEach((cat) => {
        map[cat.id] = cat.categoryName;
      });

      const categoryList = ["All", ...json.data.map((c) => c.categoryName)];

      setCategories(categoryList);
      saveCategoriesFile(categoryList); // ⭐ Save offline

      return map;
    } catch {
      return null;
    }
  };

// Load menu items, map category names, and handle images (with offline fallback)
  const loadMenuOnline = async (categoryMap) => {
    try {
      const token = await SecureStore.getItemAsync("jwt");

      const response = await fetch(`${API_BASE}/api/item`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (!response.ok) return;

      const mapped = json.data.map((item) => ({
        ...item,
        price: parseFloat(item.price),
        categoryName: categoryMap[item.categories?.[0]] || "Unknown",
        imageUrl: item.file ? `${API_BASE}/static/${item.file}` : null, // ⭐ Remote only
      }));

      setMenu(mapped);
      saveMenuFile(mapped); // ⭐ Save offline
    } catch {
      console.log("Failed to load menu online");
    } finally {
      setLoading(false);
    }
  };

// On mount: load cached data first, then fetch online if possible
  useEffect(() => {
    const loadAll = async () => {
      // 1. Load cached JSON files first
      const cachedCategories = await loadCategoriesFile();
      const cachedMenu = await loadMenuFile();

      if (cachedCategories) setCategories(cachedCategories);
      if (cachedMenu) {
        setMenu(cachedMenu);
        setLoading(false);
      }

      // 2. If online → fetch fresh data and overwrite JSON files
      if (isOnline) {
        const categoryMap = await loadCategoriesOnline();
        await loadMenuOnline(categoryMap || {});
      }
    };

    loadAll();
  }, []);

// Handle user logout
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("jwt");
    navigation.replace("Login");
  };

// Filter menu based on search and category selection
  const filteredMenu = menu.filter((item) => {
    const name = item.itemName || "";
    const categoryName = item.categoryName || "";

    const matchesCategory =
      selectedCategory === "All" || selectedCategory === categoryName;

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const orderTotal = orderItems.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

// Handle order submission
  const handleSubmitOrder = async () => {
    if (!tableNumber.trim()) {
      Alert.alert("Validation", "Please enter a table number.");
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert("Validation", "Please add at least one item to the order.");
      return;
    }

    const payload = {
      tableNumber: tableNumber.trim(),
      note: note.trim(),
      status: "pending",
      items: orderItems.map((i) => ({
        id: i.id,
        itemName: i.itemName,
        qty: i.qty,
        price: i.price,
      })),
      total: orderItems.reduce((sum, i) => sum + i.qty * i.price, 0),
      createdBy: username,
      createdAt: new Date().toISOString(),
    };

    try {
      const token = await SecureStore.getItemAsync("jwt");

      const response = await fetch(`${API_BASE}/api/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        Alert.alert("Error", json.error || "Failed to submit order");
        return;
      }

      Alert.alert("Success", "Order submitted successfully.");

      clearOrder();
      setTableNumber("");
      setNote("");

    } catch {
      Alert.alert("Error", "Failed to submit order");
    }
  };

// Show loading state while fetching menu
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.beanLightBlue} />
        <Text style={{ marginTop: 10, color: COLORS.textDark }}>Loading menu...</Text>
      </SafeAreaView>
    );
  }

// Main render functions for menu list and order summary
  const renderMenuList = () => (
    <View style={{ flex: 2 }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for an item..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
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

      <View style={isTablet ? styles.gridTablet : styles.listMobile}>
        {filteredMenu.map((item) => (
          <View
            key={item.id}
            style={[styles.itemCard, isTablet && styles.itemCardTablet]}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.imagePlaceholder]}>
                <Text style={{ color: COLORS.textPlaceholder, fontSize: 10 }}>
                  No image
                </Text>
              </View>
            )}

            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.itemCategory}>{item.categoryName}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>

              <TouchableOpacity
                style={styles.addToOrderBtnSmall}
                onPress={() => addItem(item, 1)}
              >
                <Text style={styles.addToOrderTextSmall}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderOrderSummary = () => (
    <View style={[styles.orderSummaryContainer, isTablet && { flex: 1 }]}>
      <Text style={styles.orderSummaryTitle}>Order Summary</Text>

      {orderItems.length === 0 ? (
        <Text style={styles.emptyOrderText}>No items added yet.</Text>
      ) : (
        <ScrollView style={{ maxHeight: isTablet ? "70%" : 250 }}>
          {orderItems.map((item) => (
            <View key={item.id} style={styles.orderItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderItemName}>{item.itemName}</Text>
                <Text style={styles.orderItemPrice}>
                  ${item.price.toFixed(2)} each
                </Text>
              </View>

              <View style={styles.orderQtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    const newQty = item.qty - 1;
                    if (newQty <= 0) {
                      removeItem(item.id);
                    } else {
                      updateQty(item.id, newQty);
                    }
                  }}
                  onLongPress={() => {
                    const newQty = item.qty - 5;
                    if (newQty <= 0) {
                      removeItem(item.id);
                    } else {
                      updateQty(item.id, newQty);
                    }
                  }}
                  delayLongPress={500}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyNumber}>{item.qty}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.id, item.qty + 1)}
                  onLongPress={() => updateQty(item.id, item.qty + 5)}
                  delayLongPress={500}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.orderItemTotalContainer}>
                <Text style={styles.orderItemTotal}>
                  ${(item.qty * item.price).toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeText}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.orderTotalRow}>
        <Text style={styles.orderTotalLabel}>Total:</Text>
        <Text style={styles.orderTotalValue}>${orderTotal.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.submitOrderBtn}
        onPress={handleSubmitOrder}
      >
        <Text style={styles.submitOrderText}>Submit Order</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

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

      <View style={[styles.headerContainer, isTablet && styles.headerContainerTablet]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Image source={BeanSceneLogo} style={styles.logo} resizeMode="contain" />

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

      <View style={styles.topFormContainer}>
        <View style={styles.tableInputContainer}>
          <Text style={styles.label}>Table Number</Text>
          <TextInput
            style={styles.tableInput}
            placeholder="e.g. 12"
            placeholderTextColor={COLORS.textPlaceholder}
            value={tableNumber}
            onChangeText={setTableNumber}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.noteInputContainer}>
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Special instructions..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>
      </View>

      {isTablet ? (
        <View style={styles.tabletMainRow}>
          {renderOrderSummary()}
          {renderMenuList()}
        </View>
      ) : (
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          {renderOrderSummary()}
          {renderMenuList()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Styles for the CreateOrderMenuScreen component
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

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

  userNameText: { fontSize: 14, fontWeight: "bold", color: COLORS.textDark },
  userRoleText: { fontSize: 10, color: COLORS.textMuted, marginRight: 10 },

  topFormContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  tableInputContainer: {
    marginBottom: 10,
  },
  noteInputContainer: {
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMid,
    marginBottom: 4,
  },
  tableInput: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textDark,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 40,
    textAlignVertical: "top",
    color: COLORS.textDark,
  },

  mainContent: { flex: 1, padding: 20 },

  tabletMainRow: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  searchContainer: { marginTop: 16, marginBottom: 10 },
  searchBar: {
    backgroundColor: COLORS.searchBg,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    color: COLORS.textDark,
  },

  categoryWrapper: { marginBottom: 10 },
  categoryCard: {
    backgroundColor: COLORS.beanLightGrey,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: { color: COLORS.textDark, fontWeight: "600", fontSize: 12 },

  listMobile: { flexDirection: "column", gap: 12 },
  gridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 2,
  },
  itemCardTablet: {
    width: "48%",
  },

  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  imagePlaceholder: {
    backgroundColor: COLORS.searchBg,
    justifyContent: "center",
    alignItems: "center",
  },

  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "bold", color: COLORS.beanDarkBlue },
  itemCategory: { fontSize: 11, color: COLORS.textMuted },
  itemPrice: { fontSize: 14, fontWeight: "bold", color: COLORS.beanLightBlue },

  addToOrderBtnSmall: {
    backgroundColor: COLORS.beanLightBlue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  addToOrderTextSmall: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 13,
  },

  orderSummaryContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    backgroundColor: COLORS.surface,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
    marginBottom: 8,
  },
  emptyOrderText: {
    fontSize: 13,
    color: COLORS.textMuted2,
    marginVertical: 10,
  },

  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingBottom: 6,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  orderItemPrice: {
    fontSize: 12,
    color: COLORS.textMuted2,
  },

  orderQtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  qtyBtn: {
    backgroundColor: COLORS.beanLightGrey,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
  },
  qtyNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: COLORS.beanDarkBlue,
  },

  orderItemTotalContainer: {
    alignItems: "flex-end",
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
  },
  removeText: {
    fontSize: 12,
    color: COLORS.errorRed,
    marginTop: 2,
  },

  orderTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.beanLightBlue,
  },

  submitOrderBtn: {
    backgroundColor: COLORS.beanDarkBlue,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  submitOrderText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

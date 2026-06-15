import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  ScrollView,
  Switch,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";

import {SafeAreaView} from 'react-native-safe-area-context';
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { API_BASE } from "../constants/apibase";
import { COLORS } from "../constants/colors";

const DIETARY_FLAGS = [
  "gluten-free",
  "vegetarian",
  "vegan",
  "contains-nuts",
  "dairy-free",
  "halal",
  "kosher",
];

export default function CreateItemScreen({ navigation, route }) {
  const { username, role, isOnline = true } = route.params || {};
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [selectedDietaryFlags, setSelectedDietaryFlags] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // LOAD CATEGORIES
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const token = await SecureStore.getItemAsync("jwt");

        const res = await fetch(`${API_BASE}/api/category`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to load categories");

        setCategories(json.data || []);
      } catch (err) {
        setErrorMessage("❌ Failed to load categories: " + err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // IMAGE PICKER
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Media access is needed to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split("/").pop() || `item-${Date.now()}.jpg`;
      const ext = fileName.split(".").pop().toLowerCase();
      const type =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

      setSelectedImage({ uri, name: fileName, type });
    }
  };

  // ADD CATEGORY
  const handleAddCategory = () => {
    if (!selectedCategory) return;

    const cat = categories.find((c) => c.id === selectedCategory);
    if (!cat) return;

    if (!selectedCategories.some((c) => c.id === cat.id)) {
      setSelectedCategories([...selectedCategories, { id: cat.id, name: cat.categoryName }]);
    }
  };

  // REMOVE CATEGORY
  const handleRemoveCategory = (id) => {
    setSelectedCategories(selectedCategories.filter((c) => c.id !== id));
  };

  // TOGGLE DIETARY FLAG
  const toggleDietaryFlag = (flag) => {
    setSelectedDietaryFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  // SUBMIT
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isOnline) {
      setErrorMessage("❌ Cannot Submit: System is OFFLINE");
      return;
    }

    if (!itemName.trim() || !price.trim()) {
      setErrorMessage("❌ Item name and price are required");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setErrorMessage("❌ Price must be a valid non-negative number");
      return;
    }

    try {
      setSubmitting(true);

      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        Alert.alert("Session expired", "Please log in again.");
        navigation.replace("Login");
        return;
      }

      const formData = new FormData();

      formData.append("itemName", itemName.trim());
      formData.append("price", String(numericPrice));
      if (description.trim()) formData.append("description", description.trim());
      formData.append("isActive", isActive ? "true" : "false");

      // categories[] fields
      selectedCategories.forEach((c) => {
        formData.append("categories[]", c.id);
      });

      // dietaryFlags[] fields
      selectedDietaryFlags.forEach((flag) => {
        formData.append("dietaryFlags[]", flag);
      });

      // image
      if (selectedImage) {
        formData.append("file", {
          uri: selectedImage.uri,
          name: selectedImage.name,
          type: selectedImage.type,
        });
      }

      const response = await fetch(`${API_BASE}/api/item/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Failed to create item");

      setSuccessMessage("✔ Item created successfully!");

      setTimeout(() => {
        navigation.navigate("MenuManagement", { username, role, isOnline });
      }, 800);
    } catch (err) {
      setErrorMessage("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
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

      {/* MAIN CONTENT */}
      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>Create New Item</Text>

        {successMessage !== "" && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {submitting && (
          <ActivityIndicator size="large" color={COLORS.beanMidBlue} style={{ marginBottom: 20 }} />
        )}

        {/* TABLET LAYOUT */}
        <View style={isTablet ? styles.tabletRow : null}>
          {/* LEFT COLUMN */}
          <View style={isTablet ? styles.tabletLeft : null}>
            {/* ITEM NAME */}
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              value={itemName}
              onChangeText={setItemName}
            />

            {/* CATEGORY PICKER */}
            <Text style={styles.label}>Categories</Text>

            {loadingCategories ? (
              <ActivityIndicator
                size="small"
                color={COLORS.beanMidBlue}
                style={{ marginBottom: 10 }}
              />
            ) : (
              <>
                <View style={styles.dropdownWrapper}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select category..." value="" />
                    {categories.map((cat) => (
                      <Picker.Item key={cat.id} label={cat.categoryName} value={cat.id} />
                    ))}
                  </Picker>
                </View>

                <TouchableOpacity style={styles.addCategoryBtn} onPress={handleAddCategory}>
                  <Text style={styles.addCategoryBtnText}>＋ Add Category</Text>
                </TouchableOpacity>
              </>
            )}

            {/* CATEGORY CHIPS */}
            <View style={styles.tagContainer}>
              {selectedCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.tag}
                  onPress={() => handleRemoveCategory(cat.id)}
                >
                  <Text style={styles.tagText}>{cat.name} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* PRICE */}
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
            />

            {/* DIETARY FLAGS */}
            <Text style={styles.label}>Dietary Flags</Text>
            <View style={styles.dietaryContainer}>
              {DIETARY_FLAGS.map((flag) => {
                const selected = selectedDietaryFlags.includes(flag);
                return (
                  <TouchableOpacity
                    key={flag}
                    style={[styles.dietaryChip, selected && styles.dietaryChipSelected]}
                    onPress={() => toggleDietaryFlag(flag)}
                  >
                    <Text
                      style={[
                        styles.dietaryChipText,
                        selected && styles.dietaryChipTextSelected,
                      ]}
                    >
                      {flag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* RIGHT COLUMN */}
          <View style={isTablet ? styles.tabletRight : null}>
            {/* IMAGE */}
            <Text style={styles.label}>Item Image</Text>
            <TouchableOpacity style={styles.imageUploadBox} onPress={handlePickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              ) : (
                <Text style={styles.imageUploadText}>Tap to upload image</Text>
              )}
            </TouchableOpacity>

            {/* DESCRIPTION */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.inputField,
                { height: 100, textAlignVertical: "top" },
                isTablet && styles.inputFieldTablet,
              ]}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* ACTIVE SWITCH */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Item Active?</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.beanLightBlue }}
                thumbColor="#f4f3f4"
                value={isActive}
                onValueChange={setIsActive}
              />
            </View>

            {/* SUBMIT */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>SUBMIT ITEM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Menu Management</Text>
        </TouchableOpacity>
      </ScrollView>
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

  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: "row", alignItems: "center" },
  userProfileTablet: { gap: 20 },

  userNameText: { fontSize: 14, fontWeight: "bold", color: COLORS.beanDarkBlue },
  userRoleText: { fontSize: 12, color: COLORS.beanMidBlue },

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
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
    marginBottom: 20,
  },

  successBox: {
    padding: 10,
    backgroundColor: COLORS.successBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    marginBottom: 15,
  },
  successText: { color: COLORS.successGreen, fontWeight: "bold" },

  errorBox: {
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: "bold" },

  tabletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 30,
  },
  tabletLeft: { flex: 1 },
  tabletRight: { flex: 1 },

  label: { fontSize: 16, fontWeight: "bold", color: COLORS.textDark, marginBottom: 5 },

  inputField: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: COLORS.searchBg,
    color: COLORS.textDark,
  },

  inputFieldTablet: {
    padding: 16,
    fontSize: 18,
  },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: COLORS.searchBg,
  },
  picker: {
    width: "100%",
    height: 50,
  },

  addCategoryBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addCategoryBtnText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: COLORS.beanLightBlue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tagText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  dietaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  dietaryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    backgroundColor: COLORS.white,
  },
  dietaryChipSelected: {
    backgroundColor: COLORS.beanLightBlue,
    borderColor: COLORS.beanLightBlue,
  },
  dietaryChipText: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  dietaryChipTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },

  imageUploadBox: {
    height: 150,
    backgroundColor: COLORS.searchBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imageUploadText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    marginBottom: 20,
  },

  submitBtn: {
    backgroundColor: COLORS.beanDarkBlue,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },

  backButton: { marginTop: 30, alignItems: "center" },
  backButtonText: { color: COLORS.textMuted, fontSize: 14 },
});

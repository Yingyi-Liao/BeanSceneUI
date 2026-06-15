import React, { useState } from "react";
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

export default function UpdateDeleteItemScreen({ navigation, route }) {
  const { item, categories, categoryMap, username, role, isOnline = true } =
    route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const initialName = item?.itemName || "";
  const initialPrice = item?.price ? String(item.price) : "";
  const initialDesc = item?.description || "";
  const initialActive = item?.isActive === true || item?.isActive === "true";

  let parsedCategories = [];
  try {
    parsedCategories = Array.isArray(item?.categories)
      ? item.categories
      : JSON.parse(item?.categories || "[]");
  } catch {
    parsedCategories = [];
  }

  let parsedFlags = [];
  try {
    parsedFlags = Array.isArray(item?.dietaryFlags)
      ? item.dietaryFlags
      : JSON.parse(item?.dietaryFlags || "[]");
  } catch {
    parsedFlags = [];
  }

  const [itemName, setItemName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [description, setDescription] = useState(initialDesc);
  const [isActive, setIsActive] = useState(initialActive);

  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(
    parsedCategories.map((id) => ({
      id,
      name: categoryMap?.[id] || "Unknown",
    }))
  );

  const [selectedDietaryFlags, setSelectedDietaryFlags] = useState(parsedFlags);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

      let fileName = uri.split("/").pop();
      if (!fileName || !fileName.includes(".")) {
        fileName = `item-${Date.now()}.jpg`;
      }

      let ext = fileName.split(".").pop().toLowerCase();
      let type = "image/jpeg";
      if (ext === "png") type = "image/png";
      if (ext === "webp") type = "image/webp";

      setSelectedImage({ uri, name: fileName, type });
    }
  };

  const handleAddCategory = () => {
    if (!selectedCategory) return;

    const cat = categories.find((c) => c.id === selectedCategory);
    if (!cat) return;

    if (!selectedCategories.some((c) => c.id === cat.id)) {
      setSelectedCategories([...selectedCategories, { id: cat.id, name: cat.categoryName }]);
    }
  };

  const handleRemoveCategory = (id) => {
    setSelectedCategories(selectedCategories.filter((c) => c.id !== id));
  };

  const toggleDietaryFlag = (flag) => {
    setSelectedDietaryFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleUpdate = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isOnline) {
      setErrorMessage("❌ Cannot Update: System is OFFLINE");
      return;
    }

    if (!itemName.trim() || !price.trim()) {
      setErrorMessage("❌ Item name and price are required");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      setErrorMessage("❌ Price must be a valid number");
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

      selectedCategories.forEach((c) => {
        formData.append("categories[]", c.id);
      });

      selectedDietaryFlags.forEach((flag) => {
        formData.append("dietaryFlags[]", flag);
      });


      formData.append("file", {
        uri: selectedImage.uri,
        name: selectedImage.name,
        type: selectedImage.type,
      });


      const response = await fetch(`${API_BASE}/api/item/update/${item.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await response.json();
      if (!json.success) throw new Error(json.error || "Failed to update item");

      setSuccessMessage("✔ Item updated successfully!");

      setTimeout(() => {
        navigation.navigate("MenuManagement", { username, role, isOnline });
      }, 800);
    } catch (err) {
      setErrorMessage("❌ " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setSubmitting(true);
            const token = await SecureStore.getItemAsync("jwt");

            const response = await fetch(`${API_BASE}/api/item/delete/${item.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            const json = await response.json();
            if (!json.success) throw new Error(json.error || "Failed to delete item");

            navigation.navigate("MenuManagement", { username, role, isOnline });
          } catch (err) {
            setErrorMessage("❌ " + err.message);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
      await SecureStore.deleteItemAsync('jwt');
      navigation.replace('Login');
  };

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

      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>Update / Delete Item</Text>

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

        <View style={isTablet ? styles.tabletRow : null}>
          <View style={isTablet ? styles.tabletLeft : null}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              value={itemName}
              onChangeText={setItemName}
            />

            <Text style={styles.label}>Categories</Text>

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

            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
            />

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

          <View style={isTablet ? styles.tabletRight : null}>
            <Text style={styles.label}>Item Image</Text>
            <TouchableOpacity style={styles.imageUploadBox} onPress={handlePickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              ) : item?.file ? (
                <Image
                  source={{ uri: `${API_BASE}/static/${item.file}` }}
                  style={styles.previewImage}
                />
              ) : (
                <Text style={styles.imageUploadText}>Tap to upload image</Text>
              )}
            </TouchableOpacity>

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

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Item Active?</Text>
              <Switch
                trackColor={{ false: "#767577", true: COLORS.beanLightBlue }}
                thumbColor="#f4f3f4"
                value={isActive}
                onValueChange={setIsActive}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
              <Text style={styles.submitBtnText}>UPDATE ITEM</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>DELETE ITEM</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Menu Management</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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

  deleteBtn: {
    backgroundColor: COLORS.errorRed,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  deleteBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },

  backButton: { marginTop: 30, alignItems: "center" },
  backButtonText: { color: COLORS.textMuted, fontSize: 14 },
});

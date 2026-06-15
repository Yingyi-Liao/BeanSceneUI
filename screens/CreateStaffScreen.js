import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import {SafeAreaView} from 'react-native-safe-area-context';
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";

import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { API_BASE } from "../constants/apibase";
import { COLORS } from "../constants/colors";

export default function CreateStaffScreen({ route, navigation }) {
  const { username, role, isOnline = true } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // --- FORM STATE ---
  const [newUsername, setNewUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [selectedShift, setSelectedShift] = useState("");
  const [staffShifts, setStaffShifts] = useState([]);

  const [staffRole, setStaffRole] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  // -----------------------------
  // ADD / REMOVE SHIFTS
  // -----------------------------
  const handleAddShift = () => {
    if (!selectedShift) return;
    if (!staffShifts.includes(selectedShift)) {
      setStaffShifts([...staffShifts, selectedShift]);
    }
  };

  const handleRemoveShift = (shift) => {
    setStaffShifts(staffShifts.filter((s) => s !== shift));
  };

  // -----------------------------
  // CREATE STAFF
  // -----------------------------
  const handleCreate = async () => {
    setErrorMessage("");

    if (!isOnline) {
      setErrorMessage("❌ Cannot Create: System is OFFLINE");
      return;
    }

    // Required fields
    if (
      !newUsername ||
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !staffRole
    ) {
      setErrorMessage("❌ All required fields must be filled");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        Alert.alert("Session Expired", "Please log in again.");
        navigation.replace("Login");
        return;
      }

      const body = {
        username: newUsername,
        firstName,
        lastName,
        email,
        phone,
        password,
        role: staffRole,
        shift: staffShifts,
      };

      const response = await fetch(`${API_BASE}/api/user/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok) {
        setErrorMessage(json.error || "Failed to create staff");
        return;
      }

      Alert.alert("Success", "Staff created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setErrorMessage("Network error: " + err.message);
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
        <Text style={styles.screenTitle}>Create New Staff</Text>

        {/* ERROR BOX */}
        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* CENTERED TABLET LAYOUT */}
        <View style={isTablet ? styles.tabletCenterWrapper : null}>
          <View style={isTablet ? styles.tabletContent : null}>

            {/* USERNAME */}
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[styles.inputField, isTablet ? styles.inputFieldTablet : null]}
              value={newUsername}
              autoCapitalize="none"
              onChangeText={setNewUsername}
            />

            {/* FIRST NAME */}
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.inputField, isTablet ? styles.inputFieldTablet : null]}
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* LAST NAME */}
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.inputField, isTablet ? styles.inputFieldTablet : null]}
              value={lastName}
              onChangeText={setLastName}
            />

            {/* EMAIL */}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.inputField, isTablet ? styles.inputFieldTablet : null]}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
            />

            {/* PHONE */}
            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={[styles.inputField, isTablet ? styles.inputFieldTablet : null]}
              value={phone}
              keyboardType="phone-pad"
              onChangeText={setPhone}
            />

            {/* PASSWORD */}
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={[styles.inputField, isTablet ? styles.inputFieldTablet : null]}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />

            {/* SHIFT MULTI-SELECT */}
            <Text style={styles.label}>Staff Shift</Text>

            <View style={styles.dropdownWrapper}>
              <Picker
                selectedValue={selectedShift}
                onValueChange={(value) => setSelectedShift(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select shift..." value="" />
                <Picker.Item label="Morning" value="Morning" />
                <Picker.Item label="Afternoon" value="Afternoon" />
                <Picker.Item label="Evening" value="Evening" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.addShiftBtn} onPress={handleAddShift}>
              <Text style={styles.addShiftText}>＋ Add Shift</Text>
            </TouchableOpacity>

            {/* SHIFT CHIPS */}
            <View style={styles.shiftChipContainer}>
              {staffShifts.map((shift, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.shiftChip}
                  onPress={() => handleRemoveShift(shift)}
                >
                  <Text style={styles.shiftChipText}>{shift} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ROLE DROPDOWN */}
            <Text style={styles.label}>Staff Role *</Text>

            <View style={styles.dropdownWrapper}>
              <Picker
                selectedValue={staffRole}
                onValueChange={(value) => setStaffRole(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select role..." value="" />
                <Picker.Item label="Staff" value="staff" />
                <Picker.Item label="Manager" value="manager" />
              </Picker>
            </View>

            {/* CREATE BUTTON */}
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
              <Text style={styles.createBtnText}>CREATE STAFF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Staff Management</Text>
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

  logoutBtnSmall: {
    backgroundColor: COLORS.errorBg,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  logoutTextSmall: { fontSize: 12, color: COLORS.errorRed, fontWeight: "bold" },

  mainContent: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 26, fontWeight: "bold", color: COLORS.beanDarkBlue, marginBottom: 20 },

  errorBox: {
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: "bold" },

  tabletCenterWrapper: {
    width: "100%",
    alignItems: "center",
  },
  tabletContent: {
    width: "100%",
    maxWidth: 700,
    paddingHorizontal: 20,
  },

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

  shiftChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  shiftChip: {
    backgroundColor: COLORS.beanLightBlue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  shiftChipText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  addShiftBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addShiftText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  createBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  createBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },

  backButton: { marginTop: 30, alignItems: "center" },
  backButtonText: { color: COLORS.textMuted, fontSize: 14 },
});

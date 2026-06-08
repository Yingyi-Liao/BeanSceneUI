import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { API_BASE } from "../constants/apibase";
import { COLORS } from "../constants/colors";

export default function StaffManagementScreen({ navigation, route }) {
  const { username, role, isOnline = true } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Search + Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterShift, setFilterShift] = useState("all");

  // -----------------------------
  // FETCH STAFF LIST
  // -----------------------------
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_BASE}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();

      if (!response.ok) {
        setErrorMessage(json.error || "Failed to load staff");
        setLoading(false);
        return;
      }

      // Correct mapping — matches backend exactly
      const mapped = json.list.map((u) => ({
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || "",
        shift: u.shift || [],
        role: u.role,
      }));

      setStaffList(mapped);
      setLoading(false);
    } catch (err) {
      setErrorMessage("Network error: " + err.message);
      setLoading(false);
    }
  };

  // Auto-refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  // -----------------------------
  // FILTERED STAFF LIST
  // -----------------------------
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" ? true : s.role === filterRole;

    const matchesShift =
      filterShift === "all" ? true : s.shift.includes(filterShift);

    return matchesSearch && matchesRole && matchesShift;
  });

  // -----------------------------
  // OPEN UPDATE STAFF SCREEN
  // -----------------------------
  const handleOpenUpdateStaff = (staff) => {
    navigation.navigate("UpdateDeleteStaff", {
      staff,
      username,
      role,
      isOnline,
    });
  };

  // -----------------------------
  // OPEN CREATE STAFF SCREEN
  // -----------------------------
  const handleOpenCreateStaff = () => {
    navigation.navigate("CreateStaff", {
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
      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>Staff Management</Text>

        {/* ERROR BOX */}
        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* LOADING */}
        {loading && (
          <ActivityIndicator size="large" color={COLORS.beanMidBlue} style={{ marginTop: 20 }} />
        )}

        {/* CREATE STAFF BUTTON */}
        <TouchableOpacity style={styles.createBtn} onPress={handleOpenCreateStaff}>
          <Text style={styles.createBtnText}>＋ Create New Staff</Text>
        </TouchableOpacity>

        {/* SEARCH + FILTER BAR */}
        <View style={styles.filterContainer}>

          {/* SEARCH BAR */}
          <TextInput
            style={[styles.searchInput, isTablet ? styles.searchInputTablet : null]}
            placeholder="Search staff..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* ROLE FILTER */}
          <View style={styles.filterDropdown}>
            <Picker
              selectedValue={filterRole}
              onValueChange={(v) => setFilterRole(v)}
              style={styles.picker}
            >
              <Picker.Item label="All Roles" value="all" />
              <Picker.Item label="Staff" value="staff" />
              <Picker.Item label="Manager" value="manager" />
            </Picker>
          </View>

          {/* SHIFT FILTER */}
          <View style={styles.filterDropdown}>
            <Picker
              selectedValue={filterShift}
              onValueChange={(v) => setFilterShift(v)}
              style={styles.picker}
            >
              <Picker.Item label="All Shifts" value="all" />
              <Picker.Item label="Morning" value="Morning" />
              <Picker.Item label="Afternoon" value="Afternoon" />
              <Picker.Item label="Evening" value="Evening" />
            </Picker>
          </View>

        </View>

        {/* STAFF LIST */}
        <View style={isTablet ? styles.tabletCenterWrapper : null}>
          <View style={isTablet ? styles.tabletContent : null}>
            {filteredStaff.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                style={styles.staffCard}
                onPress={() => handleOpenUpdateStaff(staff)}
              >
                <Text style={styles.staffName}>
                  {staff.firstName} {staff.lastName}
                </Text>
                <Text style={styles.staffEmail}>{staff.email}</Text>
                <Text style={styles.staffRole}>{staff.role.toUpperCase()}</Text>
                <Text style={styles.staffShift}>
                  {staff.shift.length > 0 ? staff.shift.join(", ") : "No shift assigned"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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

  createBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  createBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "bold" },

  filterContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginBottom: 10,
    color: COLORS.textDark,
  },

  searchInputTablet: {
    padding: 14,
    fontSize: 18,
  },

  filterDropdown: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },

  picker: {
    width: "100%",
    height: 50,
  },

  tabletCenterWrapper: {
    width: "100%",
    alignItems: "center",
  },
  tabletContent: {
    width: "100%",
    maxWidth: 700,
  },

  staffCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 15,
  },

  staffName: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark },
  staffEmail: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  staffRole: { fontSize: 14, color: COLORS.beanMidBlue, marginTop: 4, fontWeight: "bold" },
  staffShift: { fontSize: 14, color: COLORS.textMid, marginTop: 4 },
});


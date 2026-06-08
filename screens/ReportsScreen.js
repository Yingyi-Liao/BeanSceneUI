import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

import { COLORS } from "../constants/colors";
import { fetchReportOrders } from "../services/reportService";
import BeanSceneLogo from "../images/BeanSceneLogo.jpg";

export default function ReportsScreen({ route, navigation }) {
  const { username, role, isOnline = true } = route.params || {};

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [sortField, setSortField] = useState("createdAt");
  const [sortAsc, setSortAsc] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, startDate, endDate, statusFilter, sortField, sortAsc]);

  async function loadOrders() {
    try {
      const jwt = await SecureStore.getItemAsync("jwt");
      const data = await fetchReportOrders(jwt, username, role);
      setOrders(data);
    } catch (err) {
      console.log("Report load error:", err.response?.data || err.message);
      setErrorMessage("Failed to load reports.");
    }
  }

  function applyFilters() {
    let result = [...orders];

    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((o) => o.createdAt >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      result = result.filter((o) => o.createdAt <= end);
    }

    if (statusFilter) {
      result = result.filter(
        (o) => o.status.toLowerCase() === statusFilter
      );
    }

    result.sort((a, b) => {
      const A = a[sortField];
      const B = b[sortField];

      if (sortField === "total") {
        return sortAsc ? A - B : B - A;
      }

      return sortAsc
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    setFilteredOrders(result);
  }

  function sortOrders(field) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  function getArrow(field) {
    if (sortField !== field) return "";
    return sortAsc ? " ▲" : " ▼";
  }

  function handleStartDateChange(event, selected) {
    setShowStartPicker(false);
    if (selected) {
      setStartDate(selected.toISOString().split("T")[0]);
    }
  }

  function handleEndDateChange(event, selected) {
    setShowEndPicker(false);
    if (selected) {
      setEndDate(selected.toISOString().split("T")[0]);
    }
  }

  const handleLogout = async () => {
      await SecureStore.deleteItemAsync('jwt');
      navigation.replace('Login');
    };

  function onBack() {
    navigation.goBack();
  }

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
      <View style={styles.headerContainer}>
        <Image source={BeanSceneLogo} style={styles.logo} resizeMode="contain" />

        <View style={styles.userProfile}>
          <View style={{ marginRight: 10 }}>
            <Text style={styles.userNameText}>{username}</Text>
            <Text style={styles.userRoleText}>{role.toUpperCase()}</Text>
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
        <Text style={styles.screenTitle}>Reports</Text>

        {errorMessage !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={styles.filterTitle}>Filters</Text>

        {/* START DATE */}
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateFieldText}>
            {startDate || "Select Start Date"}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        {/* END DATE */}
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.dateFieldText}>
            {endDate || "Select End Date"}
          </Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate ? new Date(endDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}

        {/* STATUS FILTER */}
        <Text style={styles.label}>Status</Text>
        <View style={styles.dropdownWrapper}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
            style={styles.picker}
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="In-Progress" value="in-progress" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Served" value="served" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>

        {/* TABLE HEADER */}
        <View style={styles.tableHeader}>
          <TouchableOpacity style={styles.col} onPress={() => sortOrders("id")}>
            <Text style={styles.colHeader}>Order ID{getArrow("id")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.col} onPress={() => sortOrders("table")}>
            <Text style={styles.colHeader}>Table{getArrow("table")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.col} onPress={() => sortOrders("total")}>
            <Text style={styles.colHeader}>Total{getArrow("total")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.col} onPress={() => sortOrders("createdAt")}>
            <Text style={styles.colHeader}>Date{getArrow("createdAt")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.col} onPress={() => sortOrders("createdAt")}>
            <Text style={styles.colHeader}>Time{getArrow("createdAt")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.col} onPress={() => sortOrders("status")}>
            <Text style={styles.colHeader}>Status{getArrow("status")}</Text>
          </TouchableOpacity>
        </View>

        {/* TABLE ROWS */}
        {filteredOrders.map((order, index) => {
          const dateStr = order.createdAt.toLocaleDateString();
          const timeStr = order.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col}>{order.id}</Text>
              <Text style={styles.col}>{order.table}</Text>
              <Text style={styles.col}>${order.total.toFixed(2)}</Text>
              <Text style={styles.col}>{dateStr}</Text>
              <Text style={styles.col}>{timeStr}</Text>
              <Text style={styles.col}>{order.status}</Text>
            </View>
          );
        })}

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------- STYLES ---------------------- */

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

  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: "row", alignItems: "center" },

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
    borderColor: COLORS.errorRed,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: "bold" },

  filterTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: COLORS.beanDarkBlue,
  },

  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: COLORS.textDark },

  dateField: {
    borderWidth: 1,
    borderColor: COLORS.beanLightGrey,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    marginBottom: 15,
  },
  dateFieldText: {
    fontSize: 16,
    color: COLORS.textDark,
  },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: COLORS.beanLightGrey,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
  },
  picker: {
    width: "100%",
    height: 50,
    color: COLORS.textDark,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.beanMidBlue,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  colHeader: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },

  col: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textDark,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.beanLightGrey,
  },

  backButton: { marginTop: 30, alignItems: "center" },
  backButtonText: { color: COLORS.textMuted, fontSize: 14 },
});

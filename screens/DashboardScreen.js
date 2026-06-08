import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  useWindowDimensions,
  StatusBar
} from "react-native";

import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { COLORS } from "../constants/colors";
import * as SecureStore from "expo-secure-store";
import { useNavigation, useRoute } from "@react-navigation/native";

const SystemStatusBar = ({ isOnline }) => (
  <View
    style={[
      styles.statusBar,
      { backgroundColor: isOnline ? COLORS.statusOnline : COLORS.statusOffline }
    ]}
  >
    <Text style={styles.statusText}>
      {isOnline ? "● System Online" : "○ System Offline"}
    </Text>
  </View>
);

const GlobalHeader = ({ username, role, onLogout, isTablet }) => (
  <View style={[styles.headerContainer, isTablet && styles.headerTablet]}>
    <Image
      source={BeanSceneLogo}
      style={isTablet ? styles.logoTablet : styles.logoMobile}
      resizeMode="contain"
    />

    <View style={styles.userProfile}>
      <View>
        <Text style={styles.userNameText}>{username}</Text>
        <Text style={styles.userRoleText}>{role.toUpperCase()}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtnSmall} onPress={onLogout}>
        <Text style={styles.logoutTextSmall}>Log Off</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function DashboardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, role } = route.params;

  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const isManager = role === "manager";

  useEffect(() => {
    const verifyToken = async () => {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) {
        navigation.replace("Login");
      }
    };
    verifyToken();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("jwt");
    navigation.replace("Login");
  };

  const staffButtons = [
    { id: "1", label: "📝 Create Order", color: COLORS.beanLightBlue, screen: "CreateOrderMenu" },
    { id: "2", label: "📋 Active Orders", color: COLORS.beanMidBlue, screen: "ActiveOrders" },
    { id: "3", label: "🍳 Kitchen Orders", color: COLORS.beanDarkBlue, screen: "KitchenOrders" }
  ];

  const managerButtons = [
    { id: "4", label: "🍔 Menu Mgmt", color: COLORS.beanMidBlue, screen: "MenuManagement" },
    { id: "5", label: "👥 Staff Mgmt", color: COLORS.beanDarkBlue, screen: "StaffManagement" },
    { id: "6", label: "📊 Reports", color: COLORS.beanLightBlue, screen: "Reports" }
  ];

  const handleNavigate = (screen) => {
    navigation.navigate(screen, { username, role });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" />

      <SystemStatusBar isOnline={true} />

      <GlobalHeader
        username={username}
        role={role}
        onLogout={handleLogout}
        isTablet={isTablet}
      />

      <View style={styles.dashboardContainer}>
        <Text style={styles.dashboardTitle}>Dashboard</Text>

        {!isTablet && (
          <View style={styles.buttonGridMobile}>
            {staffButtons.map((btn) => (
              <TouchableOpacity
                key={btn.id}
                style={[styles.actionCard, { backgroundColor: btn.color }]}
                onPress={() => handleNavigate(btn.screen)}
              >
                <Text style={styles.cardLabel}>{btn.label}</Text>
              </TouchableOpacity>
            ))}

            {isManager &&
              managerButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.id}
                  style={[styles.actionCard, { backgroundColor: btn.color }]}
                  onPress={() => handleNavigate(btn.screen)}
                >
                  <Text style={styles.cardLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {isTablet && (
          <View style={styles.tabletGridWrapper}>
            <View style={styles.tabletRow}>
              {staffButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.id}
                  style={[styles.tabletCard, { backgroundColor: btn.color }]}
                  onPress={() => handleNavigate(btn.screen)}
                >
                  <Text style={styles.cardLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {isManager && (
              <View style={styles.tabletRow}>
                {managerButtons.map((btn) => (
                  <TouchableOpacity
                    key={btn.id}
                    style={[styles.tabletCard, { backgroundColor: btn.color }]}
                    onPress={() => handleNavigate(btn.screen)}
                  >
                    <Text style={styles.cardLabel}>{btn.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    alignItems: "flex-start"
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder
  },
  headerTablet: {
    paddingHorizontal: 40,
    paddingVertical: 15
  },
  logoMobile: { width: 100, height: 40 },
  logoTablet: { width: 180, height: 70 },

  userProfile: { flexDirection: "row", alignItems: "center" },
  userNameText: { fontSize: 14, fontWeight: "bold", color: COLORS.textDark },
  userRoleText: { fontSize: 10, color: COLORS.textMuted },
  logoutBtnSmall: {
    marginLeft: 15,
    backgroundColor: COLORS.errorBg,
    padding: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.errorBorder
  },
  logoutTextSmall: {
    fontSize: 10,
    color: COLORS.errorRed,
    fontWeight: "bold"
  },

  dashboardContainer: { flex: 1, padding: 20, justifyContent: "center" },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
    marginBottom: 30,
    textAlign: "center"
  },

  buttonGridMobile: {
    flexDirection: "column",
    gap: 15
  },

  tabletGridWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginTop: 20
  },
  tabletRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30
  },
  tabletCard: {
    width: 220,
    height: 120,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5
  },

  actionCard: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  cardLabel: { color: COLORS.white, fontSize: 18, fontWeight: "bold" }
});

import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions
} from "react-native";

import BeanSceneLogo from "../images/BeanSceneLogo.jpg";
import { COLORS } from "../constants/colors";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../constants/apibase.js";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  // ⭐ Tablet layout only when device is large AND landscape
  const isTablet = width >= 600;
  const isLandscape = width > height;
  const useTabletLayout = isTablet;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setErrorMessage("");

      if (!username || !password) {
        setErrorMessage("Username and password are required");
        return;
      }

      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        }
      );

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setErrorMessage(data.error || "Login failed");
        return;
      }

      const token = data.token;

      if (!token) {
        setErrorMessage("Login failed: No token received");
        return;
      }

      await SecureStore.setItemAsync("jwt", String(token));

      navigation.replace("Dashboard", {
        username: data.data.username,
        role: data.data.role
      });

    } catch (err) {
      setLoading(false); // ⭐ Stop loading on error
      setErrorMessage("Network error: " + err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.loginContainer, useTabletLayout && styles.loginTablet]}>
        
        {/* Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.brandLogoWrapper}>
            <Image
              source={BeanSceneLogo}
              style={isTablet ? styles.largeLogoTablet : styles.largeLogoMobile}
              resizeMode="contain"
            />
          </View>
          <View style={styles.appNameContainer}>
            <Text style={styles.appNameText}>Bean Scene</Text>
            <Text style={styles.appSubName}>Ordering System</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.screenTitle}>Login</Text>

          {errorMessage !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Loading..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}


// --- STYLES ---
const styles = StyleSheet.create({
  loginContainer: { flex: 1, padding: 25, justifyContent: "center" },
  loginTablet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },

  brandSection: { alignItems: "center", justifyContent: "center" },
  brandLogoWrapper: { marginBottom: 10 },
  largeLogoMobile: { width: 200, height: 100 },
  largeLogoTablet: { width: 350, height: 180 },

  appNameContainer: { alignItems: "center" },
  appNameText: { fontSize: 32, fontWeight: "bold", color: COLORS.beanDarkBlue },
  appSubName: { fontSize: 16, color: COLORS.beanMidBlue },

  formSection: { width: "100%", maxWidth: 400 },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.beanDarkBlue,
    marginBottom: 20,
    textAlign: "center"
  },

  errorBox: {
    backgroundColor: COLORS.errorBg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    marginBottom: 20
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },

  inputLabel: {
    fontSize: 14,
    color: COLORS.beanDarkBlue,
    fontWeight: "600",
    marginBottom: 5,
    marginLeft: 5
  },
  inputField: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.beanLightGrey,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15
  },

  loginBtn: {
    backgroundColor: COLORS.beanLightBlue,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 2
  },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" }
});

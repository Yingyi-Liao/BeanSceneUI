import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';

// Import your logo
import BeanSceneLogo from './images/BeanSceneLogo.jpg';

const COLORS = {
  beanDarkBlue: '#083944',
  beanMidBlue: '#2F6672',
  beanLightBlue: '#4AA1B5',
  white: '#FFFFFF',
  beanLightGrey: '#E0E0E0',
  errorRed: '#D32F2F',
  errorBg: '#FFEBEE',
};

// --- LOGIN SCREEN ---
const LoginScreen = ({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  errorMessage,
  isTablet,
}) => (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <View style={[styles.loginContainer, isTablet && styles.loginTablet]}>
      
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

        {errorMessage !== '' && (
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

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
);

// --- DASHBOARD SCREEN ---
const DashboardScreen = ({ logout, userRole }) => (
  <View style={styles.container}>
    <Text style={styles.mainHeading}>Dashboard</Text>
    <Text style={styles.bodyText}>Role: {userRole?.toUpperCase()}</Text>

    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

// --- MAIN APP ---
export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [userRole, setUserRole] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      setErrorMessage('⚠️ Error: Please enter both username and password');
      return;
    }

    setErrorMessage('');
    const role = username.toLowerCase() === 'manager' ? 'manager' : 'staff';
    setUserRole(role);
    setCurrentScreen('dashboard');
  };

  const logout = () => {
    setUserRole(null);
    setCurrentScreen('login');
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" />

      {/* Header bar */}
      <View style={styles.headerContainer}>
        <View style={styles.headerBar} />
      </View>

      <View style={{ flex: 1 }}>
        {currentScreen === 'login' ? (
          <LoginScreen
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            errorMessage={errorMessage}
            isTablet={isTablet}
          />
        ) : (
          <DashboardScreen userRole={userRole} logout={logout} />
        )}
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  headerContainer: {
    height: 50,
    backgroundColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    justifyContent: 'center',
  },
  headerBar: { height: 1, backgroundColor: '#CCC', width: '100%' },

  loginContainer: { flex: 1, padding: 25, justifyContent: 'center' },
  loginTablet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  brandSection: { alignItems: 'center', justifyContent: 'center' },
  brandLogoWrapper: { marginBottom: 10 },
  largeLogoMobile: { width: 200, height: 100 },
  largeLogoTablet: { width: 350, height: 180 },

  appNameContainer: { alignItems: 'center' },
  appNameText: { fontSize: 32, fontWeight: 'bold', color: COLORS.beanDarkBlue },
  appSubName: { fontSize: 16, color: COLORS.beanMidBlue },

  formSection: { width: '100%', maxWidth: 400 },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.beanDarkBlue,
    marginBottom: 20,
    textAlign: 'center',
  },

  errorBox: {
    backgroundColor: COLORS.errorBg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    marginBottom: 20,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  inputLabel: {
    fontSize: 14,
    color: COLORS.beanDarkBlue,
    fontWeight: '600',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputField: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.beanLightGrey,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },

  loginBtn: {
    backgroundColor: COLORS.beanLightBlue,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  mainHeading: { fontSize: 24, color: COLORS.beanLightBlue, fontWeight: 'bold' },
  bodyText: { fontSize: 16, color: COLORS.beanDarkBlue },
  logoutBtn: { marginTop: 40 },
  logoutText: { color: COLORS.errorRed, fontWeight: 'bold', fontSize: 16 },
});

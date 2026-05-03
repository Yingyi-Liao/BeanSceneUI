import React, { useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  useWindowDimensions,
  StatusBar
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
  statusOnline: '#2E7D32', // Green
  statusOffline: '#C62828', // Red
};

// --- 1. COMPONENT: Status Bar (Top of App) ---
const SystemStatusBar = ({ isOnline }) => (
  <View style={[styles.statusBar, { backgroundColor: isOnline ? COLORS.statusOnline : COLORS.statusOffline }]}>
    <Text style={styles.statusText}>{ 
      isOnline ? '● System Online' : '○ System Offline'
    }</Text>
  </View>
);

// --- 2. COMPONENT: Global Header (Logo Left, User Right) ---
const GlobalHeader = ({ username, role, onLogout, isTablet }) => (
  <View style={[styles.headerContainer, isTablet && styles.headerTablet]}>
    {/* Top Left: Logo */}
    <Image 
      source={BeanSceneLogo} 
      style={isTablet ? styles.logoTablet : styles.logoMobile} 
      resizeMode="contain" 
    />

    {/* Top Right: User Info & Logout */}
    <View style={styles.userProfile}>
      <View>
        <Text style={styles.userNameText}>{username || 'User'}</Text>
        <Text style={styles.userRoleText}>{role ? role.toUpperCase() : 'Guest'}</Text>
      </View>
      <TouchableOpacity style={styles.logoutBtnSmall} onPress={onLogout}>
        <Text style={styles.logoutTextSmall}>Log Off</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// --- 3. COMPONENT: Dashboard (The Main Content) ---
const DashboardScreen = ({ userRole, isTablet }) => {
  const staffButtons = [
    { id: '1', label: '📝 Create Order', color: COLORS.beanLightBlue },
    { id: '2', label: '📋 Active Orders', color: COLORS.beanMidBlue },
    { id: '3', label: '🍳 Kitchen Orders', color: COLORS.beanDarkBlue },
  ];

  const managerButtons = [
    { id: '4', label: '🍔 Menu Mgmt', color: COLORS.beanMidBlue },
    { id: '5', label: '👥 Staff Mgmt', color: COLORS.beanDarkBlue },
    { id: '6', label: '📊 Reports', color: COLORS.beanLightBlue },
  ];

  const isManager = userRole === 'manager';

  return (
    <View style={styles.dashboardContainer}>
      <Text style={styles.dashboardTitle}>Dashboard</Text>

      {/* MOBILE VIEW — vertical list */}
      {!isTablet && (
        <View style={styles.buttonGridMobile}>
          {staffButtons.map(btn => (
            <TouchableOpacity key={btn.id} style={[styles.actionCard, { backgroundColor: btn.color }]}>
              <Text style={styles.cardLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}

          {isManager &&
            managerButtons.map(btn => (
              <TouchableOpacity key={btn.id} style={[styles.actionCard, { backgroundColor: btn.color }]}>
                <Text style={styles.cardLabel}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* TABLET VIEW — 3 staff buttons on top row, 3 manager buttons on bottom row */}
      {isTablet && (
        <View style={styles.tabletGridWrapper}>
          
          {/* Staff Row */}
          <View style={styles.tabletRow}>
            {staffButtons.map(btn => (
              <TouchableOpacity 
                key={btn.id} 
                style={[styles.tabletCard, { backgroundColor: btn.color }]}
              >
                <Text style={styles.cardLabel}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manager Row (only if manager) */}
          {isManager && (
            <View style={styles.tabletRow}>
              {managerButtons.map(btn => (
                <TouchableOpacity 
                  key={btn.id} 
                  style={[styles.tabletCard, { backgroundColor: btn.color }]}
                >
                  <Text style={styles.cardLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </View>
      )}
    </View>
  );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600; 

  // Mock State for Demo
  const [userRole, setUserRole] = useState('staff'); // Change to 'staff' to test RBAC
  const [isOnline, setIsOnline] = useState(true);    // Toggle this to test Status Bar
  const [username, setUsername] = useState('Yingyi');

  const handleLogout = () => {
    setUserRole(null);
    setUsername('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar barStyle="dark-content" />
      
      {/* 1. System Status Bar */}
      <SystemStatusBar isOnline={isOnline} />

      {/* 2. Global Header */}
      <GlobalHeader 
        username={username} 
        role={userRole} 
        onLogout={handleLogout} 
        isTablet={isTablet} 
      />

      {/* 3. Main Content Area */}
      <View style={{ flex: 1 }}>
        {userRole ? (
          <DashboardScreen userRole={userRole} isTablet={isTablet} />
        ) : (
          <View style={styles.loginPlaceholder}>
            <Text>No user logged in. Please use the Login Screen.</Text>
            <TouchableOpacity onPress={() => setUserRole('manager')} style={{marginTop: 20}}>
                <Text style={{color: 'blue'}}>Simulate Manager Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  // Status Bar
  statusBar: { paddingVertical: 4, paddingHorizontal: 15, alignItems: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: 'white' },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  headerTablet: { paddingHorizontal: 40, paddingVertical: 15 },
  logoMobile: { width: 100, height: 40 },
  logoTablet: { width: 180, height: 70 },
  
  userProfile: { flexDirection: 'row', alignItems: 'center' },
  userNameText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  userRoleText: { fontSize: 10, color: '#666' },
  logoutBtnSmall: { marginLeft: 15, backgroundColor: '#FFEBEE', padding: 5, borderRadius: 4, borderWidth: 1, borderColor: '#FFCDD2' },
  logoutTextSmall: { fontSize: 10, color: '#D32F2F', fontWeight: 'bold' },

  // Dashboard
  dashboardContainer: { flex: 1, padding: 20, justifyContent: 'center' },
  dashboardTitle: { fontSize: 28, fontWeight: 'bold', color: '#083944', marginBottom: 30, textAlign: 'center' },
  
  buttonGrid: { flexDirection: 'column', gap: 15 }, // Mobile: Vertical Stack
  gridTablet: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }, // Tablet: Grid

  actionCard: {
    width: '100%', // Mobile: Full width
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardLabel: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // Placeholder
  loginPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  buttonGridMobile: {
  flexDirection: 'column',
  gap: 15,
},

// TABLET GRID
tabletGridWrapper: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 30,
  marginTop: 20,
},

tabletRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 30,
},

tabletCard: {
  width: 220,
  height: 120,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 5,
},

});
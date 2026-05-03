import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import BeanSceneLogo from './images/BeanSceneLogo.jpg';

const COLORS = {
  beanDarkBlue: '#083944',
  beanMidBlue: '#2F6672',
  beanLightBlue: '#4AA1B5',
  white: '#FFFFFF',
  errorRed: '#D32F2F',
  statusOnline: '#2E7D32',
  statusOffline: '#C62828',
  lightGrey: '#F5F5F5',
};

export default function CreateStaffScreen({ isOnline = true, onBack }) {
  const username = 'Yingyi';
  const role = 'manager';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // --- FORM STATE ---
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  // Multi-shift selection
  const [selectedShift, setSelectedShift] = useState('');
  const [staffShifts, setStaffShifts] = useState([]);

  // Role dropdown
  const [staffRole, setStaffRole] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const handleAddShift = () => {
    if (!selectedShift) return;
    if (!staffShifts.includes(selectedShift)) {
      setStaffShifts([...staffShifts, selectedShift]);
    }
  };

  const handleRemoveShift = (shift) => {
    setStaffShifts(staffShifts.filter(s => s !== shift));
  };

  const handleSubmit = () => {
    if (!isOnline) {
      setErrorMessage('❌ Cannot Submit: System is OFFLINE');
      return;
    }
    if (!staffName || !staffRole) {
      setErrorMessage('❌ Error: Staff name and role are required');
      return;
    }

    Alert.alert(
      'Success',
      `Staff "${staffName}" has been created successfully!`,
      [{ text: 'OK', onPress: onBack }]
    );
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
          {isOnline ? '● System Online' : '○ System Offline'}
        </Text>
      </View>

      {/* HEADER */}
      <View style={[styles.headerContainer, isTablet && styles.headerContainerTablet]}>
        <Image source={BeanSceneLogo} style={styles.logo} resizeMode="contain" />

        <View style={[styles.userProfile, isTablet && styles.userProfileTablet]}>
          <View style={{ marginRight: 10 }}>
            <Text style={styles.userNameText}>{username}</Text>
            <Text style={styles.userRoleText}>{role.toUpperCase()}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtnSmall}
            onPress={() => Alert.alert('Logout', 'Logged out')}
          >
            <Text style={styles.logoutTextSmall}>Log Off</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>Create New Staff</Text>

        {/* ERROR BOX */}
        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* CENTERED TABLET LAYOUT */}
        <View style={isTablet ? styles.tabletCenterWrapper : null}>
          <View style={isTablet ? styles.tabletContent : null}>

            {/* STAFF NAME */}
            <Text style={styles.label}>Staff Name</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              placeholder="e.g. Alice Johnson"
              value={staffName}
              onChangeText={setStaffName}
            />

            {/* STAFF EMAIL */}
            <Text style={styles.label}>Staff Email</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              placeholder="e.g. alice@example.com"
              value={staffEmail}
              onChangeText={setStaffEmail}
            />

            {/* STAFF PHONE */}
            <Text style={styles.label}>Staff Phone</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              placeholder="e.g. 0400 123 456"
              value={staffPhone}
              onChangeText={setStaffPhone}
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
            <Text style={styles.label}>Staff Role</Text>

            <View style={styles.dropdownWrapper}>
              <Picker
                selectedValue={staffRole}
                onValueChange={(value) => setStaffRole(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select role..." value="" />
                <Picker.Item label="Staff" value="Staff" />
                <Picker.Item label="Manager" value="Manager" />
              </Picker>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>SUBMIT STAFF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Staff Management</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  statusBar: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  headerContainerTablet: {
    paddingHorizontal: 40,
    paddingVertical: 25,
  },

  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: 'row', alignItems: 'center' },
  userProfileTablet: { gap: 20 },

  logoutBtnSmall: {
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutTextSmall: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },

  mainContent: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: '#083944', marginBottom: 20 },

  errorBox: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginBottom: 15,
  },
  errorText: { color: '#D32F2F', fontWeight: 'bold' },

  /* CENTERED TABLET LAYOUT */
  tabletCenterWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  tabletContent: {
    width: '100%',
    maxWidth: 700,
    paddingHorizontal: 20,
  },

  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },

  inputField: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  inputFieldTablet: {
    padding: 16,
    fontSize: 18,
  },

  /* DROPDOWN */
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
  },
  picker: {
    width: '100%',
    height: 50,
  },

  /* SHIFT CHIPS */
  shiftChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    color: 'white',
    fontWeight: 'bold',
  },

  addShiftBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  addShiftText: {
    color: 'white',
    fontWeight: 'bold',
  },

  submitBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  backButton: { marginTop: 30, alignItems: 'center' },
  backButtonText: { color: '#666', fontSize: 14 },
});

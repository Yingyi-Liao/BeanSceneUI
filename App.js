import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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

export default function ReportsScreen({ isOnline = true, onBack }) {
  const username = 'Yingyi';
  const role = 'manager';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [errorMessage, setErrorMessage] = useState('');

  // MOCK ORDER DATA
  const [orders, setOrders] = useState([
    { id: 'ORD-001', table: 'M1', total: 24.50, date: '2026-05-01', time: '09:15', status: 'Completed' },
    { id: 'ORD-002', table: 'O3', total: 18.00, date: '2026-05-01', time: '10:22', status: 'Completed' },
    { id: 'ORD-003', table: 'B2', total: 32.20, date: '2026-05-02', time: '11:40', status: 'In-Progress' },
    { id: 'ORD-004', table: 'M4', total: 12.00, date: '2026-05-02', time: '12:05', status: 'Completed' },
    { id: 'ORD-005', table: 'O7', total: 45.90, date: '2026-05-03', time: '13:55', status: 'Served' },
  ]);

  const [sortField, setSortField] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const getArrow = (field) => {
    if (sortField !== field) return '';
    return sortAsc ? ' ▲' : ' ▼';
  };

  const sortOrders = (field) => {
    const newAsc = field === sortField ? !sortAsc : true;
    setSortField(field);
    setSortAsc(newAsc);

    const sorted = [...orders].sort((a, b) => {
      if (a[field] < b[field]) return newAsc ? -1 : 1;
      if (a[field] > b[field]) return newAsc ? 1 : -1;
      return 0;
    });

    setOrders(sorted);
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setStartDate(iso);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().split('T')[0];
      setEndDate(iso);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    const matchStart = startDate ? order.date >= startDate : true;
    const matchEnd = endDate ? order.date <= endDate : true;
    return matchStatus && matchStart && matchEnd;
  });

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
        <Text style={styles.screenTitle}>Reports</Text>

        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={isTablet ? styles.tabletCenterWrapper : null}>
          <View style={isTablet ? styles.tabletContent : null}>

            <Text style={styles.filterTitle}>Filters</Text>

            {/* START DATE */}
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateFieldText}>
                {startDate || 'Select Start Date'}
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
                {endDate || 'Select End Date'}
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
                <Picker.Item label="In-Progress" value="In-Progress" />
                <Picker.Item label="Completed" value="Completed" />
                <Picker.Item label="Served" value="Served" />
              </Picker>
            </View>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
              <TouchableOpacity style={styles.col} onPress={() => sortOrders('id')}>
                <Text style={styles.colHeader}>Order ID{getArrow('id')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.col} onPress={() => sortOrders('table')}>
                <Text style={styles.colHeader}>Table{getArrow('table')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.col} onPress={() => sortOrders('total')}>
                <Text style={styles.colHeader}>Total{getArrow('total')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.col} onPress={() => sortOrders('date')}>
                <Text style={styles.colHeader}>Date{getArrow('date')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.col} onPress={() => sortOrders('time')}>
                <Text style={styles.colHeader}>Time{getArrow('time')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.col} onPress={() => sortOrders('status')}>
                <Text style={styles.colHeader}>Status{getArrow('status')}</Text>
              </TouchableOpacity>
            </View>

            {/* TABLE ROWS */}
            {filteredOrders.map((order, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col}>{order.id}</Text>
                <Text style={styles.col}>{order.table}</Text>
                <Text style={styles.col}>${order.total.toFixed(2)}</Text>
                <Text style={styles.col}>{order.date}</Text>
                <Text style={styles.col}>{order.time}</Text>
                <Text style={styles.col}>{order.status}</Text>
              </View>
            ))}

          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES
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

  tabletCenterWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  tabletContent: {
    width: '100%',
    maxWidth: 900,
    paddingHorizontal: 20,
  },

  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.beanDarkBlue,
  },

  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },

  dateField: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: 15,
  },
  dateFieldText: {
    fontSize: 16,
    color: '#333',
  },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  picker: {
    width: '100%',
    height: 50,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.beanMidBlue,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  colHeader: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  col: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  backButton: { marginTop: 30, alignItems: 'center' },
  backButtonText: { color: '#666', fontSize: 14 },
});

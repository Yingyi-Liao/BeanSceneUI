import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen.js";

import DashboardScreen from "../screens/DashboardScreen.js";

import ActiveOrdersScreen from "../screens/ActiveOrdersScreen.js";
import KitchenOrdersScreen from "../screens/KitchenOrdersScreen.js";

import CreateOrderMenuScreen from "../screens/CreateOrderMenuScreen.js";

import MenuManagementScreen from "../screens/MenuManagementScreen.js";
import CreateItemScreen from "../screens/CreateItemScreen.js";
import UpdateDeleteItemScreen from "../screens/UpdateDeleteItemScreen.js";

import CategoryManagementScreen from "../screens/CategoryManagementScreen.js";
import CreateCategoryScreen from "../screens/CreateCategoryScreen.js";
import UpdateDeleteCategoryScreen from "../screens/UpdateDeleteCategoryScreen.js";
import StaffManagementScreen from "../screens/StaffManagementScreen.js";
import CreateStaffScreen from "../screens/CreateStaffScreen.js";
import UpdateDeleteStaffScreen from "../screens/UpdateDeleteStaffScreen.js";
import ReportsScreen from "../screens/ReportsScreen.js";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Dashboard */}
      <Stack.Screen name="Dashboard" component={DashboardScreen} />

      {/* Orders */}
      <Stack.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
      <Stack.Screen name="KitchenOrders" component={KitchenOrdersScreen} />

      {/* Menu */}
      <Stack.Screen name="CreateOrderMenu" component={CreateOrderMenuScreen} />

      {/* Menu Management*/}
      <Stack.Screen name="MenuManagement" component={MenuManagementScreen} />
      <Stack.Screen name="CreateItem" component={CreateItemScreen} />
      <Stack.Screen name="UpdateDeleteItem" component={UpdateDeleteItemScreen} />
      

      {/* Categories */}
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Stack.Screen name="CreateCategory" component={CreateCategoryScreen} />
      <Stack.Screen name="UpdateDeleteCategory" component={UpdateDeleteCategoryScreen} />

      {/* Staff */}
      <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />
      <Stack.Screen name="CreateStaff" component={CreateStaffScreen} />
      <Stack.Screen name="UpdateDeleteStaff" component={UpdateDeleteStaffScreen} />

      {/* Reports */}
      <Stack.Screen name="Reports" component={ReportsScreen} />

    </Stack.Navigator>
  );
}
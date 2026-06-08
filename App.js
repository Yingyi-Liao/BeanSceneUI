import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { OrderProvider } from "./context/OrderContext";

export default function App() {
  return (
  <OrderProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </OrderProvider>
  );
}
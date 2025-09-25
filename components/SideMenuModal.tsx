// components/SideMenuModal.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const SideMenuModal: React.FC<SideMenuModalProps> = ({ visible, onClose }) => {
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear login token from AsyncStorage
            await AsyncStorage.removeItem("login_token");

            // Close the side menu modal
            onClose();

            // Redirect to login screen
            router.replace("/login");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleMenuPress = (path: string) => {
    onClose();

    if (path === "/login") {
      // For logout, use the handleLogout function instead of router.push
      handleLogout();
    } else {
      // For other menu items, navigate normally
      router.push(path);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.sideMenu}>
          <Text style={styles.menuTitle}>Menu</Text>

          {[
            ["Profile", "/profile"],
            ["Summary", "/daysummary"],
            ["History", "/saleshistory"],
            ["Logout", "/login"], // This will trigger logout functionality
          ].map(([label, path]) => (
            <TouchableOpacity key={label} onPress={() => handleMenuPress(path)}>
              <Text style={styles.menuItem}>{label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.menuFooter}>
            <Text style={styles.logoText}>
              <Text style={styles.logoOrange}>i</Text>POS
            </Text>
            <Text style={styles.footerText}>Powered by introps IT</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SideMenuModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
  },
  sideMenu: {
    width: 250,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#666666",
  },
  menuItem: {
    fontSize: 16,
    marginVertical: 12,
    color: "#333",
    left: 15,
  },
  menuFooter: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "flex-end",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c1c",
  },
  logoOrange: {
    color: "#f57c00",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});

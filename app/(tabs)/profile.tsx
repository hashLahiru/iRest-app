import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import SideMenuModal from "@/components/SideMenuModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/table")}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Side Menu Modal */}
      <SideMenuModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Profile Content */}
      <ScrollView contentContainerStyle={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.avatar}
          />
          <Text style={styles.name}>Sunera Introps</Text>
          <Text style={styles.email}>sunera@example.com</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>Admin</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Branch</Text>
          <Text style={styles.infoValue}>Kandy</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.removeItem("login_token");
            router.replace("/login");
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f4f2" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1c1c1c",
    right: 100,
  },
  profileContent: {
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#999",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#f57c00",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navItemContainer: { alignItems: "center" },
  navText: { fontSize: 12, color: "#888", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  quickMenuModal: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  menuIconBox: {
    width: "30%",
    alignItems: "center",
    marginVertical: 15,
  },
  menuLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
});

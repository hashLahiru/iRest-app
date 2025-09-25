import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import NavBar from "@/components/NavButton";
import SideMenuModal from "@/components/SideMenuModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const boxSize = screenWidth / 2 - 24;

export default function DeliveryScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    const login_token = await AsyncStorage.getItem("login_token");
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://raiza.digieclipse.com/App_apiv2/app_api",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            function: "get_delivery_orders",
            data: { login_token },
          }),
        }
      );

      const json = await response.json();
      console.log(json);

      if (json.status === "success" && Array.isArray(json.order)) {
        const mappedOrders = json.order.map((o) => ({
          id: o.ts_id,
          finalValue: parseFloat(o.otot - o.dis_amount),
          total: parseFloat(o.otot),
          discount: parseFloat(o.dis_amount) || 0,
        }));
        setOrders(mappedOrders);
      } else {
        await AsyncStorage.removeItem("login_token");
        router.replace("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    if (index === 0) {
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/mainbillingDelivery",
              params: {
                tableId: "-2",
                orderStatus: "delivery_new",
              },
            })
          }
          style={[
            styles.orderBox,
            { backgroundColor: "#999999", width: boxSize },
          ]}
        >
          <Ionicons name="add" size={32} color="#fff" />
          <Text style={[styles.orderLabel, { color: "#fff" }]}>
            New Delivery
          </Text>
        </TouchableOpacity>
      );
    }

    const order = orders[index - 1];

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/payment",
            params: {
              ts_id: order.id,
              orderStatus: "delivery_pending",
            },
          })
        }
        style={[
          styles.orderBox,
          { backgroundColor: "#f57c00", width: boxSize },
        ]}
      >
        <Text style={styles.orderLabel}>Order#{order.id}</Text>
        <Text style={styles.finalValue}>{order.finalValue.toFixed(2)}</Text>
        <SafeAreaView style={styles.bottomRow}>
          <Text style={styles.bottomLeft}>{order.total.toFixed(2)}</Text>
          <Text style={styles.bottomRight}>-{order.discount.toFixed(2)}</Text>
        </SafeAreaView>
      </TouchableOpacity>
    );
  };

  const data = [{ id: "new" }, ...orders];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#f57c00" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#1c1c1c", "#d76400"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery</Text>
        <Text style={styles.logo}>
          <Text style={styles.logoOrange}>i</Text>POS
        </Text>
      </LinearGradient>

      {/* Side Menu Modal */}
      <SideMenuModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Orders Grid */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.id ? `order-${item.id}` : `new-${index}`
        }
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchOrders}
      />

      {/* Bottom Nav */}
      <NavBar
        activeRoute="Delivery"
        onQuickMenuPress={() => setQuickMenuVisible(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f4f2" },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomRightRadius: 40,
  },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "500", right: 100 },
  logo: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  logoOrange: { color: "#f57c00" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  logoText: { fontSize: 20, fontWeight: "700", color: "#222" },
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
  menuFooter: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "flex-end",
  },
  footerText: { fontSize: 12, color: "#666", marginTop: 4 },
  menuItem: { fontSize: 16, marginVertical: 12, color: "#333", left: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  riderImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 100,
  },
  actionButton: {
    backgroundColor: "#f57c00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16, marginLeft: 8 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navItemContainer: { alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 12, color: "#ccc", marginTop: 4, fontWeight: "500" },
  orderBox: {
    borderRadius: 12,
    margin: 8,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 110,
  },
  gridContainer: { paddingHorizontal: 10, paddingTop: 15, paddingBottom: 100 },
  orderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  orderStatus: { fontSize: 14, color: "#fff", fontWeight: "500" },
  loadingContainer: { justifyContent: "center", alignItems: "center" },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "red", marginBottom: 20, textAlign: "center" },
  retryButton: { backgroundColor: "#f57c00", padding: 10, borderRadius: 5 },
  retryButtonText: { color: "white", fontWeight: "bold" },
  finalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 4,
  },
  bottomRow: {
    position: "absolute",
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomLeft: { fontSize: 12, fontWeight: 700, color: "#fff" },
  bottomRight: { fontSize: 12, fontWeight: 700, color: "#fff" },
});

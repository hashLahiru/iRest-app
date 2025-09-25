import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import QuickMenuModal from "@/components/QuickMenuModal";

const API_URL = "https://raiza.digieclipse.com/App_apiv2/app_api";

export default function BillScreenDineIn() {
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const params = useGlobalSearchParams();
  const [saving, setSaving] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<
    {
      id: string;
      foodItemId?: string;
      name: string;
      qty: number;
      rate: number;
    }[]
  >([]);

  const parseCartItems = (raw: unknown) => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;

      let str = String(raw);

      let maybeDecoded = str;
      try {
        if (/%[0-9A-Fa-f]{2}/.test(str)) {
          maybeDecoded = decodeURIComponent(str);
        }
      } catch {
        // ignore decode errors
      }

      try {
        return JSON.parse(maybeDecoded);
      } catch {
        return JSON.parse(str);
      }
    } catch (e) {
      console.warn("Failed to parse cartItems param:", e);
      return [];
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Safely get parameters
        const tableId = Array.isArray(params.tableId)
          ? params.tableId[0]
          : params.tableId;

        const cartItems = Array.isArray(params.cartItems)
          ? params.cartItems[0]
          : params.cartItems;

        const status = Array.isArray(params.orderStatus)
          ? params.orderStatus[0]
          : params.orderStatus;

        // Parse cart items
        const parsedCartItems = parseCartItems(cartItems);
        const mapped = parsedCartItems.map((item: any) => ({
          id: item.id,
          foodItemId: item.foodItemId,
          name: `${item.name} (${item.variation})`,
          qty: Number(item.quantity) || 1,
          rate: Number(item.price) || 0,
        }));

        setItems(mapped);
        setOrderStatus(status || "");

        if (status === "dinein_active" && tableId) {
          await getActiveOrder(tableId);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params.cartItems, params.orderStatus, params.tableId]);

  const getTableDisplayText = () => {
    const tableId = Array.isArray(params.tableId)
      ? params.tableId[0]
      : params.tableId;

    if (!tableId || tableId === "-1") return "TA";
    return `T-${tableId}`;
  };

  const updateQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );
  };

  const removeItem = (index: number) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from the order?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setItems((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const total = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  const getActiveOrder = async (tableId: string) => {
    try {
      const login_token = await AsyncStorage.getItem("login_token");

      if (!login_token || !tableId) {
        Alert.alert("Missing info", "Login token or table ID missing");
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          function: "get_active_order",
          data: {
            login_token,
            table_id: tableId,
          },
        }),
      });

      const json = await response.json();

      if (json.status !== "success") {
        Alert.alert(
          "Fetch failed",
          json.message || "Could not fetch active order."
        );
        return;
      }

      const orderItems = json?.order?.order_items || [];
      const mapped = orderItems.map((item: any) => ({
        id: item.ris_id,
        foodItemId: item.ris_id,
        name: `${item.name} (${item.variation})`,
        qty: Number(item.o_qty) || 1,
        rate: Number(item.s_price) || 0,
      }));

      setItems(mapped);
    } catch (e: any) {
      console.error("getActiveOrder error:", e);
      Alert.alert("Error", "Could not load active order.");
    }
  };

  const handleSave = async () => {
    const login_token = await AsyncStorage.getItem("login_token");

    // Safely get tableId
    const tableId = Array.isArray(params.tableId)
      ? params.tableId[0]
      : params.tableId;

    const stewardId = Array.isArray(params.stewardId)
      ? params.stewardId[0]
      : params.stewardId;

    if (!tableId) {
      Alert.alert("Missing info", "Table ID is required.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("No items", "Please add at least one item before saving.");
      return;
    }

    const payload = {
      function: "update_orders",
      data: {
        login_token: login_token,
        table_id: tableId,
        order_status: "act",
        steward_id: stewardId || "",
        order_total: Number(total),
        order_data: items.map((it) => ({
          id: String(it.id),
          price: Number(it.rate),
          quantity: Number(it.qty),
        })),
      },
    };

    try {
      setSaving(true);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || (json?.status && json.status !== "success")) {
        const message =
          (json && (json.message || json.error)) ||
          `Request failed (${res.status})`;
        Alert.alert("Save failed", message);
        return;
      }

      router.push({
        pathname: "/table",
        params: { tableId: tableId, isRefresh: "true" },
      });
    } catch (e: any) {
      Alert.alert("Network error", e?.message || "Failed to save order.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f57c00" />
        <Text style={styles.loadingText}>Loading order...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/table",
              params: {
                tableId: getTableDisplayText().replace("T-", ""),
              },
            })
          }
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Main Billing</Text>
        <View style={styles.tableNumberContainer}>
          <Text style={styles.tableNumberText}>{getTableDisplayText()}</Text>
        </View>
      </View>

      {/* Items table */}
      <View style={styles.itemsContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 4 }]}>Item</Text>
          <Text style={[styles.tableHeaderQty, { flex: 1 }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rate</Text>
          <Text style={[styles.tableHeaderTotal, { flex: 1 }]}>Total</Text>
          <View style={{ flex: 0.5 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <View key={item.id ?? index} style={styles.tableRow}>
              <View style={[styles.itemInfo, { flex: 2 }]}>
                <Text style={styles.itemName}>
                  {(index + 1).toString().padStart(2, "0")} . {item.name}
                </Text>
                {!!item.foodItemId && (
                  <Text style={styles.itemCode}>{item.foodItemId}</Text>
                )}
              </View>

              <View style={[styles.qtyControls, { flex: 1 }]}>
                <TouchableOpacity onPress={() => updateQty(index, -1)}>
                  <Ionicons name="remove" size={18} color="#f57c00" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>
                  {item.qty.toString().padStart(2, "0")}
                </Text>
                <TouchableOpacity onPress={() => updateQty(index, 1)}>
                  <Ionicons name="add" size={18} color="#f57c00" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.rateText, { flex: 1, textAlign: "center" }]}>
                {item.rate}
              </Text>
              <Text
                style={[styles.totalText, { flex: 1, textAlign: "center" }]}
              >
                {item.qty * item.rate}
              </Text>

              {orderStatus === "dinein_new" && (
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  style={[styles.deleteButton, { flex: 0.5 }]}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Total Sale</Text>
          <Text style={styles.amount}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Other Charges</Text>
          <Text style={styles.amount}>00.00</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.grandLabel}>Grand Total</Text>
          <Text style={styles.grandTotal}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.amount}>00.00</Text>
        </View>

        {/* Button Rows */}
        <>
          <View style={styles.buttonRow}>
            {/* Save Button - Disabled when isTakeAway or isActive is true */}
            <TouchableOpacity
              style={[
                styles.holdButton,
                orderStatus !== "dinein_new" && { opacity: 0.6 },
              ]}
              onPress={handleSave}
              disabled={orderStatus !== "dinein_new"}
            >
              {saving ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.holdText}>Save</Text>
              )}
            </TouchableOpacity>

            {/* Invoice Button - Disabled when isTakeAway or not isActive */}
            <TouchableOpacity
              style={[
                styles.payButton,
                orderStatus !== "dinein_active" && { opacity: 0.6 },
              ]}
              disabled={orderStatus !== "dinein_active"}
              onPress={() =>
                router.push({
                  pathname: "/payment",
                  params: {
                    tableId: params.tableId,
                    total: total.toFixed(2),
                    stewardId: params.stewardId,
                    cartItems: params.cartItems || JSON.stringify(items),
                    orderStatus: "dinein_active",
                  },
                })
              }
            >
              <Text style={styles.payText}>Invoice</Text>
            </TouchableOpacity>
          </View>
        </>
      </View>

      <QuickMenuModal
        visible={quickMenuVisible}
        onClose={() => setQuickMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f4f2" },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#222", right: 50 },
  tableNumberContainer: {
    backgroundColor: "#000",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 0,
    marginRight: 40,
    alignSelf: "center",
    left: 40,
  },
  tableNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingBottom: 8,
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ececec",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tableHeaderText: { fontWeight: "600", fontSize: 13, color: "#1c1c1c" },
  tableHeaderQty: {
    fontWeight: "600",
    fontSize: 13,
    color: "#1c1c1c",
    right: 15,
  },
  tableHeaderTotal: {
    fontWeight: "600",
    fontSize: 13,
    left: 15,
    color: "#1c1c1c",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemInfo: { width: "25%" },
  itemName: { fontSize: 13, color: "#222" },
  itemCode: { fontSize: 12, color: "#f57c00" },
  qtyControls: {
    width: "25%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { marginHorizontal: 8, fontWeight: "600", color: "#f57c00" },
  rateText: { width: "25%", textAlign: "center", color: "#333" },
  totalText: {
    width: "25%",
    textAlign: "center",
    fontWeight: "700",
    color: "#333",
  },
  summaryBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: { fontSize: 14, color: "#333" },
  amount: { fontSize: 14, color: "#333" },
  grandLabel: { fontSize: 16, fontWeight: "700", color: "#1c1c1c" },
  grandTotal: { fontSize: 16, fontWeight: "700", color: "#1c1c1c" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  holdButton: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 10,
  },
  holdText: { fontWeight: "600", fontSize: 16, color: "#fff" },
  payButton: {
    flex: 1,
    backgroundColor: "#f57c00",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 12,
  },
  payText: { fontWeight: "600", fontSize: 16, color: "#fff" },
  deleteButton: { alignItems: "center", justifyContent: "center", padding: 4 },
});

// app/printer.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BluetoothClassic = NativeModules.RNBluetoothClassic as any;

interface Printer {
  name: string;
  address: string;
  [k: string]: any;
}

export default function PrinterScreen() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [connectedPrinter, setConnectedPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("connectedPrinter");
      if (saved) {
        const printer = JSON.parse(saved);
        try {
          const isStillConnected = await BluetoothClassic.isDeviceConnected(printer.address);
          if (isStillConnected) {
            setConnectedPrinter(printer);
          } else {
            // not connected anymore
            await AsyncStorage.removeItem("connectedPrinter");
            setConnectedPrinter(null);
          }
        } catch (err) {
          console.error("Error checking connection:", err);
          setConnectedPrinter(null);
        }
      }
    })();
  }, []);

  // Scan bonded devices
  const handleScanPrinters = async () => {
    try {
      setLoading(true);
      const bondedDevices = await BluetoothClassic.getBondedDevices();
      setPrinters(bondedDevices || []);
      if (!bondedDevices?.length) {
        Alert.alert("No Printers", "No bonded printers found.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to scan printers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPrinter = async (printer: Printer) => {
    try {
      const result = await BluetoothClassic.connectToDevice(printer.address, {
        connectSecure: true,
      });
      if (result) {
        setConnectedPrinter(printer);
        console.log("Reconnected to printer:", printer.name);
      } else {
        setConnectedPrinter(null);
      }
    } catch (err) {
      console.error("Failed to reconnect", err);
      await AsyncStorage.removeItem("connectedPrinter");
      setConnectedPrinter(null);
    }
  };

  const handleDisconnectPrinter = async () => {
    if (!connectedPrinter) return;
    try {
      await BluetoothClassic.disconnectFromDevice(connectedPrinter.address);
      setConnectedPrinter(null);
      await AsyncStorage.removeItem("connectedPrinter");
      Alert.alert("Disconnected", "Printer disconnected");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Printer Settings</Text>
      </View>

      {/* Scan button */}
      <TouchableOpacity style={styles.scanBtn} onPress={handleScanPrinters}>
        <Text style={styles.scanText}>Scan Paired Printers</Text>
      </TouchableOpacity>

      {/* Connected printer */}
      {connectedPrinter && (
        <View style={styles.connectedBox}>
          <Text>Connected: {connectedPrinter.name}</Text>
          <TouchableOpacity onPress={handleDisconnectPrinter}>
            <Text style={{ color: "red" }}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Printer list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={printers}
          keyExtractor={(item) => item.address}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.deviceItem,
                connectedPrinter?.address === item.address && {
                  borderColor: "green",
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleConnectPrinter(item)}
              disabled={connectedPrinter?.address === item.address}
            >
              <Text>{item.name}</Text>
              <Text>{item.address}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  scanBtn: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  scanText: { color: "#fff", textAlign: "center" },
  connectedBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: "green",
    marginBottom: 10,
  },
  deviceItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
    borderRadius: 6,
  },
});

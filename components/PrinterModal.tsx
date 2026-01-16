import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  NativeModules,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BluetoothClassic = NativeModules.RNBluetoothClassic as any;

interface Printer {
  name: string;
  address: string;
  [k: string]: any;
}

interface PrinterModalProps {
  visible: boolean;
  onClose: () => void;
  onPrinterConnected: (printer: Printer) => void;
}

export default function PrinterModal({ visible, onClose, onPrinterConnected }: PrinterModalProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [connectedPrinter, setConnectedPrinter] = useState<Printer | null>(null);
  const [loading, setLoading] = useState(false);

  // Load saved printer on mount
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("connectedPrinter");
      if (saved) {
        const printer = JSON.parse(saved);
        try {
          const isStillConnected = await BluetoothClassic.isDeviceConnected(printer.address);
          if (isStillConnected) {
            setConnectedPrinter(printer);
            onPrinterConnected(printer);
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
      setLoading(true);
      const result = await BluetoothClassic.connectToDevice(printer.address, {
        connectSecure: true,
      });
      if (result) {
        setConnectedPrinter(printer);
        await AsyncStorage.setItem("connectedPrinter", JSON.stringify(printer));
        onPrinterConnected(printer);
        Alert.alert("Success", `Connected to ${printer.name}`);
      } else {
        Alert.alert("Error", "Failed to connect to printer");
      }
    } catch (err) {
      console.error("Failed to connect", err);
      Alert.alert("Error", "Failed to connect to printer");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    if (!connectedPrinter) return;
    try {
      setLoading(true);
      await BluetoothClassic.disconnectFromDevice(connectedPrinter.address);
      setConnectedPrinter(null);
      await AsyncStorage.removeItem("connectedPrinter");
      onPrinterConnected(null);
      Alert.alert("Disconnected", "Printer disconnected");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to disconnect from printer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Printer Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
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
                <Text style={{ color: "#f57c00", fontWeight: "700" }}>Disconnect</Text>
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
                      borderColor: "#f57c00",
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleConnectPrinter(item)}
                  disabled={connectedPrinter?.address === item.address}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scanBtn: {
    backgroundColor: "#f57c00",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  scanText: {
    color: "white",
    fontWeight: "bold",
  },
  connectedBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 15,
  },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

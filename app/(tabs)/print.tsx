import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrinterModal from "@/components/PrinterModal";
import SideMenuModal from "@/components/SideMenuModal";

const BluetoothClassic = NativeModules.RNBluetoothClassic as any;

async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return (
      granted["android.permission.BLUETOOTH_CONNECT"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted["android.permission.BLUETOOTH_SCAN"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted["android.permission.ACCESS_FINE_LOCATION"] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
}

interface Printer {
  name: string;
  address: string;
  [k: string]: any;
}

export default function PrintScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [tableId, setTableId] = useState("");
  const [parsedOrderItems, setParsedOrderItems] = useState<any[]>([]);

  const params = useGlobalSearchParams();

  const [connectedPrinter, setConnectedPrinter] = useState<Printer | null>(
    null
  );
  const [printing, setPrinting] = useState(false);
  const [isModuleAvailable, setIsModuleAvailable] = useState(false);

  const printStatus = params.printStatus;

  useEffect(() => {
    console.log("Received Print Params:", params);
    (async () => {
      const saved = await AsyncStorage.getItem("connectedPrinter");
      if (saved) {
        const printer = JSON.parse(saved);
        try {
          const isStillConnected = await BluetoothClassic.isDeviceConnected(
            printer.address
          );
          if (isStillConnected) {
            setConnectedPrinter(printer);
          } else {
            const result = await BluetoothClassic.connectToDevice(
              printer.address,
              {
                connectSecure: true,
              }
            );
            if (result) {
              setConnectedPrinter(printer);
              console.log("Reconnected to printer:", printer.name);
            } else {
              await AsyncStorage.removeItem("connectedPrinter");
              setConnectedPrinter(null);
            }
          }
        } catch (err) {
          console.error("Error checking connection:", err);
          setConnectedPrinter(null);
        }
      }
    })();
  }, [params]);

  useEffect(() => {
    if (BluetoothClassic) setIsModuleAvailable(true);
    else
      Alert.alert(
        "Error",
        "Bluetooth module not available. Make sure react-native-bluetooth-classic is installed."
      );
  }, []);

  useEffect(() => {
    console.log("Received Print Params:", params);

    if (params.orderItems) {
      try {
        let items = params.orderItems;

        if (typeof items === "string") {
          let itemsString = items;

          if (itemsString.startsWith('"') && itemsString.endsWith('"')) {
            itemsString = itemsString.slice(1, -1);
          }

          itemsString = itemsString.replace(/\\"/g, '"');

          const parsed = JSON.parse(itemsString);
          setParsedOrderItems(Array.isArray(parsed) ? parsed : []);
          setOrderItems(parsed);
        } else {
          setParsedOrderItems(Array.isArray(items) ? items : []);
          setOrderItems(items);
        }

        setOrderId(params.orderId?.toString() || "");
        setTableId(params.tableId?.toString() || "");

        console.log("Successfully parsed order items:", parsedOrderItems);
      } catch (err) {
        console.error("Failed to parse orderItems:", params.orderItems, err);
        setParsedOrderItems([]);
      }
    }
  }, [params.orderItems, params.orderId, params.tableId]);

  const handlePrinterConnected = (printer: Printer | null) => {
    setConnectedPrinter(printer);
  };

  const handlePrintNow = async () => {
    if (!connectedPrinter) {
      Alert.alert("No Printer", "Please connect to a printer first");
      setPrinterModalVisible(true);
      return;
    }

    if (printStatus === "paid") {
      if (customerName.trim() === "" || customerNumber.trim() === "") {
        Alert.alert("Validation Error", "Please enter both name and number");
        return;
      }

      if (
        customerNumber.trim().length !== 10 ||
        !/^\d{10}$/.test(customerNumber)
      ) {
        Alert.alert(
          "Invalid Number",
          "Customer number must be exactly 10 digits."
        );
        return;
      }
    }

    setPrinting(true);

    try {
      const ESC = "\x1B";
      const GS = "\x1D";

      const MAX_LINE_LENGTH = 32;
      const MAX_ITEM_NAME_LENGTH = 24; // Reduced to allow space for quantity

      // Check if we should hide prices (invoices) or show prices (bills)
      const isInvoice = printStatus === "invoice";
      const isBill = printStatus === "paid";

      const itemsText =
        parsedOrderItems && parsedOrderItems.length > 0
          ? parsedOrderItems
              .map((i) => {
                const name = i.name || "Unknown Item";
                const qty = i.qty ?? i.quantity ?? i.o_qty ?? 1;

                const variation = i.variation ? ` (${i.variation})` : "";
                let itemName = name + variation;

                // Truncate item name if too long to fit with quantity
                if (itemName.length > MAX_ITEM_NAME_LENGTH) {
                  itemName =
                    itemName.substring(0, MAX_ITEM_NAME_LENGTH - 3) + "...";
                }

                // For invoices: item name on left, quantity on right (x2 format)
                if (isInvoice) {
                  const quantityText = `x${qty}`;
                  // Pad the item name and add quantity at the end
                  const paddedItemName = itemName.padEnd(
                    MAX_LINE_LENGTH - quantityText.length
                  );
                  return paddedItemName + quantityText;
                } else {
                  // For bills: show prices as before
                  const price = parseFloat(
                    i.rate ?? i.price ?? i.s_price ?? 0
                  ).toFixed(2);
                  const total = (
                    Number(qty) * Number(i.rate ?? i.price ?? i.s_price ?? 0)
                  ).toFixed(2);

                  const itemLine = itemName + "\n";
                  const detailLine = `  ${qty} x ${price} = ${total}`.padStart(
                    MAX_LINE_LENGTH
                  );
                  return itemLine + detailLine;
                }
              })
              .join("\n")
          : "No items available";

      let subtotal = 0;
      if (parsedOrderItems && parsedOrderItems.length > 0) {
        subtotal = parsedOrderItems.reduce((sum, i) => {
          const qty = i.qty ?? i.quantity ?? i.o_qty ?? 1;
          const price = i.rate ?? i.price ?? i.s_price ?? 0;
          return sum + Number(qty) * Number(price);
        }, 0);
      } else {
        subtotal = parseFloat(params.totalSale?.toString() || "0");
        console.log("Using subtotal from params:", subtotal);
      }

      const discount = parseFloat(params.orderDiscount?.toString() || "0");
      const serviceCharge = parseFloat(params.serviceCharge?.toString() || "0");
      const deliveryFee = parseFloat(params.deliveryFee?.toString() || "0");

      let grandTotal = parseFloat(params.grandTotal?.toString() || "0");
      if (grandTotal === 0) {
        grandTotal = subtotal + serviceCharge + deliveryFee - discount;
      }

      const paidAmount = parseFloat(params.paidAmount?.toString() || "0");
      const balance = parseFloat(params.orderBalance?.toString() || "0");

      console.log("Printing values:", {
        subtotal,
        discount,
        serviceCharge,
        deliveryFee,
        grandTotal,
        paidAmount,
        balance,
        items: parsedOrderItems,
        itemCount: parsedOrderItems?.length || 0,
        isInvoice,
        isBill,
      });

      const formatAmountLine = (
        label: string,
        value: number,
        isBold = false
      ) => {
        const labelPart = label.padEnd(16);
        const valuePart = value.toFixed(2).padStart(MAX_LINE_LENGTH - 16);
        let line = labelPart + valuePart + "\n";

        if (isBold) {
          line = ESC + "!" + "\x08" + line + ESC + "!" + "\x00";
        }

        return line;
      };

      let commands = "";

      if (printStatus === "invoice") {
        // For invoices: single line format with quantity on right
        commands = [
          ESC + "@",
          ESC + "a" + "\x01",
          "**** iPOS INVOICE ****\n\n",
          ESC + "a" + "\x00",
          `Order ID : ${orderId}\n`,
          `Table No : ${tableId}\n`,
          "-".repeat(MAX_LINE_LENGTH) + "\n",
          "Items\n",
          "-".repeat(MAX_LINE_LENGTH) + "\n",
          itemsText + "\n",
          "-".repeat(MAX_LINE_LENGTH) + "\n",
          GS + "V" + "\x41" + "\x10",
        ].join("");
      } else {
        // Bill printing - show all prices and charges (multi-line format)
        let chargesSection = formatAmountLine("Subtotal", subtotal);
        if (discount > 0) {
          chargesSection += formatAmountLine("Discount", discount);
        }
        if (serviceCharge > 0) {
          chargesSection += formatAmountLine("Service Charge", serviceCharge);
        }
        if (deliveryFee > 0) {
          chargesSection += formatAmountLine("Delivery Fee", deliveryFee);
        }

        chargesSection += "-".repeat(MAX_LINE_LENGTH) + "\n";

        commands = [
          ESC + "@",
          ESC + "a" + "\x01",
          "**** iPOS BILL ****\n\n",
          ESC + "a" + "\x00",
          `Order ID : ${orderId}\n`,
          `Customer : ${customerName}\n`,
          `Phone    : ${customerNumber}\n`,
          "-".repeat(MAX_LINE_LENGTH) + "\n",
          "Items\n",
          "-".repeat(MAX_LINE_LENGTH) + "\n",
          itemsText + "\n",
          "-".repeat(MAX_LINE_LENGTH) + "\n",
          chargesSection,
          formatAmountLine("GRAND TOTAL", grandTotal, true),
          formatAmountLine("Paid", paidAmount),
          formatAmountLine("Balance", balance),
          "-".repeat(MAX_LINE_LENGTH) + "\n\n",
          ESC + "a" + "\x01",
          "Thank you! Visit Again\n\n",
          "Developed by Introps IT\n",
          "+94 71 150 0200\n\n",
          GS + "V" + "\x41" + "\x10",
        ].join("");
      }

      const base64Data = Buffer.from(commands, "ascii").toString("base64");
      await BluetoothClassic.writeToDevice(
        connectedPrinter.address,
        base64Data
      );
      router.push({ pathname: "/table", params: { isRefresh: "true" } });
    } catch (err) {
      console.error("[print]", err);
      Alert.alert(
        "Print Error",
        "Failed to print receipt: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setPrinting(false);
    }
  };

  if (!isModuleAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Bluetooth module not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Print Receipt</Text>
        <View style={styles.headerRight}>
          <Text style={styles.logoText}>
            <Text style={{ color: "#f60" }}>i</Text>POS
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons
              name="menu"
              size={24}
              color="#555"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu Modal */}
      <SideMenuModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Printer connection section */}
      <View style={styles.printerStatus}>
        <Text>
          {connectedPrinter
            ? `Connected to: ${connectedPrinter.name}`
            : "No printer connected"}
        </Text>
        <TouchableOpacity
          onPress={() => setPrinterModalVisible(true)}
          style={styles.manageBtn}
        >
          <Text style={styles.manageBtnText}>Manage Printers</Text>
        </TouchableOpacity>
      </View>

      {/* Printer Modal */}
      <PrinterModal
        visible={printerModalVisible}
        onClose={() => setPrinterModalVisible(false)}
        onPrinterConnected={handlePrinterConnected}
      />

      {/* Receipt details section */}
      {printStatus !== "invoice" && (
        <View style={styles.card}>
          {/* Customer Fields */}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Customer Name</Text>
            <TextInput
              placeholder="Enter customer name"
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.input}
            />
            <Text style={styles.inputLabel}>Customer Number</Text>
            <TextInput
              placeholder="Enter customer number"
              value={customerNumber}
              onChangeText={setCustomerNumber}
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={10}
            />
          </View>
        </View>
      )}
      {/* Buttons */}
      <View style={styles.card}>
        <TouchableOpacity
          style={[
            styles.printButton,
            !connectedPrinter && styles.printButtonDisabled,
          ]}
          onPress={handlePrintNow}
          disabled={printing || !connectedPrinter}
        >
          {printing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="print" size={20} color="#fff" />
              <Text style={styles.printText}>Print Now</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.printButton, styles.closeButton]}
          onPress={() =>
            router.push({ pathname: "/table", params: { isRefresh: "true" } })
          }
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.printText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  printerStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  manageBtn: {
    backgroundColor: "#f57c00",
    padding: 8,
    borderRadius: 4,
  },
  manageBtnText: {
    color: "#fff",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    margin: 15,
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f57c00",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  printButtonDisabled: {
    backgroundColor: "#ccc",
  },
  closeButton: {
    backgroundColor: "#333",
    borderRadius: 8,
  },
  printText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
});

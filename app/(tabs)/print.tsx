import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { router, useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrinterModal from '@/components/PrinterModal';
import SideMenuModal from '@/components/SideMenuModal';

// Bluetooth Classic Native Module
const BluetoothClassic = NativeModules.RNBluetoothClassic as any;

async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  if (Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return (
      granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
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
  const [printerModalVisible, setPrinterModalVisible] = useState(false); // State for printer modal
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [tableId, setTableId] = useState('');
  const params = useGlobalSearchParams();

  const [connectedPrinter, setConnectedPrinter] = useState<Printer | null>(null);
  const [printing, setPrinting] = useState(false);
  const [isModuleAvailable, setIsModuleAvailable] = useState(false);

  const printStatus = params.printStatus;

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
            const result = await BluetoothClassic.connectToDevice(printer.address, {
              connectSecure: true,
            });
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
  }, []);

  useEffect(() => {
    if (BluetoothClassic) setIsModuleAvailable(true);
    else Alert.alert('Error', 'Bluetooth module not available. Make sure react-native-bluetooth-classic is installed.');
  }, []);

  useEffect(() => {
    console.log("Order Items Print:", params);

    if (params.orderItems) {
      try {
        const parsedItems = JSON.parse(params.orderItems as string);
        setOrderItems(parsedItems);
        setOrderId(params.orderId || '');
        setTableId(params.tableId || '');
      } catch (err) {
        console.error("Failed to parse orderItems:", params.orderItems);
      }
    }
  }, [params]);

  const handlePrinterConnected = (printer: Printer | null) => {
    setConnectedPrinter(printer);
  };

  const handlePrintNow = async () => {
    if (!connectedPrinter) {
      Alert.alert("No Printer", "Please connect to a printer first");
      setPrinterModalVisible(true);
      return;
    }

    if (printStatus === 'paid') {
      if (customerName.trim() === '' || customerNumber.trim() === '') {
        Alert.alert("Validation Error", "Please enter both name and number");
        return;
      }

      if (customerNumber.trim().length !== 10 || !/^\d{10}$/.test(customerNumber)) {
        Alert.alert("Invalid Number", "Customer number must be exactly 10 digits.");
        return;
      }
    }

    setPrinting(true);

    try {
      const ESC = "\x1B";
      const GS = "\x1D";

      let itemsText = orderItems
        .map((i: any) => {
          const name = i.name?.length > 16 ? i.name.substring(0, 16) : i.name;
          const variation = i.variation ? ` (${i.variation})` : '';

          // Fallbacks for qty & price (works for both dinein & taway)
          const qty = i.o_qty ?? i.quantity ?? 0;
          const price = parseFloat(i.s_price ?? i.price ?? 0).toFixed(2);
          const total = (Number(qty) * Number(i.s_price ?? i.price ?? 0)).toFixed(2);

          return `${(name + variation).padEnd(16)} \n${qty} x ${price} = ${total}`;
        })
        .join("\n");

      const subtotal = orderItems.reduce(
        (sum: number, i: any) =>
          sum +
          (Number(i.o_qty ?? i.quantity ?? 0) *
            Number(i.s_price ?? i.price ?? 0)),
        0
      );

      const discount = parseFloat(params.orderDiscount || "0");
      const serviceCharge = parseFloat(params.orderServiceCharge || "0");
      const grandTotal = subtotal - discount + serviceCharge;
      const paidAmount = parseFloat(params.paidAmount || "0");
      const balance = grandTotal - paidAmount;

      let commands = "";

      if (printStatus === 'invoice') {
        commands = [
          ESC + "@", // Initialize
          ESC + "a" + "\x01", // Center align
          "**** iPOS INVOICE ****\n\n",
          ESC + "a" + "\x00", // Left align
          `Order ID : ${orderId}\n`,
          `Table No : ${tableId}\n`,
          "-------------------------------\n",
          "Items\n",
          "-------------------------------\n",
          itemsText + "\n",
          "-------------------------------\n",
          `Subtotal       : ${subtotal.toFixed(2)}\n`,
          `Discount       : ${discount.toFixed(2)}\n`,
          `Service Charge : ${serviceCharge.toFixed(2)}\n`,
          "-------------------------------\n",
          GS + "V" + "\x41" + "\x10", // Partial cut
        ].join("");
      } else {
        commands = [
          ESC + "@", // Initialize
          ESC + "a" + "\x01", // Center align
          "**** iPOS BILL ****\n\n",
          ESC + "a" + "\x00", // Left align
          `Order ID : ${orderId}\n`,
          `Customer : ${customerName}\n`,
          `Phone    : ${customerNumber}\n`,
          "-------------------------------\n",
          "Items\n",
          itemsText + "\n",
          "-------------------------------\n",
          `Subtotal       : ${subtotal.toFixed(2)}\n`,
          `Discount       : ${discount.toFixed(2)}\n`,
          `Service Charge : ${serviceCharge.toFixed(2)}\n`,
          "-------------------------------\n",
          `Grand Total    : ${grandTotal.toFixed(2)}\n`,
          `Paid           : ${paidAmount.toFixed(2)}\n`,
          `Balance        : ${balance.toFixed(2)}\n`,
          "-------------------------------\n\n",
          ESC + "a" + "\x01", // Center
          "Thank you! Visit Again\n\n",
          "Developed by Introps IT\n",
          "+94755620353|introps@gmail.com\n\n",
          GS + "V" + "\x41" + "\x10",
        ].join("");
      }

      const base64Data = Buffer.from(commands, "ascii").toString("base64");
      await BluetoothClassic.writeToDevice(connectedPrinter.address, base64Data);
      // router.push({ pathname: '/table', params: { isRefresh: 'true' } });
    } catch (err) {
      console.error("[print]", err);
      Alert.alert("Print Error", "Failed to print receipt");
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
        <TouchableOpacity onPress={() => router.push('/table')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Print Receipt</Text>
        <View style={styles.headerRight}>
          <Text style={styles.logoText}>
            <Text style={{ color: '#f60' }}>i</Text>POS
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="menu" size={24} color="#555" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu Modal */}
      <SideMenuModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Printer connection section */}
      <View style={styles.printerStatus}>
        <Text>
          {connectedPrinter ? `Connected to: ${connectedPrinter.name}` : "No printer connected"}
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
      {printStatus !== 'invoice' && (<View style={styles.card}>
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
          style={[styles.printButton, !connectedPrinter && styles.printButtonDisabled]}
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
          onPress={() => router.push({ pathname: '/table', params: { isRefresh: 'true' } })}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.printText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  printerStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  manageBtn: {
    backgroundColor: '#f57c00',
    padding: 8,
    borderRadius: 4,
  },
  manageBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
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
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f57c00',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  printButtonDisabled: {
    backgroundColor: '#ccc',
  },
  closeButton: {
    backgroundColor: '#333', borderRadius: 8,
  },
  printText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

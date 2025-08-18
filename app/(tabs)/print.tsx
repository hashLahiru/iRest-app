import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const purchasedItems = [
  { id: '001', name: 'Chicken Biryani', qty: 1, price: 1200 },
  { id: '002', name: 'Lime Juice', qty: 2, price: 300 },
  { id: '003', name: 'Chocolate Cake', qty: 1, price: 800 },
];

export default function PrintScreen() {
  const total = purchasedItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [orderId, setOrderId] = useState();
  const params = useGlobalSearchParams();

  useEffect(() => {
    setOrderId(params.orderId || '');
    console.log("PrintScreen params:", params.orderId);
  }, [params]);

  const handlePrintNow = async () => {
    if (customerName.trim() === '' || customerNumber.trim() === '') {
      Alert.alert("Validation Error", "Please enter both name and number");
      return;
    }

    if (customerNumber.trim().length !== 10 || !/^\d{10}$/.test(customerNumber)) {
      Alert.alert("Invalid Number", "Customer number must be exactly 10 digits.");
      return;
    }

    try {
      const login_token = await AsyncStorage.getItem('login_token');
      if (!login_token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: "save_customer_info",
          data: {
            login_token: login_token,
            ts_id: orderId,
            customer_name: customerName,
            customer_phone: customerNumber
          }
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert("Success", "Customer info saved successfully");
        router.push({
          pathname: '/table',
          params: { isRefresh: 'true' }
        });
      } else {
        Alert.alert("Error", result.message || "Failed to save customer info");
      }
    } catch (error) {
      console.error("API error:", error);
      Alert.alert("Error", "Network or server error");
    }
  };

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
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.sideMenu}>
            {[
              ['🏠 Home', '/table'],
              ['📝 Task Manager', '/taskmanager'],
              ['➕ Add Product', '/addproduct'],
              ['👨‍🌾 Farmer', '/farmer'],
              ['👤 User', '/user'],
              ['🚪 Logout', '/logout'],
            ].map(([label, route]) => (
              <TouchableOpacity key={label} onPress={() => { setModalVisible(false); router.push(route); }}>
                <Text style={styles.menuItem}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={styles.card}>
        {/* Thank You Section */}
        <View style={styles.thankYouContainer}>
          <Image
            source={require('../../assets/images/thankyou.png')} // 🔁 Replace with your image path
            style={styles.thankYouImage}
          />
          <Text style={styles.thankYouText}>Thank You!</Text>
        </View>
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
          />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.printButton} onPress={handlePrintNow}>
          <Ionicons name="print" size={20} color="#fff" />
          <Text style={styles.printText}>Print Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.printButton, { backgroundColor: '#999', marginTop: 10 }]}
          onPress={() => router.push({
            pathname: '/table',
            params: { isRefresh: 'true' },
          })}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.printText}>Close</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1c',
    right: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  content: {
    padding: 10,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    elevation: 3,
  },
  invoice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 14,
  },
  inputGroup: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },

  printButton: {
    marginTop: 70,
    backgroundColor: '#f57c00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  printText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  thankYouContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  thankYouText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 70,
    color: '#444',
  },
  thankYouImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sideMenu: {
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 5,
  },
  menuItem: {
    fontSize: 18,
    marginVertical: 12,
    color: '#333',
  },
});

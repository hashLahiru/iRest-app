import SideMenuModal from '@/components/SideMenuModal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliveryDetailsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [fee, setFee] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const params = useGlobalSearchParams(); // contains ts_id
  console.log(params);

  const handleStart = async () => {
    const login_token = await AsyncStorage.getItem('login_token');

    if (!fee.trim() || isNaN(Number(fee))) {
      Alert.alert('Validation Error', 'Please enter a valid delivery fee.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter the customer name.');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter the delivery address.');
      return;
    }
    if (!params.ts_id) {
      Alert.alert('Error', 'Missing order ID.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: 'save_delivery_info',
          data: {
            login_token: login_token,
            ts_id: params.ts_id,
            delivery_fee: fee,
            customer_name: name,
            customer_phone: phone,
            customer_address: address
          }
        })
      });

      const json = await response.json();
      console.log('API Response:', json);

      if (json.status === 'success') {
        Alert.alert('Success', json.message, [
          { text: 'OK', onPress: () => router.push('/delivery') }
        ]);
      } else {
        Alert.alert('Error', json.message || 'Failed to save delivery info.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Network request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/delivery')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Details</Text>
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

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.label}>Delivery Fee</Text>
        <TextInput
          placeholder="Enter fee"
          value={fee}
          onChangeText={setFee}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Customer Name</Text>
        <TextInput
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
          style={[styles.input, { height: 100 }]}
          multiline
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#999' }]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStart}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 30, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1c1c1c', right: 50 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#222' },
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, margin: 15, marginBottom: 0, elevation: 3 },
  label: { fontSize: 14, color: '#333', marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 110 },
  actionButton: { flex: 1, backgroundColor: '#f57c00', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});

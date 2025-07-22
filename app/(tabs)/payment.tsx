import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [selectedDiscount, setSelectedDiscount] = useState('5%');
  const [cash, setCash] = useState('');
  const [card, setCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const total = 8500;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.push('/billScreen')}>
                  <Ionicons name="arrow-back" size={24} color="#000" />
         </TouchableOpacity>
        <Text style={styles.headerTitle}>Settle the Bill</Text>
        <Ionicons name="menu" size={24} color="#000" />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Total Summary */}
            <View style={styles.totalBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Total Sale</Text>
                <Text style={styles.value}>8500.00</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Other Charges</Text>
                <Text style={styles.value}>00.00</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Balance</Text>
                <Text style={styles.value}>00.00</Text>
              </View>
            </View>

            {/* Payment Methods */}
            <View style={styles.box}>
              <View style={styles.paymentHeader}>
                <Text style={styles.boxTitle}>Payment Method</Text>
                <TouchableOpacity style={styles.empBtn}>
                  <Text style={styles.empBtnText}>Emp Bill</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonGrid}>
                {['Cash', 'Card', 'Split', 'Voucher', 'Discount', 'Coupen'].map(
                  (method) => (
                    <TouchableOpacity
                      key={method}
                      onPress={() => setSelectedMethod(method)}
                      style={[
                        styles.methodButton,
                        selectedMethod === method && styles.activeButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          selectedMethod === method && styles.activeText,
                        ]}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Discount Options */}
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Discount</Text>
              <View style={styles.buttonGrid}>
                {['5%', '10%', '15%', '20%', '25%', '30%'].map((discount) => (
                  <TouchableOpacity
                    key={discount}
                    onPress={() => setSelectedDiscount(discount)}
                    style={[
                      styles.discountButton,
                      selectedDiscount === discount && styles.activeButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        selectedDiscount === discount && styles.activeText,
                      ]}
                    >
                      {discount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Settle Input Fields */}
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Settle Bill</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Cash</Text>
                <TextInput
                  value={cash}
                  onChangeText={setCash}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter Cash"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Card</Text>
                <TextInput
                  value={card}
                  onChangeText={setCard}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter Card"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  style={styles.input}
                  placeholder="Enter Card Number"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => router.push('/print')}
              >
                <Text style={styles.payText}>Pay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1c',
    right: 80,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  totalBox: {
    backgroundColor: '#1c1c1c',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { color: '#ccc', fontSize: 14 },
  value: { color: '#fff', fontSize: 14 },
  totalLabel: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },

  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1c',
    marginBottom: 10,
  },
  empBtn: {
    backgroundColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  empBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  methodButton: {
    width: '32%',
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  discountButton: {
    width: '32%',
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#f57c00',
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    width: 100,
    fontSize: 14,
    color: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#aaa',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginRight: 10,
  },
  payBtn: {
    flex: 1,
    backgroundColor: '#f57c00',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  payText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

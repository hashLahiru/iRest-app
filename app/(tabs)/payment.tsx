import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function PaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState('Cash');
  const [selectedDiscount, setSelectedDiscount] = useState('0%');
  const [cash, setCash] = useState('0');
  const [card, setCard] = useState('0');
  const [cardNumber, setCardNumber] = useState('');
  const [isInvoice, setIsInvoice] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const params = useGlobalSearchParams();

  const [totalSale, setTotalSale] = useState(8500);
  const [otherCharges, setOtherCharges] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [serviceChargePercentage, setServiceChargePercentage] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [orderId, setOrderId] = useState('');

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    // Reset fields when changing payment method
    if (method === 'Cash') {
      setCash('0');
      setCard('0');
      setCardNumber('');
      setPaidAmount(0);
      setBalance(0);
    } else if (method === 'Card') {
      setCash('0');
      setCard('0');
      setCardNumber('');
      setPaidAmount(0);
      setBalance(0);
    } else if (method === 'Split') {
      setCash('0');
      setCard('0');
      setCardNumber('');
      setPaidAmount(0);
      setBalance(0);
    }
  };

  // Calculate paid amount and remaining balance
  useEffect(() => {
    let paid = 0;
    if (selectedMethod === 'Cash') {
      paid = parseFloat(cash) || 0;
    } else if (selectedMethod === 'Card') {
      paid = parseFloat(card) || 0;
    } else if (selectedMethod === 'Split') {
      const cashAmount = parseFloat(cash) || 0;
      const cardAmount = parseFloat(card) || 0;
      paid = cashAmount + cardAmount;
    }
    setPaidAmount(paid);
    setBalance(paid - grandTotal);
  }, [cash, card, grandTotal, selectedMethod]);

  // Calculate remaining amount for card when cash changes in split mode
  useEffect(() => {
    if (selectedMethod === 'Split' && cash && !isNaN(cash)) {
      const cashAmount = parseFloat(cash);
      const remainingAmount = Math.max(0, grandTotal - cashAmount);
      setCard(remainingAmount.toFixed(2));
    }
  }, [cash, grandTotal, selectedMethod]);

  // Fetch service charge from API
  useEffect(() => {
    const fetchData = async () => {
      const login_token = await AsyncStorage.getItem('login_token');
      console.log("Passed params /payment:", params);

      if (params.isDone === 'true') {
        setIsDone(true);

        const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            function: "get_active_order",
            data: {
              login_token: login_token,
              table_id: params.tableId,
            }
          }),
        });
        const data = await response.json();
        console.log("Order data:", data.order.ts_id);
        setOrderId(data.order.ts_id);

        const orderTotal = parseFloat(data?.order?.order_total || 0);
        const orderDiscount = parseFloat(data?.order?.discount || 0);
        const orderServiceCharge = parseFloat(data?.order?.service_charge || 0);
        const orderGrandTotal = parseFloat(data?.order?.grand_total || 0);
        const otherCharges = parseFloat(data?.order?.other_charges || 0);

        setTotalSale(orderTotal);
        setDiscountAmount(orderDiscount);
        setServiceCharge(orderServiceCharge);
        setGrandTotal(orderGrandTotal);
        setOtherCharges(otherCharges);

        if (orderTotal > 0) {
          const discountPercentage = (orderDiscount / orderTotal) * 100;
          setSelectedDiscount(`${Math.round(discountPercentage)}%`);
        }
      } else {
        setIsDone(false);
        const fetchServiceCharge = async () => {
          setIsLoading(true);
          try {
            const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                function: "get_service_charge",
                data: {
                  login_token: login_token
                }
              }),
            });

            const data = await response.json();
            console.log("Service charge data:", data);
            if (data.status === "success") {
              const charge = parseFloat(data.service_charge);
              setServiceChargePercentage(charge);
              const chargeAmount = totalSale * (charge / 100);
              setServiceCharge(chargeAmount);
              setOtherCharges(chargeAmount);
            }
          } catch (error) {
            Alert.alert("Error", "Failed to fetch service charge");
            console.error("Service charge API error:", error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchServiceCharge();
      }
    };

    fetchData();
  }, [params.tableId, params.isDone]);

  const getDiscountAmount = () => {
    return totalSale * (parseInt(selectedDiscount) / 100);
  };

  const handlePrintInvoice = async () => {
    setIsPrinting(true);
    const login_token = await AsyncStorage.getItem('login_token');
    const discountAmount = getDiscountAmount();

    try {
      const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: "update_order_to_invoice",
          data: {
            login_token: login_token,
            table_id: params.tableId,
            service_charge: serviceCharge.toFixed(2),
            discount: discountAmount.toFixed(2)
          }
        }),
      });

      const data = await response.json();
      console.log("Invoice API response:", data);

      if (data.status === "success") {
        Alert.alert("Success", "Invoice generated successfully");
        router.push({
          pathname: '/table',
          params: {
            isRefresh: 'true',
          }
        });
      } else {
        Alert.alert("Error", "Failed to generate invoice");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server");
      console.error("Invoice API error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (!isDone) {
      const discountAmount = getDiscountAmount();
      const newGrandTotal = totalSale + serviceCharge - discountAmount;
      setGrandTotal(newGrandTotal);
    }
  }, [selectedDiscount, totalSale, serviceCharge, isDone]);

  useEffect(() => {
    setIsInvoice(params.isInvoice === 'true');
    setIsDone(params.isDone === 'true');
    console.log("Route Params:", params);
  }, [params]);

  const handleDiscountSelection = (discount) => {
    setSelectedDiscount(discount);
  };

  const handlePayment = async () => {
    if (paidAmount < grandTotal) {
      Alert.alert("Payment Error", "Paid amount is less than the grand total.");
      return;
    }

    try {
      setIsLoading(true);
      const login_token = await AsyncStorage.getItem('login_token');
      const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: "complete_payment",
          data: {
            login_token: login_token,
            ts_id: orderId,
            cash: cash || '0',
            card: card || '0',
          },
        }),
      });

      const text = await response.text();

      if (!text) {
        throw new Error("Empty response from server.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("Failed to parse response JSON:", text);
        throw new Error("Invalid response from server.");
      }

      console.log("Payment Response:", data);

      if (data.status === "success") {
        const orderId = data.response;
        router.push({
          pathname: '/print',
          params: { orderId: orderId },
        });
      } else {
        Alert.alert("Payment Failed", data?.message || "Unknown error during payment.");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      Alert.alert("Payment Error", error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() =>
        (
          isDone ? router.push('/table') : router.push('/billScreen')
        )
        }>
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
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f57c00" />
              </View>
            ) : (
              <>
                {/* Payment Methods */}
                {!isInvoice && (
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
                            onPress={() => handleMethodSelection(method)}
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
                )}

                {/* Discount Section */}
                {isInvoice && !isDone && (
                  <View style={styles.box}>
                    <Text style={styles.boxTitle}>Discount</Text>
                    <View style={styles.buttonGrid}>
                      {['0%', '5%', '10%', '15%', '20%', '25%'].map((discount) => (
                        <TouchableOpacity
                          key={discount}
                          onPress={() => handleDiscountSelection(discount)}
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
                    {selectedDiscount !== '0%' && (
                      <View style={styles.discountInfo}>
                        <Text style={styles.discountText}>
                          Discount Applied: {selectedDiscount} (-
                          {getDiscountAmount().toFixed(2)})
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Settle Input Fields */}
                {!isInvoice && isDone && (
                  <View style={styles.box}>
                    <Text style={styles.boxTitle}>Settle Bill</Text>
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Cash</Text>
                      <TextInput
                        value={cash}
                        onChangeText={(text) => {
                          // Handle empty input or '0' at start
                          if (text === '' || text === '0') {
                            setCash(text);
                          } else {
                            setCash(text.replace(/^0+/, ''));
                          }
                        }}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Enter Cash"
                        editable={selectedMethod !== 'Card'} // Only editable for Cash or Split
                      />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Card</Text>
                      <TextInput
                        value={card}
                        onChangeText={(text) => {
                          // Handle empty input or '0' at start
                          if (text === '' || text === '0') {
                            setCard(text);
                          } else {
                            setCard(text.replace(/^0+/, ''));
                          }
                        }}
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Enter Card"
                        editable={selectedMethod !== 'Cash'} // Only editable for Card or Split
                      />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Card Number</Text>
                      <TextInput
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        style={styles.input}
                        placeholder="Enter Card Number"
                        editable={selectedMethod !== 'Cash'} // Only editable for Card or Split
                      />
                    </View>
                  </View>
                )}

                {/* Total Summary */}
                <View style={styles.totalBox}>
                  <View style={styles.row}>
                    <Text style={styles.label}>Total Sale</Text>
                    <Text style={styles.value}>{totalSale.toFixed(2)}</Text>
                  </View>
                  {serviceCharge > 0 && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Service Charge</Text>
                      <Text style={styles.value}>{serviceCharge.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.row}>
                    <Text style={styles.label}>Discount</Text>
                    <Text style={styles.value}>
                      -{isDone ? discountAmount.toFixed(2) : selectedDiscount}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalValue}>{grandTotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Paid Amount</Text>
                    <Text style={styles.value}>{paidAmount.toFixed(2)}</Text>
                  </View>
                  {isDone && (
                    <View style={styles.row}>
                      <Text style={styles.label}>Balance</Text>
                      <Text style={[styles.value, { color: balance < 0 ? 'red' : 'green' }]}>
                        {balance.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                {!isInvoice && isDone && (
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setCash('0');
                        setCard('0');
                        setPaidAmount(0);
                        setBalance(0);
                        router.push('/table');
                      }}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.payText}>Pay</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                {isInvoice && (
                  <TouchableOpacity
                    style={[styles.payBtn, { marginTop: 12 }]}
                    onPress={handlePrintInvoice}
                    disabled={isPrinting}
                  >
                    {isPrinting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.payText}>Print Invoice</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
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
  discountInfo: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  discountText: {
    color: '#f57c00',
    fontWeight: '600',
  },
});

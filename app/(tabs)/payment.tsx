import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const params = useGlobalSearchParams();

  const [totalSale, setTotalSale] = useState(0); // Changed from 8500 to 0
  const [otherCharges, setOtherCharges] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const hasInitialized = useRef(false);

  const orderStatus = Array.isArray(params.orderStatus)
    ? params.orderStatus[0]
    : params.orderStatus ?? '';

  // Reset all states when params change
  const resetStates = useCallback(() => {
    setTotalSale(0);
    setOtherCharges(0);
    setServiceCharge(0);
    setDeliveryFee(0); // Add this line
    setGrandTotal(0);
    setBalance(0);
    setDiscountAmount(0);
    setPaidAmount(0);
    setOrderId('');
    setOrderItems([]);
    setSelectedMethod('Cash');
    setSelectedDiscount('0%');
    setCash('0');
    setCard('0');
    setCardNumber('');
  }, []);

  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    if (method === 'Cash') {
      setCash('0');
      setCard('0');
      setCardNumber('');
      setPaidAmount(0);
      setBalance(0);
    } else if (method === 'Card') {
      setCash('0');
      setCard(grandTotal.toFixed(2));
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

  useEffect(() => {
    if (selectedMethod === 'Split' && cash && !isNaN(cash)) {
      const cashAmount = parseFloat(cash);
      const remainingAmount = Math.max(0, grandTotal - cashAmount);
      setCard(remainingAmount.toFixed(2));
    }
  }, [cash, grandTotal, selectedMethod]);

  function safeParseCartItems(raw) {
    console.log("safeParseCartItems input:", raw);

    if (!raw) {
      console.log("No raw data provided");
      return [];
    }

    // If it's already an array, return it
    if (Array.isArray(raw)) {
      console.log("Already an array:", raw);
      return raw;
    }

    try {
      // If it's already JSON stringified array
      const parsed = JSON.parse(raw);
      console.log("Successfully parsed JSON:", parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err1) {
      try {
        // If it's double-stringified (wrapped in quotes)
        const doubleParsed = JSON.parse(JSON.parse(raw));
        console.log("Successfully double-parsed JSON:", doubleParsed);
        return Array.isArray(doubleParsed) ? doubleParsed : [];
      } catch (err2) {
        try {
          // Replace escaped quotes
          const escapedParsed = JSON.parse(raw.replace(/\\"/g, '"'));
          console.log("Successfully parsed escaped JSON:", escapedParsed);
          return Array.isArray(escapedParsed) ? escapedParsed : [];
        } catch (err3) {
          console.error("Failed to parse cartItems:", raw);
          console.error("Errors:", err1, err2, err3);
          return [];
        }
      }
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        console.log("fetchData called with orderStatus:", orderStatus);
        console.log("All params:", params);

        // Reset states first
        resetStates();

        const login_token = await AsyncStorage.getItem('login_token');

        if (orderStatus === "taway_hold") {
          try {
            const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                function: "get_takeaway_order",
                data: { login_token, ts_id: params.orderId },
              }),
            });

            const data = await response.json();
            console.log("taway_hold API response:", data);

            setOrderId(data.order.ts_id);
            setTotalSale(parseFloat(data?.order?.order_total || 0));
            setDiscountAmount(parseFloat(data?.order?.discount || 0));
            setServiceCharge(parseFloat(data?.order?.service_charge || 0));
            setGrandTotal(parseFloat(data?.order?.grand_total || 0));
            setOtherCharges(parseFloat(data?.order?.service_charge || 0));

            // Set order items if available in the response
            if (data.order.order_items && Array.isArray(data.order.order_items)) {
              setOrderItems(data.order.order_items);
              console.log("taway_hold order items:", data.order.order_items);
            } else {
              console.log("No order_items found in taway_hold response, trying to fetch order details...");

              // Try to fetch order items using the same function as dine-in orders
              try {
                const detailResponse = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    function: "get_active_order",
                    data: {
                      login_token,
                      table_id: "-1", // Use -1 for takeaway
                      ts_id: params.orderId, // Add ts_id to get specific order
                    }
                  }),
                });

                const detailData = await detailResponse.json();
                console.log("Additional order detail response:", detailData);

                if (detailData.order && detailData.order.order_items && Array.isArray(detailData.order.order_items)) {
                  setOrderItems(detailData.order.order_items);
                  console.log("Successfully fetched order items from detail API:", detailData.order.order_items);
                } else {
                  console.log("Still no order items found, setting empty array");
                  setOrderItems([]);
                }
              } catch (detailError) {
                console.error("Error fetching order details:", detailError);
                setOrderItems([]);
              }
            }
          } catch (error) {
            console.error("Error fetching taway_hold order:", error);
            Alert.alert("Error", "Failed to fetch takeaway order");
          }
        } else if (orderStatus === "taway_new") {
          try {
            console.log("Processing taway_new order");

            // Get the cartItems - handle both string and array formats
            let cartItemsRaw = params.cartItems;
            console.log("Raw cartItems from params:", cartItemsRaw);

            // Parse cart items
            const parsedCart = safeParseCartItems(cartItemsRaw);
            console.log("Parsed cart items:", parsedCart);

            if (!Array.isArray(parsedCart) || parsedCart.length === 0) {
              Alert.alert("Error", "No cart items found. Please go back and try again.");
              return;
            }

            setOrderItems(parsedCart);

            // Calculate total from cart items
            const calculatedTotal = parsedCart.reduce((sum, item) => {
              const price = parseFloat(item.price || item.rate || item.total || 0);
              const quantity = parseInt(item.quantity || item.qty || 1);
              return sum + (price * quantity);
            }, 0);

            const total = calculatedTotal > 0 ? calculatedTotal : parseFloat(params.total || "0");

            console.log("Calculated total:", calculatedTotal, "Param total:", params.total, "Using:", total);

            setTotalSale(total);
            setDiscountAmount(0);
            setServiceCharge(0);
            setGrandTotal(total);
            setOtherCharges(0);

            // Prepare order data for API
            const orderData = parsedCart.map(item => ({
              id: String(item.id || item.foodItemId || Math.random().toString(36).substr(2, 9)),
              price: Number(item.price || item.rate || item.total || 0),
              quantity: Number(item.quantity || item.qty || 1),
            }));

            console.log("Order data for API:", orderData);

            if (orderData.length === 0) {
              Alert.alert("Error", "Could not prepare order items for API");
              return;
            }

            // Call API to create order
            const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                function: "update_orders",
                data: {
                  login_token,
                  table_id: "-1",
                  order_status: "act",
                  steward_id: "-1",
                  smode: "taway",
                  order_data: orderData,
                },
              }),
            });

            const data = await response.json();
            console.log("API Response for taway_new:", data);

            if (data.status === "success" && data.response?.ts_id) {
              setOrderId(data.response.ts_id);
            } else {
              Alert.alert("Error", "Failed to create takeaway order: " + (data.message || "Unknown error"));
            }
          } catch (error) {
            console.error("Error processing taway_new order:", error);
            Alert.alert("Error", "Server error while creating takeaway order: " + error.message);
          }
        } else if (orderStatus === "delivery_pending") {
          try {
            const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                function: "get_delivery_order",
                data: {
                  login_token,
                  ts_id: params.ts_id,
                }
              }),
            });

            const data = await response.json();
            console.log("delivery_pending API response:", data);

            setOrderId(data.order.ts_id);

            // Set order items - the API response has 'items' not 'order_items'
            if (data.order.items && Array.isArray(data.order.items)) {
              setOrderItems(data.order.items);
              console.log("delivery_pending order items:", data.order.items);
            } else {
              console.log("No items found in delivery_pending response");
              setOrderItems([]);
            }

            const orderTotal = parseFloat(data?.order?.order_total || 0);
            const orderDiscount = parseFloat(data?.order?.discount || 0);
            const orderServiceCharge = parseFloat(data?.order?.service_charge || 0);
            const orderDeliveryFee = parseFloat(data?.order?.delivery_fee || 0);
            const orderGrandTotal = parseFloat(data?.order?.grand_total || 0);

            setTotalSale(orderTotal);
            setDiscountAmount(orderDiscount);
            setServiceCharge(orderServiceCharge);
            setDeliveryFee(orderDeliveryFee); // Set delivery fee

            // Calculate grand total including delivery fee
            const calculatedGrandTotal = orderTotal + orderServiceCharge + orderDeliveryFee - orderDiscount;
            setGrandTotal(calculatedGrandTotal);
            setOtherCharges(orderServiceCharge + orderDeliveryFee); // Include delivery fee in other charges

            if (orderTotal > 0) {
              const discountPercentage = (orderDiscount / orderTotal) * 100;
              setSelectedDiscount(`${Math.round(discountPercentage)}%`);
            }
          } catch (error) {
            console.error("Error fetching delivery_pending order:", error);
            Alert.alert("Error", "Failed to fetch delivery order");
          }
        } else if (orderStatus === "dinein_active" || orderStatus === "dinein_inv") {
          try {
            const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                function: "get_active_order",
                data: {
                  login_token,
                  table_id: params.tableId,
                }
              }),
            });

            const data = await response.json();

            setOrderId(data.order.ts_id);
            setOrderItems(data.order.order_items);

            const orderTotal = parseFloat(data?.order?.order_total || 0);
            const orderDiscount = parseFloat(data?.order?.discount || 0);
            const orderServiceCharge = parseFloat(data?.order?.service_charge || 0);
            const orderGrandTotal = parseFloat(data?.order?.grand_total || 0);

            setTotalSale(orderTotal);
            setDiscountAmount(orderDiscount);
            setServiceCharge(orderServiceCharge);
            setGrandTotal(orderGrandTotal);
            setOtherCharges(orderServiceCharge);

            if (orderTotal > 0) {
              const discountPercentage = (orderDiscount / orderTotal) * 100;
              setSelectedDiscount(`${Math.round(discountPercentage)}%`);
            }
          } catch (error) {
            console.error("Error fetching dinein order:", error);
            Alert.alert("Error", "Failed to fetch dine-in order");
          }
        } else if (orderStatus === "delivery_new") {
          try {
            const total = parseFloat(params.total || "0");
            const discount = 0;
            const service = 0;
            const grand = total + service - discount;

            setTotalSale(total);
            setDiscountAmount(discount);
            setServiceCharge(service);
            setGrandTotal(grand);
            setOtherCharges(service);
          } catch (error) {
            console.error("Error processing delivery_new order:", error);
            Alert.alert("Error", "Server error while creating delivery order");
          }
        }
      };

      fetchData();
    }, [orderStatus, params.cartItems, params.total, params.orderId, params.ts_id, params.tableId]) // Added more dependencies
  );

  const getDiscountAmount = () => {
    return totalSale * (parseInt(selectedDiscount) / 100);
  };

  const handlePrintInvoice = async () => {
    setIsPrinting(true);
    const login_token = await AsyncStorage.getItem('login_token');
    const discountAmount = getDiscountAmount();

    try {
      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
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

      if (data.status === "success") {
        Alert.alert("Success", "Invoice generated successfully");
        router.push({
          pathname: '/print',
          params: {
            orderId,
            orderItems: JSON.stringify(orderItems),
            printStatus: 'invoice',
            orderDiscount: discountAmount.toFixed(2),
            paidAmount: paidAmount.toFixed(2),
            orderBalance: balance.toFixed(2),
            tableId: params.tableId,
          },
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
    if (orderStatus === "dinein_active" || orderStatus === "taway_hold" || orderStatus === "taway_new" || orderStatus === "delivery_new" || orderStatus === "delivery_pending") {
      const discount = getDiscountAmount();
      const newGrandTotal = totalSale + serviceCharge + deliveryFee - discount;
      setGrandTotal(newGrandTotal);
    }
  }, [selectedDiscount, totalSale, serviceCharge, deliveryFee]);

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
      const discount = getDiscountAmount();

      let paymentData: any;

      if (orderStatus === "dinein_inv" || orderStatus === "taway_hold" || orderStatus === "taway_new" || orderStatus === "delivery_pending") {
        paymentData = {
          login_token: login_token,
          ts_id: orderId,
          cash: cash || '0',
          card: card || '0',
        };
      } else {
        paymentData = {
          login_token: login_token,
          ts_id: params.orderId,
          cash: cash || '0',
          card: card || '0',
        };

        if (orderStatus === "taway_hold") {
          paymentData.discount = discount.toFixed(2);
        }
      }

      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: "complete_payment",
          data: paymentData,
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

      if (data.status === "success") {
        const responseOrderId = data.response;

        router.push({
          pathname: '/print',
          params: {
            orderId: responseOrderId,
            orderItems: JSON.stringify(orderItems),
            printStatus: 'paid',
            orderDiscount: discount.toFixed(2),
            paidAmount: paidAmount.toFixed(2),
            orderBalance: balance.toFixed(2),
            tableId: params.tableId || '-1',
            totalSale: totalSale.toFixed(2),
            serviceCharge: serviceCharge.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2), // Add delivery fee
            grandTotal: grandTotal.toFixed(2),
          },
        });

        // Reset form after successful payment
        setCard('0');
        setCash('0');
        setPaidAmount(0);
        setBalance(0);
        setSelectedMethod('Cash');
        setSelectedDiscount('0%');

      } else {
        Alert.alert("Payment Failed", data?.message || "Unknown error during payment.");
      }

    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert("Payment Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDelivery = async () => {
    try {
      setIsLoading(true);

      const login_token = await AsyncStorage.getItem('login_token');
      const discount = getDiscountAmount();

      const cartItems = safeParseCartItems(params.cartItems);
      const orderData = cartItems.map(item => ({
        id: item.id,
        price: parseFloat(item.price || item.rate || 0),
        quantity: parseInt(item.quantity || item.qty || 1),
      }));

      const payload = {
        function: "save_delivery_order",
        data: {
          login_token: login_token,
          table_id: "-2",
          order_status: "pending",
          steward_id: "-2",
          smode: "delivery",
          order_discount: discount.toFixed(2),
          order_data: orderData,
        },
      };

      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      if (!text) throw new Error("Empty server response");

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON from server");
      }

      if (data.status === "success" && data.response?.ts_id) {
        const ts_id = data.response.ts_id;

        router.push({
          pathname: "/deliverydetails",
          params: { ts_id: ts_id, orderStatus: "delivery_new" },
        });
      } else {
        Alert.alert("Error", data?.message || "Failed to save delivery order");
      }

    } catch (error) {
      console.error("Save Delivery Error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Unknown error");
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
          (orderStatus === "taway_new" || orderStatus === "taway_hold") ? router.push('/takeaway') : router.push('/table')
        )
        }>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settle the Bill</Text>
        <Ionicons name="menu" size={24} color="#000" />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
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
                  {(orderStatus === "taway_new" || orderStatus === "dinein_inv" || orderStatus === "taway_hold" || orderStatus === "delivery_pending") && (
                    <View style={styles.box}>
                      <View style={styles.paymentHeader}>
                        <Text style={styles.boxTitle}>Payment Method</Text>
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
                  {(orderStatus === "dinein_active" || orderStatus === "dinein_inv" || orderStatus === "taway_new" || orderStatus === "taway_hold" || orderStatus === "delivery_new") && (
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
                  {(orderStatus === "taway_new" || orderStatus === "taway_hold" || orderStatus === "dinein_inv" || orderStatus === "delivery_pending") && (
                    <View style={styles.box}>
                      <Text style={styles.boxTitle}>Settle Bill</Text>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Cash</Text>
                        <TextInput
                          value={cash}
                          onChangeText={(text) => {
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
                    {orderStatus === "delivery_pending" && <View style={styles.row}>
                      <Text style={styles.label}>Delivery Charge</Text>
                      <Text style={styles.value}>{serviceCharge.toFixed(2)}</Text>
                    </View>}
                    <View style={styles.row}>
                      <Text style={styles.label}>Discount ({selectedDiscount})</Text>
                      <Text style={styles.value}>
                        -{(orderStatus === "dinein_active" || orderStatus === "taway_new" || orderStatus === "taway_hold" || orderStatus === "dinein_inv" || orderStatus === "delivery_new" || orderStatus === "delivery_pending") ? getDiscountAmount() : ''}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.totalLabel}>Grand Total</Text>
                      <Text style={styles.totalValue}>{grandTotal.toFixed(2)}</Text>
                    </View>
                    {(orderStatus === "taway_new" || orderStatus === "taway_hold" || orderStatus === "dinein_inv" || orderStatus === "delivery_pending") && <View style={styles.row}>
                      <Text style={styles.label}>Paid Amount</Text>
                      <Text style={styles.value}>{paidAmount.toFixed(2)}</Text>
                    </View>}
                    {(orderStatus === "taway_new" || orderStatus === "taway_hold" || orderStatus === "dinein_inv" || orderStatus === "delivery_pending") && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Balance</Text>
                        <Text style={[styles.value, { color: balance < 0 ? 'red' : 'green' }]}>
                          {balance.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  {(orderStatus === "taway_new" || orderStatus === "taway_hold" || orderStatus === "dinein_inv") && (
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
                  {(orderStatus === "dinein_active") && (
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
                  {(orderStatus === "delivery_new" || orderStatus === "delivery_pending") && (
                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: '#313131ff',
                          borderRadius: 8,
                          alignItems: 'center',
                          paddingVertical: 14,
                          marginRight: 10,
                        }}
                        disabled={isLoading || orderStatus === "delivery_pending"}
                        onPress={() => {
                          handleSaveDelivery();
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Proceed</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: '#f57c00',
                          borderRadius: 8,
                          alignItems: 'center',
                          paddingVertical: 14,
                          opacity: orderStatus === "delivery_new" ? 0.7 : 1,
                        }}
                        disabled={isLoading || orderStatus === "delivery_new"}
                        onPress={handlePayment}
                      >
                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Pay</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingTop: 30, paddingBottom: 16, paddingHorizontal: 20, },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1c1c1c', right: 80, },
  content: { padding: 16, paddingBottom: 40, },
  totalBox: { backgroundColor: '#1c1c1c', padding: 20, borderRadius: 12, marginBottom: 16, },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, },
  label: { color: '#ccc', fontSize: 14 },
  value: { color: '#fff', fontSize: 14 },
  totalLabel: { fontWeight: '700', fontSize: 16, color: '#fff', },
  totalValue: { fontWeight: '700', fontSize: 16, color: '#fff', },
  box: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  boxTitle: { fontSize: 16, fontWeight: '600', color: '#1c1c1c', marginBottom: 10, },
  empBtn: { backgroundColor: '#ccc', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 10, },
  empBtnText: { color: '#fff', fontWeight: '600', },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, },
  methodButton: { width: '32%', backgroundColor: '#ddd', borderRadius: 8, paddingVertical: 12, alignItems: 'center', },
  discountButton: { width: '32%', backgroundColor: '#ddd', borderRadius: 8, paddingVertical: 12, alignItems: 'center', },
  activeButton: { backgroundColor: '#f57c00', },
  buttonText: { color: '#333', fontWeight: '600', },
  activeText: { color: '#fff', },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, },
  inputLabel: { width: 100, fontSize: 14, color: '#333', },
  input: { flex: 1, backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, },
  cancelBtn: { flex: 1, backgroundColor: '#aaa', borderRadius: 8, alignItems: 'center', paddingVertical: 14, marginRight: 10, },
  payBtn: { flex: 1, backgroundColor: '#f57c00', borderRadius: 8, alignItems: 'center', paddingVertical: 14, },
  cancelText: { color: '#fff', fontWeight: '600', fontSize: 16, },
  payText: { color: '#fff', fontWeight: '600', fontSize: 16, },
  discountInfo: { marginTop: 10, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 6, },
  discountText: { color: '#f57c00', fontWeight: '600', },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', },
  errorContainer: { justifyContent: 'center', alignItems: 'center', padding: 20, },
  errorText: { color: 'red', marginBottom: 20, textAlign: 'center', },

});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import CustomModal from '../../components/CustomModal'; // adjust path as needed

const HomeScreen: React.FC = () => {
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleContinue = async () => {
    if (!balance || isNaN(parseFloat(balance))) {
      showModal('Please enter a valid opening balance.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('login_token');
      if (!token) {
        showModal('Session expired. Please log in again.');
        setTimeout(() => router.replace('/login'), 1500);
        return;
      }

      const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: 'save_workday',
          data: {
            login_token: token,
            open_balance: parseFloat(balance),
          },
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        await AsyncStorage.setItem('wd_id', result.wd_id.toString());
        await AsyncStorage.setItem('last_workday', new Date().toISOString().slice(0, 10));
        console.log('Current Date : ', await AsyncStorage.getItem('last_workday'));
        router.push('/table');
      } else {
        showModal(result.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error saving workday:', error);
      showModal('Failed to save opening balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <StatusBar barStyle="light-content" backgroundColor="#d76400cc" />
            <ImageBackground
              source={require('../../assets/images/bg.jpg')}
              style={styles.topBackground}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', '#d76400cc']}
                style={styles.gradient}
              />
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}...</Text>
                <Text style={styles.time}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.date}>
                  {new Date().toISOString().slice(0, 10)}
                </Text>

                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>
                    <Text style={styles.logoOrange}>i</Text>POS
                  </Text>
                  <Text style={styles.logoSub}>www.introps.com</Text>
                </View>
              </View>
            </ImageBackground>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Opening Balance</Text>
              <TextInput
                style={styles.balanceInput}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#aaa"
                value={balance}
                onChangeText={setBalance}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Save & Continue'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.footer}>Enter your Opening Balance</Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Custom Modal for alerts */}
      <CustomModal
        visible={modalVisible}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f2f0',
    alignItems: 'center',
  },
  topBackground: {
    width: '100%',
    height: 350,
    justifyContent: 'flex-end',
    borderBottomRightRadius: 60,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    padding: 24,
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 170,
  },
  time: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 20,
    color: '#fff',
    marginTop: 4,
  },
  logoContainer: {
    position: 'absolute',
    top: 30,
    right: 24,
    alignItems: 'flex-end',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  logoOrange: {
    color: '#f57c00',
  },
  logoSub: {
    fontSize: 10,
    color: '#eee',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    height: '30%',
    padding: 24,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  balanceInput: {
    fontSize: 40,
    fontWeight: '600',
    textAlign: 'right',
    color: '#333',
    marginTop: 20,
  },

  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    marginTop: 30,


  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',

  },
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: '#555',
  },
});

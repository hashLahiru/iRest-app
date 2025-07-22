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

const HomeScreen: React.FC = () => {
  const [balance, setBalance] = useState('');

  const handleContinue = () => {
    router.push('/table');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <StatusBar barStyle="light-content" backgroundColor="#d76400cc" />

          {/* Background section with overlay */}
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
              <Text style={styles.greeting}>Good Morning...</Text>
              <Text style={styles.time}>09.30</Text>
              <Text style={styles.date}>2025.06.23</Text>

              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>
                  <Text style={styles.logoOrange}>i</Text>POS
                </Text>
                <Text style={styles.logoSub}>www.introps.com</Text>
              </View>
            </View>
          </ImageBackground>

          {/* Balance Input */}
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

          {/* Save Button */}
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Save & Continue</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Enter your Opening Balance</Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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

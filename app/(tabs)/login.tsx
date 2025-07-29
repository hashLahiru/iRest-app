import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg('Please enter both username and password');
      setModalVisible(true);
      return;
    }

    try {
      const last_workday = await AsyncStorage.getItem('last_workday');

      const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            function: 'app_login',
            data: { username, password },
          }),
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        await AsyncStorage.setItem('login_token', result.login_token);
        if (last_workday && new Date(last_workday).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)) {
          return router.replace('/table');
        } else {
          router.push('/home');
        }
      } else {
        setErrorMsg(result.message || 'Login failed. Please try again.');
        setModalVisible(true);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('An error occurred. Please try again later.');
      setModalVisible(true);
    }

    // router.replace('/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1 }}>
        {/* Image Background */}
        <ImageBackground
          source={require('../../assets/images/bg.jpg')}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>iPOS</Text>
            <Text style={styles.website}>www.introps.com</Text>
          </View>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, { backgroundColor: '#fff' }]} />
            <View style={[styles.dot, { backgroundColor: '#ccc' }]} />
            <View style={[styles.dot, { backgroundColor: '#f57c00' }]} />
          </View>
        </ImageBackground>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcome}>Welcome back.</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            secureTextEntry
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>Enter your username and password</Text>
        </View>

        {/* Modal for error */}
        <Modal
          transparent
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{errorMsg}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f2',
  },
  imageBackground: {
    height: '80%',
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    alignItems: 'flex-end',
  },
  logo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  website: {
    fontSize: 12,
    color: '#fff',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  formContainer: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    backgroundColor: '#f6f4f2',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 50,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1c',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 18,
    color: '#000',
  },
  forgot: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  }, modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

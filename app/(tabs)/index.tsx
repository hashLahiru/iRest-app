import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('login_token');
        const last_workday = await AsyncStorage.getItem('last_workday');

        if (!token) {
          return router.replace('/login');
        }

        const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            function: 'check_login_status',
            data: { login_token: token },
          }),
        });

        const result = await response.json();

        if (result.status === 'success') {
          if (last_workday && new Date(last_workday).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)) {
            return router.replace('/table');
          }
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      } catch (err) {
        console.error('Login status check failed:', err);
        router.replace('/login');
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <LinearGradient
      colors={['#1c1c1c', '#f57c00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 24 }} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.powered}>Powered by introps</Text>
        <Text style={styles.credit}>Designed by Sunera AP Siriwardhana</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  powered: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  credit: {
    fontSize: 10,
    color: '#ddd',
    marginTop: 6,
  },
});

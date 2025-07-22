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
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
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
          source={require('../../assets/images/logo.png')} // Replace with your actual logo path
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
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

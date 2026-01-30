import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  useEffect(() => {
    // Auto-navigate after 3 seconds (optional)
    const timer = setTimeout(() => {
      // Uncomment to auto-navigate
      // navigation.replace('Login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/daaktar-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Tagline */}

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.75,
    height: height * 0.15,
    maxWidth: 300,
    maxHeight: 150,
  },
  brandName: {
    fontSize: Math.min(width * 0.11, 42),
    fontWeight: 'bold',
    color: '#0094b8',
    marginTop: 30,
    marginBottom: 8,
  },
  tagline: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  signInButton: {
    backgroundColor: '#0094b8',
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0094b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  signUpButtonText: {
    color: '#0094b8',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
  },
});

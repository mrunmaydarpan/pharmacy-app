import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function Header() {
  const pharmacy = useSelector((state: RootState) => state.auth.pharmacy);

  return (
    <View style={styles.header}>
      <Image
        source={require('../../assets/images/daaktar-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Hi, Welcome Back,</Text>
        <Text style={styles.userName}>{pharmacy?.company_name || pharmacy?.name || 'Pharmacy'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.025,
    backgroundColor: '#fff',
  },
  logo: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 40 : 50,
  },
  welcomeContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#999',
    marginBottom: 2,
  },
  userName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

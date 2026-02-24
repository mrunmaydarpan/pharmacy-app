import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const pharmacy = useSelector((state: RootState) => state.auth.pharmacy);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    setShowLogoutModal(false);
    try {
      console.log('Starting logout process...');
      console.log('Current auth state before logout:', isAuthenticated);

      // Clear AsyncStorage first
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('pharmacy');
      console.log('AsyncStorage cleared');

      // Dispatch logout action - this sets isAuthenticated to false
      dispatch(logout());
      console.log('Redux logout dispatched');
      console.log('After dispatch, auth state should be false');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileImageText}>💼</Text>
          </View>
        </View>
        <Text style={styles.profileName}>{pharmacy?.company_name || 'Pharmacy'}</Text>
        <Text style={styles.profileEmail}>{pharmacy?.email}</Text>
      </View>

      {/* Profile Menu Items */}
      <View style={styles.menuContainer}>
        {/* History */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>⏱️</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>History</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Personal Details */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>👤</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Personal Details</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Location */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>📍</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Location</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Payment Method */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>💳</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Payment Method</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>⚙️</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Settings</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>❓</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Help</Text>
          </View>
          <View style={styles.arrowIcon}>
            <Text style={styles.arrowIconText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🚪</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, styles.logoutText]}>Logout</Text>
          </View>
          <View style={[styles.arrowIcon, styles.logoutArrow]}>
            <Text style={[styles.arrowIconText, styles.logoutArrowText]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <View style={styles.logoutIconContainer}>
              <Text style={styles.logoutModalIcon}>🚪</Text>
            </View>

            <Text style={styles.logoutModalTitle}>Logout</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.logoutButtons}>
              <TouchableOpacity
                style={[styles.logoutButton, styles.logoutButtonCancel]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutButton, styles.logoutButtonConfirm]}
                onPress={performLogout}
              >
                <Text style={styles.logoutButtonTextConfirm}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0094b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageText: {
    fontSize: 50,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: '#999999',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  rightIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  rightIconText: {
    fontSize: 22,
  },
  logoutIcon: {
    backgroundColor: '#ffebee',
  },
  logoutIconText: {
    color: '#ef4444',
  },
  arrowIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  arrowIconText: {
    fontSize: 28,
    color: '#0094b8',
    fontWeight: 'bold',
  },
  logoutArrow: {
    backgroundColor: '#ffebee',
  },
  logoutArrowText: {
    color: '#ef4444',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalIcon: {
    fontSize: 32,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonCancel: {
    backgroundColor: '#e5e7eb',
  },
  logoutButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  logoutButtonTextCancel: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonTextConfirm: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

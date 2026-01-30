import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiService from '../services/apiService';
import Header from '../components/Header';

const RAZORPAY_KEY_ID = 'rzp_live_S2WtenQkjwT34g';

export default function AddPatientScreen({ navigation }: any) {
  const pharmacy = useSelector((state: RootState) => state.auth.pharmacy);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [appointmentType, setAppointmentType] = useState<'physical' | 'virtual'>('physical');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRazorpayWebView, setShowRazorpayWebView] = useState(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const webViewRef = useRef<WebView>(null);

  const locations = ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela', 'Sambalpur'];
  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (location) {
      loadDoctors(location);
      setSelectedDoctor(null);
      setDate('');
      setTimeSlot('');
    }
  }, [location]);

  const loadDoctors = async (selectedLocation?: string) => {
    try {
      const response = await apiService.getDoctors(selectedLocation);
      console.log('Doctors API response:', response.data);
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    }
  };

  const getDoctorAvailableDays = () => {
    if (!selectedDoctor?.days) return [];
    return selectedDoctor.days.split(',').map((day: string) => day.trim().toUpperCase());
  };

  const isDayAvailable = (date: Date) => {
    const availableDays = getDoctorAvailableDays();
    if (availableDays.length === 0) return false;

    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayName = dayNames[date.getDay()];
    
    return availableDays.includes(dayName) || availableDays.includes('WEDNESSDAY') && dayName === 'WEDNESDAY';
  };

  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    const startPadding = firstDay.getDay();
    
    for (let i = 0; i < startPadding; i++) {
      dates.push(null);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }
    
    return dates;
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      if (Platform.OS === 'web') {
        window.alert('Patient name and mobile are required');
      } else {
        Alert.alert('Error', 'Patient name and mobile are required');
      }
      return;
    }

    // Validate mobile number
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a valid 10-digit mobile number');
      } else {
        Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      }
      return;
    }

    if (!location) {
      if (Platform.OS === 'web') {
        window.alert('Please select a location');
      } else {
        Alert.alert('Error', 'Please select a location');
      }
      return;
    }

    if (!selectedDoctor) {
      if (Platform.OS === 'web') {
        window.alert('Please select a doctor');
      } else {
        Alert.alert('Error', 'Please select a doctor');
      }
      return;
    }

    if (!date || !timeSlot) {
      if (Platform.OS === 'web') {
        window.alert('Please select date and time slot');
      } else {
        Alert.alert('Error', 'Please select date and time slot');
      }
      return;
    }

    // Show payment modal instead of directly submitting
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod: 'wallet' | 'razorpay') => {
    setShowPaymentModal(false);
    
    const pharmacyId = pharmacy?.id;
    const amount = selectedDoctor.fee || 0;

    if (!pharmacyId) {
      Alert.alert('Error', 'Pharmacy ID not found');
      return;
    }

    // Handle Razorpay payment
    if (paymentMethod === 'razorpay') {
      // For web platform, show not supported message
      if (Platform.OS === 'web') {
        Alert.alert(
          'Razorpay Payment',
          'Razorpay payment is not supported on web. Please use wallet payment or access from mobile app.',
          [{ text: 'OK' }]
        );
        return;
      }

      // For mobile platforms - open Razorpay in WebView
      console.log('Opening Razorpay WebView...');
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated order ID:', orderId);
      setRazorpayOrderId(orderId);
      console.log('Setting showRazorpayWebView to true');
      setShowRazorpayWebView(true);
      console.log('showRazorpayWebView should now be true');
      return;
    }

    // Handle Wallet payment
    setLoading(true);
    
    try {
      // Step 1: Debit wallet
      const note = `Patient slot booking for ${name}`;
      const walletResponse = await apiService.debitWallet(pharmacyId, amount, note);
      
      if (!walletResponse.data.success) {
        throw new Error('Wallet debit failed');
      }
      
      console.log('Wallet debited, new balance:', walletResponse.data.balance);

      // Step 2: Book the appointment
      const bookingData = {
        name,
        mobile: phone,
        doctor_id: selectedDoctor.id,
        pharmacy_id: pharmacyId,
        date,
        slot: timeSlot,
        appointment_type: appointmentType,
        notes: notes || undefined,
        price: amount,
        payment_method: 'wallet',
      };

      const bookingResponse = await apiService.addBooking(bookingData);
      
      console.log('Booking created:', bookingResponse.data);

      // Step 3: Success - navigate back
      Alert.alert('Success', 'Appointment booked successfully');
      navigation.goBack();
      
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      
      let errorMessage = 'Failed to book appointment';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayMessage = async (event: any) => {
    try {
      console.log('Raw message from WebView:', event.nativeEvent.data);
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Parsed Razorpay message:', data);
      
      setShowRazorpayWebView(false);
      
      if (data.status === 'success') {
        // Payment successful - create booking
        setLoading(true);
        
        try {
          const pharmacyId = pharmacy?.id;
          const amount = selectedDoctor.fee || 0;
          
          const bookingData = {
            name,
            mobile: phone,
            doctor_id: selectedDoctor.id,
            pharmacy_id: pharmacyId,
            date,
            slot: timeSlot,
            appointment_type: appointmentType,
            notes: notes || undefined,
            price: amount,
            payment_id: data.payment_id,
            payment_method: 'razorpay',
          };

          console.log('Creating booking with data:', bookingData);
          const bookingResponse = await apiService.addBooking(bookingData);
          console.log('Booking created:', bookingResponse.data);

          Alert.alert('Success', 'Payment successful! Appointment booked.');
          navigation.goBack();
        } catch (error: any) {
          console.error('Error booking appointment:', error);
          Alert.alert('Error', 'Payment successful but booking failed. Please contact support.');
        } finally {
          setLoading(false);
        }
      } else if (data.status === 'failed') {
        Alert.alert('Payment Failed', data.error?.description || 'Payment could not be processed');
      } else if (data.status === 'cancelled') {
        console.log('Payment cancelled by user');
      }
    } catch (error) {
      console.error('Error parsing Razorpay message:', error);
      setShowRazorpayWebView(false);
    }
  };

  const getRazorpayHTML = () => {
    const amount = selectedDoctor?.fee || 0;
    const amountInPaise = Math.round(amount * 100);
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Payment</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #0094b8;
      color: white;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .payment-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
    }
    .amount-display {
      text-align: center;
      margin-bottom: 30px;
    }
    .amount-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }
    .amount-value {
      font-size: 36px;
      font-weight: bold;
      color: #0094b8;
    }
    .pay-button {
      width: 100%;
      background: #0094b8;
      color: white;
      border: none;
      padding: 16px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      -webkit-appearance: none;
      touch-action: manipulation;
    }
    .pay-button:active {
      transform: scale(0.98);
      background: #007a9a;
    }
    .pay-button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .loading {
      display: none;
      text-align: center;
      margin-top: 20px;
    }
    .loading.active {
      display: block;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #0094b8;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .info {
      margin-top: 20px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
      font-size: 13px;
      color: #1976d2;
      text-align: center;
    }
    #razorpay-form {
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Daaktar Pharmacy</h1>
    <p>Complete Your Payment</p>
  </div>
  
  <div class="content">
    <div class="payment-card">
      <div class="amount-display">
        <div class="amount-label">Amount to Pay</div>
        <div class="amount-value">₹${amount}</div>
      </div>
      
      <form id="razorpay-form">
        <button type="button" id="pay-button" class="pay-button" onclick="initiatePayment()">
          Pay Now with Razorpay
        </button>
      </form>
      
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Processing payment...</p>
      </div>
      
      <div class="info">
        Secure payment powered by Razorpay
      </div>
    </div>
  </div>
  
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    console.log('Payment page loaded');
    console.log('Razorpay object available:', typeof Razorpay !== 'undefined');
    console.log('ReactNativeWebView available:', typeof window.ReactNativeWebView !== 'undefined');
    
    let paymentProcessing = false;
    
    function postMessage(data) {
      console.log('Attempting to post message:', data);
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
          console.log('Message posted successfully');
        } else {
          console.error('ReactNativeWebView not available');
        }
      } catch (e) {
        console.error('Error posting message:', e);
      }
    }
    
    function initiatePayment() {
      console.log('initiatePayment called');
      
      if (paymentProcessing) {
        console.log('Payment already in progress');
        return;
      }
      
      paymentProcessing = true;
      document.getElementById('pay-button').disabled = true;
      document.getElementById('loading').classList.add('active');
      
      console.log('Starting Razorpay initialization...');
      
      const options = {
        key: '${RAZORPAY_KEY_ID}',
        amount: ${amountInPaise},
        currency: 'INR',
        name: 'Daaktar Pharmacy',
        description: 'Appointment booking for ${name.replace(/'/g, "\\'")}',
        prefill: {
          name: '${name.replace(/'/g, "\\'")}',
          contact: '${phone}'
        },
        theme: {
          color: '#0094b8',
          hide_topbar: false
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            paymentProcessing = false;
            document.getElementById('pay-button').disabled = false;
            document.getElementById('loading').classList.remove('active');
            postMessage({ status: 'cancelled' });
          },
          escape: true,
          backdropclose: false
        },
        handler: function(response) {
          console.log('Payment success handler called', response);
          postMessage({
            status: 'success',
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        }
      };
      
      console.log('Razorpay options:', JSON.stringify(options, null, 2));
      
      try {
        console.log('Creating Razorpay instance...');
        const rzp = new Razorpay(options);
        console.log('Razorpay instance created');
        
        rzp.on('payment.failed', function(response) {
          console.log('Payment failed event', response.error);
          paymentProcessing = false;
          document.getElementById('pay-button').disabled = false;
          document.getElementById('loading').classList.remove('active');
          postMessage({
            status: 'failed',
            error: response.error
          });
        });
        
        setTimeout(function() {
          try {
            console.log('Calling rzp.open()...');
            rzp.open();
            console.log('rzp.open() called successfully');
          } catch (e) {
            console.error('Error calling rzp.open():', e);
            paymentProcessing = false;
            document.getElementById('pay-button').disabled = false;
            document.getElementById('loading').classList.remove('active');
            postMessage({
              status: 'failed',
              error: { description: 'Failed to open payment: ' + e.message }
            });
          }
        }, 300);
        
      } catch (error) {
        console.error('Error creating Razorpay instance:', error);
        paymentProcessing = false;
        document.getElementById('pay-button').disabled = false;
        document.getElementById('loading').classList.remove('active');
        postMessage({
          status: 'failed',
          error: { description: 'Failed to initialize payment: ' + error.message }
        });
      }
    }
    
    // Log when page is fully ready
    window.addEventListener('load', function() {
      console.log('Window fully loaded');
    });
  </script>
</body>
</html>
    `;
  };

  return (
    <View style={styles.wrapper}>
      {console.log('Render - showRazorpayWebView:', showRazorpayWebView)}
      {console.log('Render - razorpayOrderId:', razorpayOrderId)}
      {console.log('Render - Platform.OS:', Platform.OS)}
      <Header />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
        {/* Patient Name & Mobile Row */}
        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>Patient Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter patient name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>Patient Mobile *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={(text) => {
                // Only allow numeric input
                const numericText = text.replace(/[^0-9]/g, '');
                setPhone(numericText);
              }}
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
            />
          </View>
        </View>

        {/* Select Location */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Select Location *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowLocationModal(true)}
            disabled={loading}
          >
            <Text style={[styles.dropdownText, !location && styles.placeholder]}>
              {location || 'Select Location'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Type */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Appointment Type *</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setAppointmentType('physical')}
              disabled={loading}
            >
              <View style={styles.radioCircle}>
                {appointmentType === 'physical' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioLabel}>🏥 Physical Consultation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setAppointmentType('virtual')}
              disabled={loading}
            >
              <View style={styles.radioCircle}>
                {appointmentType === 'virtual' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioLabel}>💻 Virtual Consultation</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            {appointmentType === 'physical' 
              ? "In-person appointment at the doctor's clinic"
              : 'Online video consultation with the doctor'}
          </Text>
        </View>

        {/* Select Doctor */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Select Doctor *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => location ? setShowDoctorModal(true) : null}
            disabled={loading || !location}
          >
            <Text style={[styles.dropdownText, !selectedDoctor && styles.placeholder]}>
              {selectedDoctor ? selectedDoctor.name : (location ? 'Select a doctor' : 'Please select a location first')}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Date & Time Slot Row */}
        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => selectedDoctor ? setShowDatePicker(true) : null}
              disabled={loading || !selectedDoctor}
            >
              <Text style={[styles.dropdownText, !date && styles.placeholder]}>
                {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (selectedDoctor ? 'Select date' : 'Select doctor first')}
              </Text>
              <Text style={styles.dropdownIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputWrapper, styles.halfWidth]}>
            <Text style={styles.label}>Time Slot *</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowTimeSlotModal(true)}
              disabled={loading}
            >
              <Text style={[styles.dropdownText, !timeSlot && styles.placeholder]}>
                {timeSlot || 'Select Time Slot'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes..."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        {/* Submit & Cancel Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <ScrollView style={styles.modalList}>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.modalItem}
                  onPress={() => {
                    setLocation(loc);
                    setShowLocationModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Doctor Modal */}
      <Modal
        visible={showDoctorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDoctorModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDoctorModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            <ScrollView style={styles.modalList}>
              {doctors.map((doctor) => (
                <TouchableOpacity
                  key={doctor.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDoctor(doctor);
                    setShowDoctorModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{doctor.name}</Text>
                  {doctor.specialization && (
                    <Text style={styles.modalItemSubtext}>{doctor.specialization}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Slot Modal */}
      <Modal
        visible={showTimeSlotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeSlotModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimeSlotModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time Slot</Text>
            <ScrollView style={styles.modalList}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={styles.modalItem}
                  onPress={() => {
                    setTimeSlot(slot);
                    setShowTimeSlotModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={[styles.modalContent, styles.datePickerModal]} onStartShouldSetResponder={() => true}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.monthNav}>
                <Text style={styles.monthNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.monthNav}>
                <Text style={styles.monthNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarContainer}>
              <View style={styles.weekDaysRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>

              <View style={styles.datesGrid}>
                {generateCalendarDates().map((dateObj, index) => {
                  if (!dateObj) {
                    return <View key={`empty-${index}`} style={styles.dateCell} />;
                  }

                  const isAvailable = isDayAvailable(dateObj);
                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                  const isSelected = date === formatDate(dateObj);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateCell,
                        isAvailable && !isPast && styles.dateCellAvailable,
                        isSelected && styles.dateCellSelected,
                        (!isAvailable || isPast) && styles.dateCellDisabled,
                      ]}
                      onPress={() => {
                        if (isAvailable && !isPast) {
                          setDate(formatDate(dateObj));
                          setShowDatePicker(false);
                        }
                      }}
                      disabled={!isAvailable || isPast}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          isAvailable && !isPast && styles.dateTextAvailable,
                          isSelected && styles.dateTextSelected,
                          (!isAvailable || isPast) && styles.dateTextDisabled,
                          isToday && styles.dateTextToday,
                        ]}
                      >
                        {dateObj.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selectedDoctor && (
              <View style={styles.availabilityNote}>
                <Text style={styles.availabilityText}>
                  ✓ Available on: {getDoctorAvailableDays().join(', ')}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentModal}>
            <Text style={styles.paymentTitle}>Choose Payment Method</Text>
            
            <Text style={styles.paymentAmount}>
              Amount: ₹{selectedDoctor?.fee || 0}
            </Text>

            <TouchableOpacity
              style={styles.walletButton}
              onPress={() => handlePayment('wallet')}
            >
              <Text style={styles.walletButtonText}>Pay from Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.razorpayButton}
              onPress={() => handlePayment('razorpay')}
            >
              <Text style={styles.razorpayButtonText}>Pay with Razorpay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Razorpay WebView Modal - Only for Mobile */}
      {Platform.OS !== 'web' && showRazorpayWebView && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => {
            console.log('Modal onRequestClose called');
            setShowRazorpayWebView(false);
          }}
        >
          <View style={styles.webViewContainer}>
            <View style={styles.webViewHeader}>
              <Text style={styles.webViewTitle}>Complete Payment (Order: {razorpayOrderId.substring(0, 15)}...)</Text>
              <TouchableOpacity
                onPress={() => {
                  console.log('Close button pressed');
                  Alert.alert(
                    'Cancel Payment',
                    'Are you sure you want to cancel this payment?',
                    [
                      { text: 'No', style: 'cancel' },
                      { 
                        text: 'Yes', 
                        onPress: () => {
                          console.log('Closing Razorpay modal');
                          setShowRazorpayWebView(false);
                        },
                        style: 'destructive'
                      }
                    ]
                  );
                }}
                style={styles.webViewCloseButton}
              >
                <Text style={styles.webViewCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {razorpayOrderId ? (
              <WebView
                ref={webViewRef}
                source={{ html: getRazorpayHTML() }}
                onMessage={handleRazorpayMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <ActivityIndicator size="large" color="#0094b8" />
                    <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading payment...</Text>
                  </View>
                )}
                scalesPageToFit={true}
                mixedContentMode="always"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
                cacheEnabled={false}
                incognito={false}
                onContentProcessDidTerminate={() => {
                  console.log('WebView terminated, reloading...');
                  webViewRef.current?.reload();
                }}
                onShouldStartLoadWithRequest={(request) => {
                  console.log('WebView loading:', request.url);
                  return true;
                }}
                onLoadStart={(syntheticEvent) => {
                  console.log('WebView load started');
                }}
                onLoadEnd={() => {
                  console.log('WebView loaded successfully');
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('WebView error:', nativeEvent);
                  Alert.alert('Error', 'Failed to load payment page. Please try again.');
                  setShowRazorpayWebView(false);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('WebView HTTP error:', nativeEvent);
                }}
                originWhitelist={['*']}
                style={styles.webView}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#0094b8" />
                <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Initializing...</Text>
              </View>
            )}
          </View>
        </Modal>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  radioContainer: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0094b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0094b8',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#4c51bf',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4c51bf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '80%',
    maxHeight: '60%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
  },
  modalItemSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  datePickerModal: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthNav: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  monthNavText: {
    fontSize: 24,
    color: '#0094b8',
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginBottom: 15,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dateCellAvailable: {
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
  },
  dateCellSelected: {
    backgroundColor: '#0094b8',
  },
  dateCellDisabled: {
    opacity: 0.3,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  dateTextAvailable: {
    color: '#0094b8',
    fontWeight: '600',
  },
  dateTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateTextDisabled: {
    color: '#ccc',
  },
  dateTextToday: {
    textDecorationLine: 'underline',
  },
  availabilityNote: {
    backgroundColor: '#e0f2f1',
    padding: 12,
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#0094b8',
    textAlign: 'center',
  },
  paymentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0094b8',
    marginBottom: 24,
  },
  walletButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  razorpayButton: {
    backgroundColor: '#4c51bf',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  razorpayButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#0094b8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  webViewCloseButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewCloseText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import apiService from '../services/apiService';
import { RootState } from '../store';

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

      // For mobile platforms - use Native Razorpay
      console.log('Opening Native Razorpay...');

      const options = {
        description: `Appointment booking for ${name}`,
        image: 'https://daaktar.com/assets/images/logo.png',
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        name: 'Daaktar Pharmacy',
        prefill: {
          email: pharmacy?.email || '',
          contact: phone || '',
          name: name || ''
        },
        theme: { color: '#0094b8' }
      };

      try {
        const data = await RazorpayCheckout.open(options);
        console.log('Razorpay payment successful:', data);

        // Payment successful - create booking
        setLoading(true);

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
          payment_id: data.razorpay_payment_id,
          payment_method: 'razorpay',
        };

        const bookingResponse = await apiService.addBooking(bookingData);
        console.log('Booking created:', bookingResponse.data);

        Alert.alert('Success', 'Payment successful! Appointment booked.');
        navigation.goBack();
      } catch (error: any) {
        console.error('Razorpay Error:', error);
        // code 2 is user cancelled
        if (error.code !== 2) {
          Alert.alert('Payment Failed', error.description || 'Payment could not be processed');
        }
      } finally {
        setLoading(false);
      }
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

  return (
    <View style={styles.container}>
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

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
});


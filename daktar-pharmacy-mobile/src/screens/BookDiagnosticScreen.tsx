import React, { useEffect, useState } from 'react';
import
{
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector } from 'react-redux';
import DropDown from '../components/DropDown';
import apiService from '../services/apiService';

interface Patient
{
  id: string;
  name: string;
  mobile: string;
}

interface Test
{
  id: number;
  test_name: string;
  b2b_price: string;
}

interface NewPatient
{
  name: string;
  mobile: string;
  note: string;
  pharmacy_id: string;
}

export default function BookDiagnosticScreen({ navigation }: any)
{
  const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
  const pharmacyId = useSelector((state: any) => state.auth.user?.id);
  const pharmacy = useSelector((state: any) => state.auth.pharmacy);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

  const loadPatients = async () =>
  {
    try
    {
      const response = await apiService.fetchPatients();
      // console.log(response.data.patients);
      setPatient(response.data.patients);
    } catch (error)
    {
      console.error('Error loading patients:', error);
    }
  };

  const loadTests = async () =>
  {
    try
    {
      const response = await apiService.fetchTests();
      // console.log(response.data);
      setTests(response.data);
    } catch (error)
    {
      console.error('Error loading tests:', error);
    }
  };

  useEffect(() =>
  {
    loadPatients();
    loadTests();
  }, []);


  // UI State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
  const [note, setNote] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientDetails, setNewPatientDetails] = useState<NewPatient>();

  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null);

  // Total amount
  const totalAmount = selectedTestIds.reduce((sum, testId) =>
  {
    const test = tests.find(t => t.id === testId);
    return sum + (test ? parseFloat(test.b2b_price) : 0);
  }, 0);

  const patientOptions = Array.from(new Set(patient.map(p => p.id)))
    .map(id =>
    {
      const p = patient.find(p => p.id === id);
      return {
        label: `${p?.name} (${p?.mobile})`,
        value: id,
      };
    });

  const testOptions = Array.from(new Set(tests.map(t => t.id)))
    .map(id =>
    {
      const t = tests.find(t => t.id === id);
      return {
        label: `${t?.test_name} - ₹${t?.b2b_price}`,
        value: id
      };
    });

  const handleTestSelect = (testId: any) =>
  {
    if (Array.isArray(testId))
    {
      setSelectedTestIds(testId);
    } else
    {
      if (selectedTestIds.includes(testId))
      {
        setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
      } else
      {
        setSelectedTestIds([...selectedTestIds, testId]);
      }
    }
  };

  const handleCreatePatient = () =>
  {
    const patientData: NewPatient = {
      name: newPatientName,
      mobile: newPatientPhone,
      note: note,
      pharmacy_id: pharmacyId,
    };

    console.log(patientData);

    if (isPhoneValid)
    {
      apiService.createNewPatient({ newPatientDetails: patientData }).then((response) =>
      {
        // console.log(response);
        alert("Patient created successfully");
        setNewPatientDetails(patientData); // Update state after successful creation
        loadPatients();
        setIsAddingNewPatient(false); //set to false when status code is 201
      }).catch((error) =>
      {
        console.error('Error creating patient:', error);
        alert(error.response.data.message);
      });
    } else
    {
      alert('Please enter a valid phone number');
    }
  };

  const handleRazorpay = async () =>
  {
    if (!selectedPatientId)
    {
      alert('Please select a patient');
      return;
    }
    if (selectedTestIds.length === 0)
    {
      alert('Please select at least one test');
      return;
    }

    setLoading(true);
    const options = {
      description: 'Lab Test Booking',
      image: 'https://daaktar.com/assets/images/logo.png',
      currency: 'INR',
      key: 'rzp_live_S2WtenQkjwT34g', // Real key found in AddPatientScreen.tsx
      amount: totalAmount * 100,
      name: 'Daaktar Pharmacy',
      prefill: {
        email: pharmacy?.email || '',
        contact: pharmacy?.phone || '',
        name: pharmacy?.name || ''
      },
      theme: { color: '#6366f1' }
    };

    try
    {
      const data = await RazorpayCheckout.open(options);

      const bookingData = {
        patient_id: selectedPatientId,
        pharmacy_id: pharmacyId,
        test_ids: selectedTestIds,
        note: note,
        amount: totalAmount,
        payment_method: 'razorpay',
        payment_id: data.razorpay_payment_id,
      };

      await apiService.bookDiagnosticTest(bookingData);
      alert('Booking successful!');
      navigation.goBack();
    } catch (error: any)
    {
      // console.error('Razorpay Error:', error);
      // code 2 is user cancelled
      if (error.code !== 2)
      {
        alert('Payment failed');
      }
    } finally
    {
      setLoading(false);
    }
  };

  const handleWalletPay = async () =>
  {
    if (!selectedPatientId)
    {
      alert('Please select a patient');
      return;
    }
    if (selectedTestIds.length === 0)
    {
      alert('Please select at least one test');
      return;
    }

    setLoading(true);
    try
    {
      // 1. Debit wallet
      const debitNote = `Diagnostic Booking for ${patient.find(p => p.id === selectedPatientId)?.name}`;
      const walletResponse = await apiService.debitWallet(pharmacyId, totalAmount, debitNote);

      if (!walletResponse.data.success)
      {
        throw new Error('Wallet debit failed');
      }

      console.log('Wallet debited, new balance:', walletResponse.data.balance);

      // 2. Create booking
      const bookingData = {
        patient_id: selectedPatientId,
        pharmacy_id: pharmacyId,
        test_ids: selectedTestIds,
        note: note,
        amount: totalAmount,
        payment_method: 'wallet',
      };

      await apiService.bookDiagnosticTest(bookingData);
      alert('Booking successful!');
      navigation.goBack();
    } catch (error: any)
    {
      console.error('Wallet Payment Error:', error);
      alert(error.response?.data?.message || 'Failed to process wallet payment');
    } finally
    {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Diagnostic Booking</Text>
        </View>

        <View style={styles.fieldLabelContainer}>
          <Text style={styles.label}>Patient</Text>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() =>
            {
              setIsAddingNewPatient(!isAddingNewPatient);
              setNewPatientName('');
              setNewPatientPhone('');
              setNote('');
              setIsPhoneValid(null);
            }}
          >
            <Text style={styles.addNewText}>
              {isAddingNewPatient ? 'Select Existing' : 'Add New Patient'}
            </Text>
          </TouchableOpacity>
        </View>

        {isAddingNewPatient ? (
          <View style={styles.newPatientForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Name *</Text>
              <TextInput
                style={styles.inlineInput}
                placeholder="Enter patient name"
                value={newPatientName}
                onChangeText={setNewPatientName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={[
                  styles.inlineInput,
                  isPhoneValid === true && { borderColor: '#10b981' }, // emerald green
                  isPhoneValid === false && { borderColor: '#ef4444' }  // red
                ]}
                placeholder="Enter phone number (10 digits)"
                value={newPatientPhone}
                onChangeText={(text) =>
                {
                  setNewPatientPhone(text);
                  if (text.length === 0) setIsPhoneValid(null);
                  if (text.length === 10 && /^[6-9]/.test(text)) setIsPhoneValid(true);
                  if (text.length < 10) setIsPhoneValid(false);
                }}
                keyboardType="phone-pad"
                maxLength={10}
                onBlur={() =>
                {
                  if (newPatientPhone.length === 10)
                  {
                    setIsPhoneValid(true);
                  } else if (newPatientPhone.length > 0)
                  {
                    setIsPhoneValid(false);
                  } else
                  {
                    setIsPhoneValid(null);
                  }
                }}
                textAlign="left"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.inlineInput}
                value={note}
                onChangeText={setNote}
                placeholder="Any additional notes"
              />
            </View>
            <TouchableOpacity
              style={styles.createPatientButton}
              onPress={() => { handleCreatePatient() }}
            >
              <Text style={styles.buttonText}>Create Patient</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <DropDown
            placeholder="-- Select Patient --"
            options={patientOptions}
            selectedValue={selectedPatientId}
            onSelect={setSelectedPatientId}
          />
        )}

        <Text style={styles.label}>Select Tests</Text>
        <DropDown
          placeholder="-- Select Tests --"
          options={testOptions}
          selectedValue={selectedTestIds}
          onSelect={handleTestSelect}
          multiSelect={true}
        />

        {/* Display selected tests */}
        {/* <View style={styles.selectedTestsContainer}>
          {selectedTestIds.map(testId => {
            const test = tests.find(t => t.id === testId);
            return (
              <View key={testId} style={styles.testTag}>
                <Text style={styles.testTagText}>{test?.test_name}</Text>
                <TouchableOpacity onPress={() => handleTestSelect(testId)}>
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View> */}

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Any instructions or notes"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>₹{totalAmount}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation?.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.walletButton}
            onPress={handleWalletPay}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Pay from Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.razorpayButton, loading && { opacity: 0.5 }]}
            onPress={handleRazorpay}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Pay with Razorpay'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#eff6ff',
  },
  scrollContent: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  // card: {
  //   // backgroundColor: '#fff',
  //   // borderRadius: 20,
  //   padding: 24,
  //   // shadowColor: '#000',
  //   // shadowOffset: { width: 0, height: 10 },
  //   // shadowOpacity: 0.1,
  //   // shadowRadius: 20,
  //   // elevation: 5,
  // },
  header: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    // height: 50,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeIcon: {
    fontSize: 20,
    color: '#94a3b8',
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  addNewButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addNewText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  newPatientForm: {
    backgroundColor: '#fefefe',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 6,
  },
  inlineInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
  },
  createPatientButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#334155',
    marginBottom: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  walletButton: {
    backgroundColor: '#10b981', // Green
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  razorpayButton: {
    backgroundColor: '#6366f1', // Indigo
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  selectedTestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  testTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testTagText: {
    fontSize: 12,
    color: '#475569',
    marginRight: 6,
  },
  removeIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
